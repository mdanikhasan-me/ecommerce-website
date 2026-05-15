import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { db } from '@/backend/database'
import { syncProductReviewStats } from '@/backend/reviews'
import { parseAdminReviewModerationPayload } from '@/backend/admin/review-moderation'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession()
    const { id } = await params
    const parsed = parseAdminReviewModerationPayload(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const review = await db.review.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, productId: true, status: true },
    })

    const stats = await syncProductReviewStats(review.productId)

    return NextResponse.json({ success: true, review, stats })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    const message = error instanceof Error ? error.message : 'Could not moderate review'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
