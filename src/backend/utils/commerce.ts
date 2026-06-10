// ORDER NUMBER
const ORDER_NUMBER_SUFFIX_LENGTH = 8
const ORDER_NUMBER_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function randomOrderSuffix(): string {
  const bytes = new Uint8Array(ORDER_NUMBER_SUFFIX_LENGTH)
  crypto.getRandomValues(bytes)

  let suffix = ''
  for (const byte of bytes) {
    suffix += ORDER_NUMBER_ALPHABET[byte % ORDER_NUMBER_ALPHABET.length]
  }
  return suffix
}

export function generateOrderNumber(): string {
  const now = new Date()
  const date = [
    String(now.getFullYear()).slice(-2),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  return `BLB-${date}-${randomOrderSuffix()}`
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
