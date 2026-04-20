import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import {
  cleanupManagedAdminUploads,
  deleteReplacedAdminUploads,
  persistAdminUpload,
  requireAdminSession,
} from '@/backend/admin/admin-utils'

interface RouteContext {
  params: Promise<{ id: string }>
}

function normalizeBannerPayload(payload: any) {
  const startsAt = payload.startsAt ? new Date(payload.startsAt) : null
  const endsAt = payload.endsAt ? new Date(payload.endsAt) : null
  if (startsAt && Number.isNaN(startsAt.getTime())) throw new Error('Start date is invalid')
  if (endsAt && Number.isNaN(endsAt.getTime())) throw new Error('End date is invalid')
  if (startsAt && endsAt && startsAt > endsAt) throw new Error('End date must be later than the start date')

  return {
    title: payload.title?.trim() || '',
    subtitle: payload.subtitle?.trim() || null,
    imageUrl: payload.imageUrl?.trim() || '',
    mobileImageUrl: payload.mobileImageUrl || null,
    linkUrl: payload.linkUrl?.trim() || null,
    position: payload.position?.trim() || 'hero',
    sortOrder: Number(payload.sortOrder ?? 0),
    isActive: payload.isActive ?? true,
    startsAt,
    endsAt,
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminSession()
    const { id } = await params

    const existingBanner = await db.banner.findUnique({ where: { id } })
    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    const payload = normalizeBannerPayload(await req.json())
    const imageUrl = await persistAdminUpload(payload.imageUrl, 'banners')
    const mobileImageUrl = await persistAdminUpload(payload.mobileImageUrl, 'banners')
    const newUploads = [imageUrl, mobileImageUrl].filter(
      (url): url is string =>
        Boolean(
          url &&
          url.startsWith('/uploads/admin/') &&
          url !== existingBanner.imageUrl &&
          url !== existingBanner.mobileImageUrl,
        ),
    )

    try {
      const banner = await db.banner.update({
        where: { id: existingBanner.id },
        data: {
          title: payload.title,
          subtitle: payload.subtitle,
          imageUrl: imageUrl ?? '',
          mobileImageUrl,
          linkUrl: payload.linkUrl,
          position: payload.position,
          sortOrder: payload.sortOrder,
          isActive: payload.isActive,
          startsAt: payload.startsAt,
          endsAt: payload.endsAt,
        },
      })

      try {
        await deleteReplacedAdminUploads(
          [existingBanner.imageUrl, existingBanner.mobileImageUrl],
          [imageUrl, mobileImageUrl],
        )
      } catch (cleanupError) {
        console.error('Could not delete replaced banner images', cleanupError)
      }

      return NextResponse.json({ banner })
    } catch (error) {
      await cleanupManagedAdminUploads(newUploads)
      throw error
    }
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to update banner' }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminSession()
    const { id } = await params

    const existingBanner = await db.banner.findUnique({ where: { id } })
    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    await db.banner.delete({ where: { id: existingBanner.id } })
    await cleanupManagedAdminUploads([existingBanner.imageUrl, existingBanner.mobileImageUrl])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to delete banner' }, { status })
  }
}
