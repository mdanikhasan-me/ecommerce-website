import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { revalidateHomeSurface } from '@/backend/catalog/storefront-revalidation'
import {
  cleanupManagedAdminUploads,
  deleteReplacedAdminUploads,
  persistAdminUpload,
  requireAdminSession,
} from '@/backend/admin/admin-utils'
import { parseAdminBannerPayload } from '@/backend/admin/banner-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { logSecurityEvent } from '@/backend/security/security-log'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const { id } = await params

    const existingBanner = await db.banner.findUnique({ where: { id } })
    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    const parsed = parseAdminBannerPayload(await req.json())
    if (!parsed.success) throw new Error(parsed.error)
    const payload = parsed.data
    const bannerOwner = existingBanner.id || payload.title || payload.position || 'banner'
    const imageUrl = await persistAdminUpload(payload.imageUrl, {
      purpose: 'banners',
      ownerSlugOrId: bannerOwner,
      mediaId: 'desktop',
    })
    const tabletImageUrl = await persistAdminUpload(payload.tabletImageUrl, {
      purpose: 'banners',
      ownerSlugOrId: bannerOwner,
      mediaId: 'tablet',
    })
    const mobileImageUrl = await persistAdminUpload(payload.mobileImageUrl, {
      purpose: 'banners',
      ownerSlugOrId: bannerOwner,
      mediaId: 'mobile',
    })
    const newUploads = [imageUrl, tabletImageUrl, mobileImageUrl].filter(
      (url): url is string =>
        Boolean(
          url &&
          url.startsWith('/uploads/admin/') &&
          url !== existingBanner.imageUrl &&
          url !== existingBanner.tabletImageUrl &&
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
          tabletImageUrl,
          mobileImageUrl,
          linkUrl: payload.linkUrl,
          buttonLabel: payload.buttonLabel,
          buttonStyle: payload.buttonStyle,
          textPosition: payload.textPosition,
          textTone: payload.textTone,
          overlayStrength: payload.overlayStrength,
          textShadow: payload.textShadow,
          position: payload.position,
          sortOrder: payload.sortOrder,
          isActive: payload.isActive,
          startsAt: payload.startsAt,
          endsAt: payload.endsAt,
        },
      })

      try {
        await deleteReplacedAdminUploads(
          [existingBanner.imageUrl, existingBanner.tabletImageUrl, existingBanner.mobileImageUrl],
          [imageUrl, tabletImageUrl, mobileImageUrl],
        )
      } catch {
        logSecurityEvent({
          type: 'admin_upload_cleanup_failed',
          severity: 'warn',
          route: req.nextUrl.pathname,
          method: req.method,
          statusCode: 200,
          errorCode: 'banner_image_cleanup_failed',
          metadata: {
            feature: 'admin_banner',
          },
        })
      }

      revalidateHomeSurface()

      return NextResponse.json({ banner })
    } catch (error) {
      await cleanupManagedAdminUploads(newUploads)
      throw error
    }
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to update banner')
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const { id } = await params

    const existingBanner = await db.banner.findUnique({ where: { id } })
    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    await db.banner.delete({ where: { id: existingBanner.id } })
    await cleanupManagedAdminUploads([existingBanner.imageUrl, existingBanner.tabletImageUrl, existingBanner.mobileImageUrl])

    revalidateHomeSurface()

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to delete banner')
    return NextResponse.json({ error: message }, { status })
  }
}
