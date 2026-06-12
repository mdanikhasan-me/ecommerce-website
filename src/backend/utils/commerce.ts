// ORDER NUMBER
// Short, human-friendly format: BLB-NNNNNN (six digits). The number is drawn
// randomly (not sequential) so it cannot be guessed by incrementing, and all
// order access is authorization-scoped, so a short number is safe from
// enumeration. Uniqueness is guaranteed by the database `@unique` constraint
// plus the collision retry in createBuyerOrder.
export const ORDER_NUMBER_PREFIX = 'BLB'
const ORDER_NUMBER_MIN = 100_000
const ORDER_NUMBER_RANGE = 900_000 // inclusive range 100000..999999
export const ORDER_NUMBER_PATTERN = /^BLB-\d{6}$/

/** Uniform integer in [0, maxExclusive) using rejection sampling (no modulo bias). */
function secureRandomBelow(maxExclusive: number): number {
  const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive
  const buffer = new Uint32Array(1)
  let value: number
  do {
    crypto.getRandomValues(buffer)
    value = buffer[0]
  } while (value >= limit)
  return value % maxExclusive
}

export function generateOrderNumber(): string {
  return `${ORDER_NUMBER_PREFIX}-${ORDER_NUMBER_MIN + secureRandomBelow(ORDER_NUMBER_RANGE)}`
}

// SHIPPING
export function calculateShipping(subtotal: number, freeShippingMin = 2000, baseFee = 60): number {
  return subtotal >= freeShippingMin ? 0 : baseFee
}

// COUPON
export function applyCoupon(
  subtotal: number,
  coupon: { type: string; value: number; maxDiscount?: number | null }
): number {
  if (coupon.type === 'PERCENTAGE') {
    const disc = (subtotal * coupon.value) / 100
    return coupon.maxDiscount ? Math.min(disc, coupon.maxDiscount) : disc
  }
  return Math.min(coupon.value, subtotal)
}
