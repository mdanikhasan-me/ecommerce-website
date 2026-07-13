export type CouponDiscountType = 'PERCENTAGE' | 'FIXED'

export type CouponMathRule = {
  type: CouponDiscountType
  value: number
  minOrderAmount: number
  maxDiscount?: number | null
  productIds?: readonly string[]
  categoryIds?: readonly string[]
}

export type CouponMathLine = {
  productId: string
  categoryId: string
  total: number
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateCouponDiscount(
  qualifyingSubtotal: number,
  rule: Pick<CouponMathRule, 'type' | 'value' | 'maxDiscount'>,
) {
  const subtotal = Math.max(0, Number.isFinite(qualifyingSubtotal) ? qualifyingSubtotal : 0)
  const value = Math.max(0, Number.isFinite(rule.value) ? rule.value : 0)

  if (rule.type === 'PERCENTAGE') {
    const percentageDiscount = subtotal * Math.min(value, 100) / 100
    const cappedDiscount = rule.maxDiscount && rule.maxDiscount > 0
      ? Math.min(percentageDiscount, rule.maxDiscount)
      : percentageDiscount
    return roundMoney(Math.min(cappedDiscount, subtotal))
  }

  return roundMoney(Math.min(value, subtotal))
}

export function getPercentageCapThreshold(value: number, maxDiscount: number | null | undefined) {
  if (!Number.isFinite(value) || value <= 0 || !maxDiscount || maxDiscount <= 0) return null
  return roundMoney(maxDiscount * 100 / value)
}

export function evaluateCouponForLines(rule: CouponMathRule, lines: readonly CouponMathLine[]) {
  const productIds = new Set(rule.productIds ?? [])
  const categoryIds = new Set(rule.categoryIds ?? [])
  const hasRestrictions = productIds.size > 0 || categoryIds.size > 0
  const cartSubtotal = roundMoney(lines.reduce((sum, line) => sum + Math.max(0, line.total), 0))
  const qualifyingSubtotal = hasRestrictions
    ? roundMoney(lines.reduce((sum, line) => (
        productIds.has(line.productId) || categoryIds.has(line.categoryId)
          ? sum + Math.max(0, line.total)
          : sum
      ), 0))
    : cartSubtotal
  const minimumOrderAmount = Math.max(0, rule.minOrderAmount)
  const hasEligibleItems = qualifyingSubtotal > 0
  const meetsMinimum = qualifyingSubtotal >= minimumOrderAmount
  const discount = hasEligibleItems && meetsMinimum
    ? calculateCouponDiscount(qualifyingSubtotal, rule)
    : 0

  return {
    cartSubtotal,
    qualifyingSubtotal,
    discount,
    minimumOrderAmount,
    minimumRemaining: roundMoney(Math.max(0, minimumOrderAmount - qualifyingSubtotal)),
    hasRestrictions,
    hasEligibleItems,
    meetsMinimum,
    capStartsAt: rule.type === 'PERCENTAGE'
      ? getPercentageCapThreshold(rule.value, rule.maxDiscount)
      : null,
  }
}
