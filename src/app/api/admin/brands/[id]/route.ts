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
  params: { id: string }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminSession()

    const existingBrand = await db.brand.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { products: true } },
      },
    })

    if (!existingBrand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const payload = await req.json()
    if (!payload.name?.trim()) {
      throw new Error('Brand name is required')
    }

    const slug = await ensureUniqueSlug('brand', payload.slug || payload.name, existingBrand.id)
    const logo = await persistAdminUpload(payload.logo, 'brands')
    const banner = await persistAdminUpload(payload.banner, 'brands')
    const newUploads = [logo, banner].filter(
      (url): url is string =>
        Boolean(
          url &&
          url.startsWith('/uploads/admin/') &&
          url !== existingBrand.logo &&
          url !== existingBrand.banner,
        ),
    )

    try {
      const brand = await db.brand.update({
        where: { id: existingBrand.id },
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

      try {
        await deleteReplacedAdminUploads(
          [existingBrand.logo, existingBrand.banner],
          [logo, banner],
        )
      } catch (cleanupError) {
        console.error('Could not delete replaced brand images', cleanupError)
      }

      return NextResponse.json({ brand })
    } catch (error) {
      await cleanupManagedAdminUploads(newUploads)
      throw error
    }
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to update brand' }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminSession()

    const existingBrand = await db.brand.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { products: true } },
      },
    })

    if (!existingBrand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    if (existingBrand._count.products > 0) {
      await db.brand.update({
        where: { id: existingBrand.id },
        data: { isActive: false },
      })

      return NextResponse.json({ success: true, deleted: false, archived: true })
    }

    await db.brand.delete({ where: { id: existingBrand.id } })
    await cleanupManagedAdminUploads([existingBrand.logo, existingBrand.banner])

    return NextResponse.json({ success: true, deleted: true })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to delete brand' }, { status })
  }
}
