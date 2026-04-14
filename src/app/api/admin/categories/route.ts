import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import {
  cleanupManagedAdminUploads,
  ensureUniqueSlug,
  persistAdminUpload,
  requireAdminSession,
} from '@/backend/admin/admin-utils'

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession()

    const payload = await req.json()
    if (!payload.name?.trim()) {
      throw new Error('Category name is required')
    }

    if (payload.parentId) {
      const parent = await db.category.findUnique({
        where: { id: payload.parentId },
        select: { id: true },
      })
      if (!parent) throw new Error('Selected parent category was not found')
    }

    const slug = await ensureUniqueSlug('category', payload.slug || payload.name)
    const image = await persistAdminUpload(payload.image, 'categories')

    try {
      const category = await db.category.create({
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

      return NextResponse.json({ category }, { status: 201 })
    } catch (error) {
      await cleanupManagedAdminUploads([image])
      throw error
    }
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to create category' }, { status })
  }
}
