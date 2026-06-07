import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import {
  cleanupManagedAdminUploads,
  deleteManagedAdminUpload,
  deleteReplacedAdminUploads,
  ensureUniqueSlug,
  isManagedAdminUpload,
  persistAdminUpload,
  requireAdminSession,
} from '@/backend/admin/admin-utils'
import { assertValidCategoryParent, parseAdminCategoryPayload } from '@/backend/admin/category-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { logSecurityEvent } from '@/backend/security/security-log'

interface RouteContext {
  params: Promise<{ id: string }>
}

function revalidateCategorySurfaces(input: {
  slugs?: Array<string | null | undefined>
  adminCategoryIds?: Array<string | null | undefined>
}) {
  revalidatePath('/')
  revalidatePath('/category')
  revalidatePath('/admin/categories')

  for (const slug of input.slugs ?? []) {
    if (slug) {
      revalidatePath(`/category/${slug}`)
    }
  }

  for (const id of input.adminCategoryIds ?? []) {
    if (id) {
      revalidatePath(`/admin/categories/${id}`)
    }
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

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
    const image = await persistAdminUpload(payload.image, {
      purpose: 'categories',
      ownerSlugOrId: slug,
      mediaId: 'image',
      categoryKind: payload.parentId ? 'subcategory' : 'category',
    })
    const newUploads = [image].filter(
      (url): url is string => Boolean(url && url !== existingCategory.image && isManagedAdminUpload(url)),
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
      } catch {
        logSecurityEvent({
          type: 'admin_upload_cleanup_failed',
          severity: 'warn',
          route: req.nextUrl.pathname,
          method: req.method,
          statusCode: 200,
          errorCode: 'category_image_cleanup_failed',
          metadata: {
            feature: 'admin_category',
          },
        })
      }

      revalidateCategorySurfaces({
        slugs: [existingCategory.slug, category.slug],
        adminCategoryIds: [existingCategory.id],
      })

      return NextResponse.json({ category })
    } catch (error) {
      await cleanupManagedAdminUploads(newUploads)
      throw error
    }
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to update category')
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

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

      revalidateCategorySurfaces({
        slugs: [existingCategory.slug],
        adminCategoryIds: [existingCategory.id],
      })

      return NextResponse.json({ success: true, deleted: false, archived: true })
    }

    await db.category.delete({ where: { id: existingCategory.id } })
    await deleteManagedAdminUpload(existingCategory.image)

    revalidateCategorySurfaces({
      slugs: [existingCategory.slug],
      adminCategoryIds: [existingCategory.id],
    })

    return NextResponse.json({ success: true, deleted: true })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to delete category')
    return NextResponse.json({ error: message }, { status })
  }
}
