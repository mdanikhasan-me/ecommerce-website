import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyCoupon,
  calculateDiscount,
  calculateShipping,
  formatDate,
  generateOrderNumber,
  getRatingLabel,
  formatPrice,
  getStockStatus,
} from '@/backend/utils'

describe('commerce utilities', () => {
  it('formats BDT prices without fractional noise', () => {
    assert.equal(formatPrice(1299), 'Tk 1,299')
    assert.equal(formatPrice(1299.75), 'Tk 1,300')
  })

  it('formats non-BDT prices through Intl currency formatting', () => {
    assert.equal(formatPrice(1299, 'USD', 'en-US'), '$1,299')
    assert.equal(formatPrice(1299.75, 'EUR', 'en-US'), '€1,299.75')
  })

  it('calculates sale discounts only when the sale price is lower', () => {
    assert.equal(calculateDiscount(1000, 800), 20)
    assert.equal(calculateDiscount(1000, 1000), 0)
    assert.equal(calculateDiscount(1000, 1200), 0)
    assert.equal(calculateDiscount(999, 666), 33)
    assert.equal(calculateDiscount(1000, 0), 0)
  })

  it('applies free shipping once the threshold is met', () => {
    assert.equal(calculateShipping(1999), 60)
    assert.equal(calculateShipping(2000), 0)
    assert.equal(calculateShipping(1499, 1500, 80), 80)
    assert.equal(calculateShipping(1500, 1500, 80), 0)
  })

  it('caps percentage coupons at maxDiscount', () => {
    assert.equal(applyCoupon(10_000, { type: 'PERCENTAGE', value: 20, maxDiscount: 1500 }), 1500)
    assert.equal(applyCoupon(10_000, { type: 'PERCENTAGE', value: 20, maxDiscount: null }), 2000)
  })

  it('never lets fixed coupons discount more than subtotal', () => {
    assert.equal(applyCoupon(500, { type: 'FIXED', value: 1000 }), 500)
    assert.equal(applyCoupon(500, { type: 'FIXED', value: 250 }), 250)
  })

  it('generates order numbers with the expected public shape', () => {
    const originalRandom = Math.random
    Math.random = () => 0

    try {
      assert.match(generateOrderNumber(), /^BLB-\d{6}-1000$/)
    } finally {
      Math.random = originalRandom
    }
  })

  it('formats dates with the existing short English date contract', () => {
    assert.equal(formatDate(new Date(2026, 0, 5)), 'Jan 5, 2026')
  })

  it('maps ratings to customer-facing labels at threshold boundaries', () => {
    assert.equal(getRatingLabel(4.5), 'Excellent')
    assert.equal(getRatingLabel(4.49), 'Very Good')
    assert.equal(getRatingLabel(4), 'Very Good')
    assert.equal(getRatingLabel(3.5), 'Good')
    assert.equal(getRatingLabel(3), 'Average')
    assert.equal(getRatingLabel(2.99), 'Poor')
  })

  it('maps stock quantities to customer-facing states', () => {
    assert.deepEqual(getStockStatus(0), { label: 'Out of Stock', color: 'text-red-500', inStock: false })
    assert.deepEqual(getStockStatus(-1), { label: 'Out of Stock', color: 'text-red-500', inStock: false })
    assert.deepEqual(getStockStatus(5), { label: 'Only 5 left', color: 'text-amber-500', inStock: true })
    assert.deepEqual(getStockStatus(3), { label: 'Only 3 left', color: 'text-amber-500', inStock: true })
    assert.deepEqual(getStockStatus(12), { label: 'In Stock', color: 'text-green-600', inStock: true })
  })
})
