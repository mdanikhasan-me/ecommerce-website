import { CouponType } from '@prisma/client'
import { z } from 'zod'
import { db } from '@/backend/database'
import { toSafeClientErrorMessage } from '@/backend/security/client-error'

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null)

const optionalPositiveNumber = (message: string) =>
  z
    .union([z.coerce.number().positive(message), z.literal(null), z.literal(''), z.undefined()])
    .transform((value) => (value === '' || value === undefined ? null : value))

const optionalPositiveInteger = (message: string) =>
  z
    .union([z.coerce.number().int(message).positive(message), z.literal(null), z.literal(''), z.undefined()])
    .transform((value) => (value === '' || value === undefined ? null : value))

const optionalDate = (message: string) =>
  z
    .union([z.coerce.date(), z.literal(null), z.literal(''), z.undefined()])
    .transform((value) => {
      if (value === '' || value === null || value === undefined) return null
      if (Number.isNaN(value.getTime())) throw new Error(message)
      return value
    })

const couponPayloadSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, 'Coupon code is required')
      .max(40, 'Coupon code is too long')
      .regex(/^[A-Za-z0-9_-]+$/, 'Coupon code can use letters, numbers, underscores, and hyphens only'),
    name: z.string().trim().min(1, 'Coupon name is required').max(120, 'Coupon name is too long'),
    description: optionalTrimmedString(500),
    type: z.nativeEnum(CouponType, { errorMap: () => ({ message: 'Discount type is invalid' }) }),
    value: z.coerce.number().positive('Discount value is required').max(10_000_000, 'Discount value is too large'),
    minOrderAmount: z.coerce.number().min(0, 'Minimum order amount cannot be negative').max(10_000_000, 'Minimum order amount is too large').default(0),
    maxDiscount: optionalPositiveNumber('Max discount must be greater than zero'),
    usageLimit: optionalPositiveInteger('Usage limit must be a whole number greater than zero'),
    perUserLimit: z.coerce.number().int('Per user limit must be a whole number').min(1, 'Per user limit must be at least 1').default(1),
    isActive: z.boolean().optional().default(true),
    startsAt: optionalDate('Start date is invalid'),
    expiresAt: optionalDate('Expiry date is invalid'),
    categoryIds: z.array(z.string().trim().min(1)).max(500, 'Too many categories selected').optional().default([]),
    productIds: z.array(z.string().trim().min(1)).max(500, 'Too many products selected').optional().default([]),
  })
  .superRefine((payload, ctx) => {
    if (payload.type === 'PERCENTAGE' && payload.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'Percentage coupons cannot exceed 100%',
      })
    }

    if (payload.startsAt && payload.expiresAt && payload.startsAt >= payload.expiresAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiresAt'],
        message: 'Expiry date must be later than the start date',
      })
    }

    if (payload.maxDiscount && payload.maxDiscount > 10_000_000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxDiscount'],
        message: 'Maximum discount is too large',
      })
    }

    if (payload.usageLimit && payload.perUserLimit > payload.usageLimit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['perUserLimit'],
        message: 'Per customer limit cannot exceed the total usage limit',
      })
    }
  })

export type AdminCouponPayload = z.infer<typeof couponPayloadSchema>

export function parseAdminCouponPayload(input: unknown) {
  const parsed = couponPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid coupon',
    }
  }

  return {
    success: true as const,
    data: {
      ...parsed.data,
      code: parsed.data.code.toUpperCase(),
      maxDiscount: parsed.data.type === 'PERCENTAGE' ? parsed.data.maxDiscount : null,
      categoryIds: Array.from(new Set(parsed.data.categoryIds)),
      productIds: Array.from(new Set(parsed.data.productIds)),
    },
  }
}

export async function validateCouponRelations(categoryIds: string[], productIds: string[]) {
  const [categoryCount, productCount] = await Promise.all([
    categoryIds.length
      ? db.category.count({ where: { id: { in: categoryIds } } })
      : Promise.resolve(0),
    productIds.length
      ? db.product.count({ where: { id: { in: productIds } } })
      : Promise.resolve(0),
  ])

  if (categoryIds.length && categoryCount !== categoryIds.length) {
    throw new Error('One or more selected categories were not found')
  }
  if (productIds.length && productCount !== productIds.length) {
    throw new Error('One or more selected products were not found')
  }
}

export function resolveCouponMutationError(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
    return 'Coupon code already exists'
  }

  return toSafeClientErrorMessage(error, fallback)
}
