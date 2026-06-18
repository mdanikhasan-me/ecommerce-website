import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { revalidateHomeSurface } from '@/backend/catalog/storefront-revalidation'
import {
  cleanupManagedAdminUploads,
  persistAdminUpload,
  requireAdminSession,
} from '@/backend/admin/admin-utils'
import { parseAdminBannerPayload } from '@/backend/admin/banner-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()

    const parsed = parseAdminBannerPayload(await req.json())
    if (!parsed.success) throw new Error(parsed.error)
    const payload = parsed.data
    const bannerOwner = payload.title || payload.position || 'banner'
    const imageUrl = await persistAdminUpload(payload.imageUrl, {
      purpose: 'banners',
      ownerSlugOrId: bannerOwner,
      mediaId: 'desktop',
    })
    const mobileImageUrl = await persistAdminUpload(payload.mobileImageUrl, {
      purpose: 'banners',
      ownerSlugOrId: bannerOwner,
      mediaId: 'mobile',
    })

    try {
      const banner = await db.banner.create({
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

      revalidateHomeSurface()

      return NextResponse.json({ banner }, { status: 201 })
    } catch (error) {
      await cleanupManagedAdminUploads([imageUrl, mobileImageUrl])
      throw error
    }
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to create banner')
    return NextResponse.json({ error: message }, { status })
  }
}
