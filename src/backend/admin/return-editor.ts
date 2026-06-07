import { OrderStatus, ReturnStatus } from '@prisma/client'
import { z } from 'zod'

const PLAIN_REFUND_AMOUNT_PATTERN = /^\d+(?:\.\d+)?$/

const refundAmountSchema = z.unknown().transform((value, ctx) => {
  const parsed = parseRefundAmount(value)
  if (!parsed.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Refund amount is invalid',
    })
    return z.NEVER
  }

  return parsed.value
})

const returnPayloadSchema = z.object({
  status: z.nativeEnum(ReturnStatus, { message: 'Invalid return status' }),
  refundAmount: refundAmountSchema,
  notes: z
    .string()
    .trim()
    .max(500, 'Notes must be 500 characters or less')
    .optional()
    .nullable()
    .transform((value) => value || null),
})

export type AdminReturnPayload = z.infer<typeof returnPayloadSchema>

function parseRefundAmount(value: unknown): { success: true; value: number | null } | { success: false } {
  if (value === null || value === undefined) return { success: true, value: null }

  if (typeof value === 'string') {
    const normalized = value.trim()
    if (!normalized) return { success: true, value: null }
    if (!PLAIN_REFUND_AMOUNT_PATTERN.test(normalized)) return { success: false }

    const parsed = Number(normalized)
    if (!Number.isFinite(parsed)) return { success: false }
    return { success: true, value: parsed }
  }

  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return { success: true, value }
  }

  return { success: false }
}

export function parseAdminReturnPayload(input: unknown) {
  const parsed = returnPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid return request',
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}

export function parseAdminReturnStatusFilter(value: string | null) {
  if (!value) return null
  return Object.values(ReturnStatus).includes(value as ReturnStatus) ? (value as ReturnStatus) : null
}

export function resolveReturnOrderStatus(nextStatus: ReturnStatus, currentOrderStatus: OrderStatus): OrderStatus {
  switch (nextStatus) {
    case ReturnStatus.REQUESTED:
    case ReturnStatus.APPROVED:
      return OrderStatus.RETURN_REQUESTED
    case ReturnStatus.PICKED_UP:
    case ReturnStatus.INSPECTED:
      return OrderStatus.RETURNED
    case ReturnStatus.REFUNDED:
      return OrderStatus.REFUNDED
    case ReturnStatus.REJECTED:
      return currentOrderStatus === OrderStatus.RETURN_REQUESTED ? OrderStatus.DELIVERED : currentOrderStatus
    default:
      return currentOrderStatus
  }
}
