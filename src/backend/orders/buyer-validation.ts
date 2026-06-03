import { PaymentMethod } from '@prisma/client'
import { z } from 'zod'

import { parseCouponCode, parsePublicId } from '@/backend/api/public-input'

export const MAX_ORDER_ITEMS = 100
export const MAX_ORDER_ITEM_QUANTITY = 1000
export const MAX_ORDER_NOTES_LENGTH = 500
export const MAX_ORDER_IMAGE_URL_LENGTH = 500

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type ParsedBuyerOrderItem = {
  productId: string
  variantId: string | null
  quantity: number
  imageUrl: string | null
}

export type ParsedBuyerOrderAddress = {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  district: string
  division: string
  postalCode: string | null
}

export type ParsedBuyerOrderPayload = {
  items: ParsedBuyerOrderItem[]
  address: ParsedBuyerOrderAddress
  paymentMethod: PaymentMethod
  notes?: string
  couponCode: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && Object.values(PaymentMethod).includes(value as PaymentMethod)
}

function parseRequiredText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > maxLength) return null
  return trimmed
}

function parseOptionalText(value: unknown, maxLength: number) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLength)
}

function parseQuantity(value: unknown) {
  const normalized = typeof value === 'string' ? value.trim() : value
  const quantity = typeof normalized === 'number'
    ? normalized
    : typeof normalized === 'string' && /^\d+$/.test(normalized)
      ? Number(normalized)
      : NaN

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ORDER_ITEM_QUANTITY) return null
  return quantity
}

function parseImageUrl(value: unknown) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_ORDER_IMAGE_URL_LENGTH) return null

  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')) {
    return trimmed
  }

  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:' ? trimmed : null
  } catch {
    return null
  }
}

function parseBuyerOrderAddress(value: unknown): ParsedBuyerOrderAddress | null {
  if (!isRecord(value)) return null

  const fullName = parseRequiredText(value.fullName, 120)
  const phone = parseRequiredText(value.phone, 20)
  const addressLine1 = parseRequiredText(value.addressLine1, 200)
  const city = parseRequiredText(value.city, 80)
  const district = parseRequiredText(value.district, 80)
  const division = parseRequiredText(value.division, 80)

  if (!fullName || !phone || !addressLine1 || !city || !district || !division) return null

  return {
    fullName,
    phone,
    addressLine1,
    addressLine2: parseOptionalText(value.addressLine2, 200),
    city,
    district,
    division,
    postalCode: parseOptionalText(value.postalCode, 20),
  }
}

export function parseBuyerOrderPayload(
  input: unknown,
  availablePaymentMethods: ReadonlySet<string>,
): ParseResult<ParsedBuyerOrderPayload> {
  if (!isRecord(input)) {
    return { success: false, error: 'Invalid order request' }
  }

  if (!isPaymentMethod(input.paymentMethod) || !availablePaymentMethods.has(input.paymentMethod)) {
    return {
      success: false,
      error: 'This payment method is not configured yet. Please use an active checkout method.',
    }
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { success: false, error: 'Cart is empty' }
  }

  if (input.items.length > MAX_ORDER_ITEMS) {
    return { success: false, error: 'Cart has too many items' }
  }

  const address = parseBuyerOrderAddress(input.address)
  if (!address) {
    return { success: false, error: 'Delivery address is incomplete' }
  }

  const items: ParsedBuyerOrderItem[] = []
  for (const rawItem of input.items) {
    if (!isRecord(rawItem)) {
      return { success: false, error: 'One or more products are no longer available' }
    }

    const productId = parsePublicId(rawItem.productId)
    if (!productId) {
      return { success: false, error: 'One or more products are no longer available' }
    }

    const quantity = parseQuantity(rawItem.quantity)
    if (!quantity) {
      return { success: false, error: 'Invalid item quantity' }
    }

    const hasVariant = rawItem.variantId !== undefined && rawItem.variantId !== null && rawItem.variantId !== ''
    const variantId = hasVariant ? parsePublicId(rawItem.variantId) : null
    if (hasVariant && !variantId) {
      return { success: false, error: 'Invalid product variant' }
    }

    items.push({
      productId,
      variantId,
      quantity,
      imageUrl: parseImageUrl(rawItem.imageUrl),
    })
  }

  let couponCode: string | null = null
  if (input.couponCode !== undefined && input.couponCode !== null && input.couponCode !== '') {
    couponCode = parseCouponCode(input.couponCode)
    if (!couponCode) {
      return { success: false, error: 'Invalid coupon code' }
    }
  }

  const notes = parseOptionalText(input.notes, MAX_ORDER_NOTES_LENGTH) ?? undefined

  return {
    success: true,
    data: {
      items,
      address,
      paymentMethod: input.paymentMethod,
      notes,
      couponCode,
    },
  }
}

const buyerReturnRequestSchema = z.object({
  orderId: z
    .string()
    .trim()
    .refine((value) => parsePublicId(value) !== null, 'Invalid return request')
    .transform((value) => parsePublicId(value)!),
  reason: z.string().trim().min(3).max(120),
  description: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal(''))
    .transform((value) => value || null),
})

export type ParsedBuyerReturnRequestPayload = z.infer<typeof buyerReturnRequestSchema>

export function parseBuyerReturnRequestPayload(input: unknown): ParseResult<ParsedBuyerReturnRequestPayload> {
  const parsed = buyerReturnRequestSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid return request',
    }
  }

  return {
    success: true,
    data: parsed.data,
  }
}
