import { CouponType } from '@prisma/client'
import { z } from 'zod'
import { db } from '@/backend/database'

const flashSaleItemSchema = z
  .object({
    productId: z.string().trim().min(1, 'Flash sale item product is required'),
    discountType: z.nativeEnum(CouponType, { errorMap: () => ({ message: 'Discount type is invalid' }) }),
    discountValue: z.coerce.number().positive('Discount value is invalid'),
    maxQuantity: z
      .union([z.coerce.number().int().positive('Max quantity must be greater than zero'), z.literal(null), z.literal(''), z.undefined()])
      .transform((value) => (value === '' || value === undefined ? null : value)),
  })
  .superRefine((item, ctx) => {
    if (item.discountType === 'PERCENTAGE' && item.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountValue'],
        message: 'Percentage discounts cannot exceed 100%',
      })
    }
  })

const flashSalePayloadSchema = z
  .object({
    title: z.string().trim().min(1, 'Flash sale title is required').max(120, 'Flash sale title is too long'),
    startsAt: z.coerce.date({ errorMap: () => ({ message: 'Start date is invalid' }) }),
    endsAt: z.coerce.date({ errorMap: () => ({ message: 'End date is invalid' }) }),
    isActive: z.boolean().optional().default(true),
    items: z.array(flashSaleItemSchema).min(1, 'At least one flash sale product is required'),
  })
  .superRefine((payload, ctx) => {
    if (payload.startsAt > payload.endsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endsAt'],
        message: 'End date must be later than the start date',
      })
    }

    const seen = new Set<string>()
    for (const item of payload.items) {
      if (seen.has(item.productId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items'],
          message: 'Duplicate products cannot be added to the same flash sale',
        })
        return
      }
      seen.add(item.productId)
    }
  })

export type AdminFlashSalePayload = z.infer<typeof flashSalePayloadSchema>

export function parseAdminFlashSalePayload(input: unknown) {
  const parsed = flashSalePayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid flash sale',
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}

export async function validateFlashSaleProducts(productIds: string[]) {
  const count = await db.product.count({ where: { id: { in: productIds } } })
  if (count !== productIds.length) {
    throw new Error('One or more selected products were not found')
  }
}
