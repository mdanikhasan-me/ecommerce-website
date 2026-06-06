import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  parseAdminCouponPayload,
  resolveCouponMutationError,
} from '@/backend/admin/coupon-editor'

const validCoupon = {
  code: ' save10 ',
  name: ' Save 10 percent ',
  description: '  Promo description  ',
  type: 'PERCENTAGE',
  value: 10,
  minOrderAmount: 1000,
  maxDiscount: 500,
  usageLimit: 100,
  perUserLimit: 1,
  isActive: true,
  startsAt: '2026-01-01T00:00:00.000Z',
  expiresAt: '2026-01-31T00:00:00.000Z',
  categoryIds: ['cat-1', 'cat-1', 'cat-2'],
  productIds: ['prod-1', 'prod-1'],
}

describe('admin coupon validation', () => {
  it('normalizes coupon text and relation ids', () => {
    const parsed = parseAdminCouponPayload(validCoupon)

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.code, 'SAVE10')
      assert.equal(parsed.data.name, 'Save 10 percent')
      assert.equal(parsed.data.description, 'Promo description')
      assert.deepEqual(parsed.data.categoryIds, ['cat-1', 'cat-2'])
      assert.deepEqual(parsed.data.productIds, ['prod-1'])
      assert.equal(parsed.data.isActive, true)
    }
  })

  it('normalizes blank optional fields to null', () => {
    const parsed = parseAdminCouponPayload({
      code: 'FLAT100',
      name: 'Flat 100',
      type: 'FIXED',
      value: 100,
      description: '',
      maxDiscount: '',
      usageLimit: '',
      startsAt: '',
      expiresAt: '',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.description, null)
      assert.equal(parsed.data.maxDiscount, null)
      assert.equal(parsed.data.usageLimit, null)
      assert.equal(parsed.data.startsAt, null)
      assert.equal(parsed.data.expiresAt, null)
      assert.equal(parsed.data.perUserLimit, 1)
    }
  })

  it('defaults optional limits and relation lists for fixed coupons', () => {
    const parsed = parseAdminCouponPayload({
      code: ' flat100 ',
      name: ' Flat 100 ',
      type: 'FIXED',
      value: '100',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.code, 'FLAT100')
      assert.equal(parsed.data.minOrderAmount, 0)
      assert.equal(parsed.data.maxDiscount, null)
      assert.equal(parsed.data.usageLimit, null)
      assert.equal(parsed.data.perUserLimit, 1)
      assert.equal(parsed.data.isActive, true)
      assert.deepEqual(parsed.data.categoryIds, [])
      assert.deepEqual(parsed.data.productIds, [])
    }
  })

  it('trims relation ids before deduping them', () => {
    const parsed = parseAdminCouponPayload({
      ...validCoupon,
      categoryIds: [' cat-1 ', 'cat-1', 'cat-2'],
      productIds: [' prod-1 ', 'prod-1'],
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.deepEqual(parsed.data.categoryIds, ['cat-1', 'cat-2'])
      assert.deepEqual(parsed.data.productIds, ['prod-1'])
    }
  })

  it('allows exact percentage boundary values and explicit inactive coupons', () => {
    const parsed = parseAdminCouponPayload({
      ...validCoupon,
      value: '100',
      minOrderAmount: '0',
      maxDiscount: null,
      usageLimit: null,
      isActive: false,
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.value, 100)
      assert.equal(parsed.data.minOrderAmount, 0)
      assert.equal(parsed.data.maxDiscount, null)
      assert.equal(parsed.data.usageLimit, null)
      assert.equal(parsed.data.isActive, false)
    }
  })

  it('rejects percentage discounts above 100', () => {
    const parsed = parseAdminCouponPayload({ ...validCoupon, value: 101 })

    assert.equal(parsed.success, false)
  })

  it('rejects schedules where expiry is before start', () => {
    const parsed = parseAdminCouponPayload({
      ...validCoupon,
      startsAt: '2026-02-01T00:00:00.000Z',
      expiresAt: '2026-01-01T00:00:00.000Z',
    })

    assert.equal(parsed.success, false)
  })

  it('rejects invalid discount amounts, limits, and blank relation ids', () => {
    const zeroValue = parseAdminCouponPayload({ ...validCoupon, value: 0 })
    const negativeMinimumOrder = parseAdminCouponPayload({ ...validCoupon, minOrderAmount: -1 })
    const zeroMaxDiscount = parseAdminCouponPayload({ ...validCoupon, maxDiscount: 0 })
    const usageLimit = parseAdminCouponPayload({ ...validCoupon, usageLimit: -1 })
    const zeroUsageLimit = parseAdminCouponPayload({ ...validCoupon, usageLimit: 0 })
    const perUserLimit = parseAdminCouponPayload({ ...validCoupon, perUserLimit: 0 })
    const fractionalPerUserLimit = parseAdminCouponPayload({ ...validCoupon, perUserLimit: 1.5 })
    const blankRelationId = parseAdminCouponPayload({ ...validCoupon, categoryIds: ['cat-1', '  '] })

    assert.equal(zeroValue.success, false)
    assert.equal(negativeMinimumOrder.success, false)
    assert.equal(zeroMaxDiscount.success, false)
    assert.equal(usageLimit.success, false)
    assert.equal(zeroUsageLimit.success, false)
    assert.equal(perUserLimit.success, false)
    assert.equal(fractionalPerUserLimit.success, false)
    assert.equal(blankRelationId.success, false)
  })

  it('rejects malformed required coupon fields', () => {
    const blankCode = parseAdminCouponPayload({ ...validCoupon, code: '  ' })
    const longCode = parseAdminCouponPayload({ ...validCoupon, code: 'C'.repeat(41) })
    const blankName = parseAdminCouponPayload({ ...validCoupon, name: '  ' })
    const longName = parseAdminCouponPayload({ ...validCoupon, name: 'N'.repeat(121) })
    const longDescription = parseAdminCouponPayload({
      ...validCoupon,
      description: 'D'.repeat(501),
    })
    const invalidType = parseAdminCouponPayload({ ...validCoupon, type: 'BOGO' })
    const invalidDate = parseAdminCouponPayload({ ...validCoupon, startsAt: 'not-a-date' })

    assert.equal(blankCode.success, false)
    assert.equal(longCode.success, false)
    assert.equal(blankName.success, false)
    assert.equal(longName.success, false)
    assert.equal(longDescription.success, false)
    assert.equal(invalidType.success, false)
    assert.equal(invalidDate.success, false)
  })

  it('resolves coupon mutation errors without leaking unsafe internals', () => {
    const duplicate = resolveCouponMutationError({ code: 'P2002' }, 'Unable to save coupon')
    const safeRelationError = resolveCouponMutationError(
      new Error('One or more selected products were not found'),
      'Unable to save coupon',
    )
    const unsafeDatabaseError = resolveCouponMutationError(
      new Error('Invalid `prisma.coupon.update()` invocation: Unique constraint failed'),
      'Unable to save coupon',
    )

    assert.equal(duplicate, 'Coupon code already exists')
    assert.equal(safeRelationError, 'One or more selected products were not found')
    assert.equal(unsafeDatabaseError, 'Unable to save coupon')
  })
})
