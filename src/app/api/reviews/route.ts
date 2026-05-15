import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { parseReviewPayload, syncProductReviewStats } from '@/backend/reviews'
import { rateLimit } from '@/backend/security/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, { key: 'reviews:create', limit: 6, windowMs: 60_000 })
    if (limited) return limited

    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Sign in to leave a review' }, { status: 401 })

    const parsed = parseReviewPayload(await req.json())
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const { productId, rating, title, body } = parsed.data

    const existing = await db.review.findUnique({
      where: { productId_userId: { productId, userId: session.user.id } },
    })
    if (existing) return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 })

    const deliveredOrder = await db.order.findFirst({
      where: {
        userId: session.user.id,
        status: 'DELIVERED',
        items: { some: { productId } },
      },
      orderBy: { deliveredAt: 'desc' },
    })
    if (!deliveredOrder) {
      return NextResponse.json({ error: 'You can leave a review after this order is delivered' }, { status: 403 })
    }

    const review = await db.review.create({
      data: {
        productId,
        userId: session.user.id,
        orderId: deliveredOrder.id,
        rating,
        title,
        body,
        images: [],
        isVerifiedBuy: true,
        status: 'APPROVED',
      },
    })

    const stats = await syncProductReviewStats(productId)

    return NextResponse.json({ success: true, review, stats }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Could not submit review' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId')
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const reviews = await db.review.findMany({
    where: { productId, status: 'APPROVED' },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json({ reviews })
}
