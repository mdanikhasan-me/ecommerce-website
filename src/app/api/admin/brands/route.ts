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
      throw new Error('Brand name is required')
    }

    const slug = await ensureUniqueSlug('brand', payload.slug || payload.name)
    const logo = await persistAdminUpload(payload.logo, 'brands')
    const banner = await persistAdminUpload(payload.banner, 'brands')

    try {
      const brand = await db.brand.create({
        data: {
          name: payload.name.trim(),
          slug,
          logo,
          banner,
          description: payload.description?.trim() || null,
          website: payload.website?.trim() || null,
          isActive: payload.isActive ?? true,
          isFeatured: payload.isFeatured ?? false,
          sortOrder: Number(payload.sortOrder ?? 0),
        },
      })

      return NextResponse.json({ brand }, { status: 201 })
    } catch (error) {
      await cleanupManagedAdminUploads([logo, banner])
      throw error
    }
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to create brand' }, { status })
  }
}
