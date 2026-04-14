import { db } from '@/backend/database'

export type ReviewAccessState = {
  canReview: boolean
  hasDeliveredPurchase: boolean
  existingReviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null
}

export async function getApprovedReviewStats(productId: string) {
  const aggregate = await db.review.aggregate({
    where: { productId, status: 'APPROVED' },
    _avg: { rating: true },
    _count: { _all: true },
  })

  const reviewCount = aggregate._count._all
  const rating = reviewCount > 0 ? Math.round((aggregate._avg.rating ?? 0) * 10) / 10 : 0

  return { rating, reviewCount }
}

export async function syncProductReviewStats(productId: string) {
  const stats = await getApprovedReviewStats(productId)

  await db.product.update({
    where: { id: productId },
    data: {
      rating: stats.rating,
      reviewCount: stats.reviewCount,
    },
  })

  return stats
}
