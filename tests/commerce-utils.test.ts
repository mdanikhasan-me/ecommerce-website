import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyCoupon,
  calculateDiscount,
  calculateShipping,
  formatPrice,
  getStockStatus,
} from '@/backend/utils'

describe('commerce utilities', () => {
  it('formats BDT prices without fractional noise', () => {
    assert.equal(formatPrice(1299), 'Tk 1,299')
    assert.equal(formatPrice(1299.75), 'Tk 1,300')
  })

  it('calculates sale discounts only when the sale price is lower', () => {
    assert.equal(calculateDiscount(1000, 800), 20)
    assert.equal(calculateDiscount(1000, 1000), 0)
    assert.equal(calculateDiscount(1000, 1200), 0)
  })

  it('applies free shipping once the threshold is met', () => {
    assert.equal(calculateShipping(1999), 60)
    assert.equal(calculateShipping(2000), 0)
  })

  it('caps percentage coupons at maxDiscount', () => {
    assert.equal(applyCoupon(10_000, { type: 'PERCENTAGE', value: 20, maxDiscount: 1500 }), 1500)
  })

  it('never lets fixed coupons discount more than subtotal', () => {
    assert.equal(applyCoupon(500, { type: 'FIXED', value: 1000 }), 500)
  })

  it('maps stock quantities to customer-facing states', () => {
    assert.deepEqual(getStockStatus(0), { label: 'Out of Stock', color: 'text-red-500', inStock: false })
    assert.deepEqual(getStockStatus(3), { label: 'Only 3 left', color: 'text-amber-500', inStock: true })
    assert.deepEqual(getStockStatus(12), { label: 'In Stock', color: 'text-green-600', inStock: true })
  })
})
