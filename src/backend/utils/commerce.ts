// ORDER NUMBER
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `BLB-${timestamp}-${random}`
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
