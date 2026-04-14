import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Sign in to leave a review' }, { status: 401 })

  const { productId, rating, title, body } = await req.json()

  if (!productId || !rating || !body) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })
  if (body.length < 20) return NextResponse.json({ error: 'Review must be at least 20 characters' }, { status: 400 })

  const existing = await db.review.findUnique({
    where: { productId_userId: { productId, userId: session.user.id } },
  })
  if (existing) return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 })

  // Check if verified purchase
  const order = await db.order.findFirst({
    where: {
      userId: session.user.id,
      status: 'DELIVERED',
      items: { some: { productId } },
    },
  })

  const review = await db.review.create({
    data: {
      productId,
      userId: session.user.id,
      rating,
      title,
      body,
      isVerifiedBuy: !!order,
      status: 'PENDING',
    },
  })

  return NextResponse.json({ success: true, review }, { status: 201 })
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
