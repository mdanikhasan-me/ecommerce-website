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

    const payload = await req.json()
    if (!payload.name?.trim()) {
      throw new Error('Category name is required')
    }
    if (payload.parentId && payload.parentId === existingCategory.id) {
      throw new Error('A category cannot be its own parent')
    }

    if (payload.parentId) {
      const parent = await db.category.findUnique({
        where: { id: payload.parentId },
        select: { id: true },
      })
      if (!parent) throw new Error('Selected parent category was not found')
    }

    const slug = await ensureUniqueSlug('category', payload.slug || payload.name, existingCategory.id)
    const image = await persistAdminUpload(payload.image, 'categories')
    const newUploads = [image].filter(
      (url): url is string => Boolean(url && url !== existingCategory.image && url.startsWith('/uploads/admin/')),
    )

    try {
      const category = await db.category.update({
        where: { id: existingCategory.id },
        data: {
          name: payload.name.trim(),
          slug,
          description: payload.description?.trim() || null,
          image,
          icon: payload.icon?.trim() || null,
          isActive: payload.isActive ?? true,
          sortOrder: Number(payload.sortOrder ?? 0),
          parentId: payload.parentId || null,
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
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to update category' }, { status })
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
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to delete category' }, { status })
  }
}
