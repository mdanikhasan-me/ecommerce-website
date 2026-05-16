// ORDER NUMBER
export function generateOrderNumber(): string {
  const now = new Date()
  const date = [
    String(now.getFullYear()).slice(-2),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `BLB-${date}-${random}`
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
