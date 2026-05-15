import { OrderStatus, PaymentStatus } from '@prisma/client'
import { z } from 'zod'

const optionalNote = z
  .string()
  .trim()
  .max(500, 'Note must be 500 characters or less')
  .optional()
  .nullable()
  .transform((value) => value || null)

const orderStatusPayloadSchema = z.object({
  status: z.nativeEnum(OrderStatus, { message: 'Invalid order status' }),
  note: optionalNote,
})

const paymentStatusPayloadSchema = z.object({
  status: z.nativeEnum(PaymentStatus, { message: 'Invalid payment status' }),
  note: optionalNote,
})

export type AdminOrderStatusPayload = z.infer<typeof orderStatusPayloadSchema>
export type AdminPaymentStatusPayload = z.infer<typeof paymentStatusPayloadSchema>

export function parseAdminOrderStatusPayload(input: unknown) {
  const parsed = orderStatusPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid order status',
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}

export function parseAdminPaymentStatusPayload(input: unknown) {
  const parsed = paymentStatusPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid payment status',
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}
