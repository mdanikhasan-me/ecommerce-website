import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import {
  cleanupManagedAdminUploads,
  deleteManagedAdminUpload,
  deleteReplacedAdminUploads,
  ensureUniqueSlug,
  persistAdminUpload,
  requireAdminSession,
} from '@/backend/admin/admin-utils'
import { assertValidCategoryParent, parseAdminCategoryPayload } from '@/backend/admin/category-editor'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminSession()
    const { id } = await params

    const existingCategory = await db.category.findUnique({
      where: { id },
      include: {
        children: { select: { id: true } },
      },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const parsed = parseAdminCategoryPayload(await req.json())
    if (!parsed.success) throw new Error(parsed.error)
    const payload = parsed.data
    await assertValidCategoryParent(payload.parentId, existingCategory.id)

    const slug = await ensureUniqueSlug(payload.slug ?? payload.name, existingCategory.id)
    const image = await persistAdminUpload(payload.image, 'categories')
    const newUploads = [image].filter(
      (url): url is string => Boolean(url && url !== existingCategory.image && url.startsWith('/uploads/admin/')),
    )

    try {
      const category = await db.category.update({
        where: { id: existingCategory.id },
        data: {
          name: payload.name,
          slug,
          description: payload.description,
          image,
          icon: payload.icon,
          isActive: payload.isActive,
          sortOrder: payload.sortOrder,
          parentId: payload.parentId,
        },
      })

      try {
        await deleteReplacedAdminUploads([existingCategory.image], [image])
      } catch (cleanupError) {
        console.error('Could not delete replaced category image', cleanupError)
      }

      return NextResponse.json({ category })
    } catch (error) {
      await cleanupManagedAdminUploads(newUploads)
      throw error
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to update category'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminSession()
    const { id } = await params

    const existingCategory = await db.category.findUnique({
      where: { id },
      include: {
        children: { select: { id: true } },
        _count: { select: { products: true } },
      },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (existingCategory.children.length > 0 || existingCategory._count.products > 0) {
      await db.category.update({
        where: { id: existingCategory.id },
        data: { isActive: false },
      })

      return NextResponse.json({ success: true, deleted: false, archived: true })
    }

    await db.category.delete({ where: { id: existingCategory.id } })
    await deleteManagedAdminUpload(existingCategory.image)

    return NextResponse.json({ success: true, deleted: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to delete category'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
