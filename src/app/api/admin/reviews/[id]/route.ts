import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { status } = await req.json()
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const review = await db.review.update({
    where: { id: params.id },
    data: { status: status as any },
    include: { product: { select: { id: true, rating: true, reviewCount: true } } },
  })

  // Update product rating if approved
  if (status === 'APPROVED') {
    const allReviews = await db.review.findMany({
      where: { productId: review.productId, status: 'APPROVED' },
      select: { rating: true },
    })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    await db.product.update({
      where: { id: review.productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    })
  }

  return NextResponse.json({ success: true, review })
}
