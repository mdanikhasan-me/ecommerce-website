import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { db } from '@/backend/database'
import { revalidateProductSurfacesByIds } from '@/backend/catalog/storefront-revalidation'
import { syncProductReviewStats } from '@/backend/reviews'
import { parseAdminReviewModerationPayload } from '@/backend/admin/review-moderation'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const { id } = await params
    const body = await readBoundedJsonBody(req, JSON_BODY_LIMITS.tiny)
    if (!body.success) return body.response
    const parsed = parseAdminReviewModerationPayload(body.data)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const review = await db.review.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, productId: true, status: true },
    })

    const stats = await syncProductReviewStats(review.productId)
    await revalidateProductSurfacesByIds([review.productId]).catch(() => {})

    return NextResponse.json({ success: true, review, stats })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    const { message, status } = toSafeClientError(error, 'Could not moderate review')
    return NextResponse.json({ error: message }, { status })
  }
}
