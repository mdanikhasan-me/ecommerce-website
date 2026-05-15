import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import {
  cleanupManagedAdminUploads,
  deleteReplacedAdminUploads,
  persistAdminUpload,
  requireAdminSession,
} from '@/backend/admin/admin-utils'
import { parseAdminBannerPayload } from '@/backend/admin/banner-editor'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminSession()
    const { id } = await params

    const existingBanner = await db.banner.findUnique({ where: { id } })
    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    const parsed = parseAdminBannerPayload(await req.json())
    if (!parsed.success) throw new Error(parsed.error)
    const payload = parsed.data
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
          title: payload.title ?? '',
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to update banner'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to delete banner'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
