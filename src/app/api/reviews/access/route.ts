import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { parsePublicId } from '@/backend/api/public-input'
import { rateLimit } from '@/backend/security/rate-limit'

const emptyAccess = {
  canReview: false,
  hasDeliveredPurchase: false,
  existingReviewStatus: null,
}

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { key: 'reviews:access', limit: 60, windowMs: 60_000 })
  if (limited) return limited

  const productId = parsePublicId(req.nextUrl.searchParams.get('productId'))
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const session = await auth()
  if (!session?.user) return NextResponse.json(emptyAccess)

  const [deliveredOrder, existingReview] = await Promise.all([
    db.order.findFirst({
      where: {
        userId: session.user.id,
        status: 'DELIVERED',
        items: { some: { productId } },
      },
      select: { id: true },
    }),
    db.review.findUnique({
      where: { productId_userId: { productId, userId: session.user.id } },
      select: { status: true },
    }),
  ])

  return NextResponse.json({
    canReview: Boolean(deliveredOrder && !existingReview),
    hasDeliveredPurchase: Boolean(deliveredOrder),
    existingReviewStatus: existingReview?.status ?? null,
  })
}
