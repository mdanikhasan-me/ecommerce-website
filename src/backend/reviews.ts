import { db } from '@/backend/database'
import { z } from 'zod'

export type ReviewAccessState = {
  canReview: boolean
  hasDeliveredPurchase: boolean
  existingReviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null
}

const reviewPayloadSchema = z.object({
  productId: z.string().trim().min(1, 'Product is required'),
  rating: z.coerce.number().int('Rating must be 1 to 5').min(1, 'Rating must be 1 to 5').max(5, 'Rating must be 1 to 5'),
  title: z
    .string()
    .trim()
    .max(120, 'Review title is too long')
    .optional()
    .nullable()
    .transform((value) => value || null),
  body: z.string().trim().min(20, 'Review must be at least 20 characters').max(4000, 'Review is too long'),
})

export type ReviewPayload = z.infer<typeof reviewPayloadSchema>

export function parseReviewPayload(input: unknown) {
  const parsed = reviewPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid review',
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
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
