import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import {
  cleanupManagedAdminUploads,
  persistAdminUpload,
  requireAdminSession,
} from '@/backend/admin/admin-utils'

function normalizeBannerPayload(payload: any) {
  if (!payload.title?.trim()) throw new Error('Banner title is required')
  if (!payload.imageUrl?.trim()) throw new Error('Desktop image is required')

  const startsAt = payload.startsAt ? new Date(payload.startsAt) : null
  const endsAt = payload.endsAt ? new Date(payload.endsAt) : null
  if (startsAt && Number.isNaN(startsAt.getTime())) throw new Error('Start date is invalid')
  if (endsAt && Number.isNaN(endsAt.getTime())) throw new Error('End date is invalid')
  if (startsAt && endsAt && startsAt > endsAt) throw new Error('End date must be later than the start date')

  return {
    title: payload.title.trim(),
    subtitle: payload.subtitle?.trim() || null,
    imageUrl: payload.imageUrl,
    mobileImageUrl: payload.mobileImageUrl || null,
    linkUrl: payload.linkUrl?.trim() || null,
    position: payload.position?.trim() || 'hero',
    sortOrder: Number(payload.sortOrder ?? 0),
    isActive: payload.isActive ?? true,
    startsAt,
    endsAt,
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession()

    const payload = normalizeBannerPayload(await req.json())
    const imageUrl = await persistAdminUpload(payload.imageUrl, 'banners')
    const mobileImageUrl = await persistAdminUpload(payload.mobileImageUrl, 'banners')

    try {
      const banner = await db.banner.create({
        data: {
          title: payload.title,
          subtitle: payload.subtitle,
          imageUrl: imageUrl!,
          mobileImageUrl,
          linkUrl: payload.linkUrl,
          position: payload.position,
          sortOrder: payload.sortOrder,
          isActive: payload.isActive,
          startsAt: payload.startsAt,
          endsAt: payload.endsAt,
        },
      })

      return NextResponse.json({ banner }, { status: 201 })
    } catch (error) {
      await cleanupManagedAdminUploads([imageUrl, mobileImageUrl])
      throw error
    }
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to create banner' }, { status })
  }
}
