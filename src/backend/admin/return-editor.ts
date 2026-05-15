import { OrderStatus, ReturnStatus } from '@prisma/client'
import { z } from 'zod'

const returnPayloadSchema = z.object({
  status: z.nativeEnum(ReturnStatus, { message: 'Invalid return status' }),
  refundAmount: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return null
      return value
    },
    z.union([z.null(), z.coerce.number().min(0, 'Refund amount is invalid')]),
  ),
  notes: z
    .string()
    .trim()
    .max(500, 'Notes must be 500 characters or less')
    .optional()
    .nullable()
    .transform((value) => value || null),
})

export type AdminReturnPayload = z.infer<typeof returnPayloadSchema>

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
