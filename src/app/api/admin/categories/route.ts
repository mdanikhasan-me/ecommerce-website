import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import {
  cleanupManagedAdminUploads,
  ensureUniqueSlug,
  persistAdminUpload,
  requireAdminSession,
} from '@/backend/admin/admin-utils'
import { assertValidCategoryParent, parseAdminCategoryPayload } from '@/backend/admin/category-editor'

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession()

    const parsed = parseAdminCategoryPayload(await req.json())
    if (!parsed.success) throw new Error(parsed.error)
    const payload = parsed.data
    await assertValidCategoryParent(payload.parentId)

    const slug = await ensureUniqueSlug(payload.slug ?? payload.name)
    const image = await persistAdminUpload(payload.image, 'categories')

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
    const message = error instanceof Error ? error.message : 'Unable to create category'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
