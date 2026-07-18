import { NextRequest, NextResponse } from 'next/server'

import { resolveTrafficSource } from '@/backend/analytics/traffic-source'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { recordProductView } from '@/backend/commerce-stats'
import { parsePublicId } from '@/backend/api/public-input'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { rateLimit } from '@/backend/security/rate-limit'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'

const VIEWER_COOKIE = 'boilabin_viewer'
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365
const VIEWER_COOKIE_PATTERN = /^v1\.([0-9a-f-]{36})\.([a-z-]{1,24})$/i
const LEGACY_VIEWER_PATTERN = /^[0-9a-f-]{36}$/i

function parseViewerCookie(value: string | undefined) {
  if (!value) return null
  const current = value.match(VIEWER_COOKIE_PATTERN)
  if (current) return { id: current[1].toLowerCase(), source: current[2].toLowerCase(), legacy: false }
  if (LEGACY_VIEWER_PATTERN.test(value)) return { id: value.toLowerCase(), source: null, legacy: true }
  return null
}

async function readAttribution(req: NextRequest) {
  const body = await readBoundedJsonBody(req, JSON_BODY_LIMITS.tiny)
  if (body.success) {
    const input = body.data as Record<string, unknown>
    return {
      referrer: typeof input?.referrer === 'string' ? input.referrer.slice(0, 1000) : null,
      landingUrl: typeof input?.landingUrl === 'string' ? input.landingUrl.slice(0, 1000) : null,
    }
  }
  return { referrer: null, landingUrl: null }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = protectMutationRequest(req)
  if (blocked) return blocked

  const limited = rateLimit(req, { key: 'products:view', limit: 120, windowMs: 60_000 })
  if (limited) return limited

  const { id: rawId } = await params
  const id = parsePublicId(rawId)

  if (!id) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const product = await db.product.findFirst({
    where: getBuyerVisibleProductWhere({ id }),
    select: { id: true },
  })

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const session = await auth()
  const attribution = await readAttribution(req)
  const existingViewer = parseViewerCookie(req.cookies.get(VIEWER_COOKIE)?.value)
  const generatedViewerId = existingViewer?.id ?? crypto.randomUUID()
  const source = existingViewer?.source ?? resolveTrafficSource({
    ...attribution,
    siteOrigin: req.nextUrl.origin,
  })
  const viewerKey = session?.user?.id
    ? `user:${session.user.id}`
    : `guest:${generatedViewerId}|source:${source}`
  const alternateViewerKeys = !session?.user && existingViewer?.legacy
    ? [`guest:${generatedViewerId}`]
    : []

  const counted = await recordProductView({
    productId: product.id,
    viewerKey,
    userId: session?.user?.id ?? null,
    alternateViewerKeys,
  })

  const response = NextResponse.json({ success: true, counted })

  if (!session?.user && (!existingViewer || existingViewer.legacy)) {
    response.cookies.set({
      name: VIEWER_COOKIE,
      value: `v1.${generatedViewerId}.${source}`,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ONE_YEAR_IN_SECONDS,
    })
  }

  return response
}
