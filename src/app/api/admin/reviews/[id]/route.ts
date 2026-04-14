import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { syncProductReviewStats } from '@/backend/reviews'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const { id } = await params

  const { status } = await req.json()
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const review = await db.review.update({
    where: { id },
    data: { status: status as 'APPROVED' | 'REJECTED' },
    select: { id: true, productId: true, status: true },
  })

  const stats = await syncProductReviewStats(review.productId)

  return NextResponse.json({ success: true, review, stats })
}
