import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import {
  cleanupManagedAdminUploads,
  ensureUniqueSlug,
  persistAdminUpload,
  requireAdminSession,
} from '@/backend/admin/admin-utils'
import { assertValidCategoryParent, parseAdminCategoryPayload } from '@/backend/admin/category-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()

    const parsed = parseAdminCategoryPayload(await req.json())
    if (!parsed.success) throw new Error(parsed.error)
    const payload = parsed.data
    await assertValidCategoryParent(payload.parentId)

    const slug = await ensureUniqueSlug(payload.slug ?? payload.name)
    const image = await persistAdminUpload(payload.image, {
      purpose: 'categories',
      ownerSlugOrId: slug,
      mediaId: 'image',
      categoryKind: payload.parentId ? 'subcategory' : 'category',
    })

    try {
      const category = await db.category.create({
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

      return NextResponse.json({ category }, { status: 201 })
    } catch (error) {
      await cleanupManagedAdminUploads([image])
      throw error
    }
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to create category')
    return NextResponse.json({ error: message }, { status })
  }
}
