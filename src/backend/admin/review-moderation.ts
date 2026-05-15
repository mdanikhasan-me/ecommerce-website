import { ReviewStatus } from '@prisma/client'
import { z } from 'zod'

const reviewModerationPayloadSchema = z.object({
  status: z.enum([ReviewStatus.APPROVED, ReviewStatus.REJECTED], { message: 'Invalid review status' }),
})

export function parseAdminReviewModerationPayload(input: unknown) {
  const parsed = reviewModerationPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid review status',
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}
