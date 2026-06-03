import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  MAX_ORDER_ITEMS,
  MAX_ORDER_ITEM_QUANTITY,
  parseBuyerOrderPayload,
  parseBuyerReturnRequestPayload,
} from '@/backend/orders/buyer-validation'

const availablePaymentMethods = new Set(['CASH_ON_DELIVERY'])

function validOrderPayload(overrides: Record<string, unknown> = {}) {
  return {
    paymentMethod: 'CASH_ON_DELIVERY',
    items: [
      {
        productId: 'prod_123',
        variantId: 'variant-1',
        quantity: 2,
        imageUrl: '/assets/products/phone.jpg',
      },
    ],
    address: {
      fullName: '  Test Buyer  ',
      phone: '01712345678',
      addressLine1: 'House 12, Road 4',
      addressLine2: '  Near market  ',
      city: 'Dhaka',
      district: 'Dhaka',
      division: 'Dhaka',
      postalCode: '1207',
    },
    notes: '  Please call before delivery.  ',
    couponCode: ' save500 ',
    ...overrides,
  }
}

describe('buyer order payload validation', () => {
  it('normalizes a valid checkout payload before database lookups', () => {
    const parsed = parseBuyerOrderPayload(validOrderPayload(), availablePaymentMethods)

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.paymentMethod, 'CASH_ON_DELIVERY')
      assert.equal(parsed.data.items[0].productId, 'prod_123')
      assert.equal(parsed.data.items[0].variantId, 'variant-1')
      assert.equal(parsed.data.items[0].quantity, 2)
      assert.equal(parsed.data.items[0].imageUrl, '/assets/products/phone.jpg')
      assert.equal(parsed.data.address.fullName, 'Test Buyer')
      assert.equal(parsed.data.address.addressLine2, 'Near market')
      assert.equal(parsed.data.couponCode, 'SAVE500')
      assert.equal(parsed.data.notes, 'Please call before delivery.')
    }
  })

  it('rejects unavailable payment methods and empty carts with existing error messages', () => {
    const badPayment = parseBuyerOrderPayload(validOrderPayload({ paymentMethod: 'BKASH' }), availablePaymentMethods)
    const emptyCart = parseBuyerOrderPayload(validOrderPayload({ items: [] }), availablePaymentMethods)

    assert.deepEqual(badPayment, {
      success: false,
      error: 'This payment method is not configured yet. Please use an active checkout method.',
    })
    assert.deepEqual(emptyCart, { success: false, error: 'Cart is empty' })
  })

  it('rejects unsafe product ids, variant ids, and coupon codes before database lookups', () => {
    const badProduct = parseBuyerOrderPayload(validOrderPayload({
      items: [{ productId: '../../bad', quantity: 1 }],
    }), availablePaymentMethods)
    const badVariant = parseBuyerOrderPayload(validOrderPayload({
      items: [{ productId: 'prod-1', variantId: '../../bad', quantity: 1 }],
    }), availablePaymentMethods)
    const badCoupon = parseBuyerOrderPayload(validOrderPayload({ couponCode: 'SAVE 500' }), availablePaymentMethods)

    assert.deepEqual(badProduct, { success: false, error: 'One or more products are no longer available' })
    assert.deepEqual(badVariant, { success: false, error: 'Invalid product variant' })
    assert.deepEqual(badCoupon, { success: false, error: 'Invalid coupon code' })
  })

  it('rejects invalid, non-finite, fractional, and oversized item quantities', () => {
    for (const quantity of [0, -1, '0', '1.5', 1.5, Number.POSITIVE_INFINITY, Number.NaN, MAX_ORDER_ITEM_QUANTITY + 1]) {
      const parsed = parseBuyerOrderPayload(validOrderPayload({
        items: [{ productId: 'prod-1', quantity }],
      }), availablePaymentMethods)

      assert.deepEqual(parsed, { success: false, error: 'Invalid item quantity' })
    }
  })

  it('caps item count and strips unsafe client image URLs', () => {
    const tooManyItems = Array.from({ length: MAX_ORDER_ITEMS + 1 }, (_, index) => ({
      productId: `prod-${index}`,
      quantity: 1,
    }))
    const tooMany = parseBuyerOrderPayload(validOrderPayload({ items: tooManyItems }), availablePaymentMethods)
    const unsafeImage = parseBuyerOrderPayload(validOrderPayload({
      items: [{ productId: 'prod-1', quantity: 1, imageUrl: 'javascript:alert(1)' }],
    }), availablePaymentMethods)

    assert.deepEqual(tooMany, { success: false, error: 'Cart has too many items' })
    assert.equal(unsafeImage.success, true)
    if (unsafeImage.success) {
      assert.equal(unsafeImage.data.items[0].imageUrl, null)
    }
  })

  it('rejects incomplete or oversized delivery address fields', () => {
    const missingAddress = parseBuyerOrderPayload(validOrderPayload({ address: { fullName: 'Test Buyer' } }), availablePaymentMethods)
    const oversizedPhone = parseBuyerOrderPayload(validOrderPayload({
      address: {
        fullName: 'Test Buyer',
        phone: '0'.repeat(30),
        addressLine1: 'House 12',
        city: 'Dhaka',
        district: 'Dhaka',
        division: 'Dhaka',
      },
    }), availablePaymentMethods)

    assert.deepEqual(missingAddress, { success: false, error: 'Delivery address is incomplete' })
    assert.deepEqual(oversizedPhone, { success: false, error: 'Delivery address is incomplete' })
  })
})

describe('buyer return request validation', () => {
  it('normalizes valid return request payloads before database lookups', () => {
    const parsed = parseBuyerReturnRequestPayload({
      orderId: ' order_123 ',
      reason: '  Wrong item  ',
      description: '  Box was damaged.  ',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.orderId, 'order_123')
      assert.equal(parsed.data.reason, 'Wrong item')
      assert.equal(parsed.data.description, 'Box was damaged.')
    }
  })

  it('rejects unsafe order ids and out-of-bounds return text', () => {
    const badOrderId = parseBuyerReturnRequestPayload({ orderId: '../../bad', reason: 'Wrong item' })
    const shortReason = parseBuyerReturnRequestPayload({ orderId: 'order_123', reason: 'No' })
    const longDescription = parseBuyerReturnRequestPayload({
      orderId: 'order_123',
      reason: 'Wrong item',
      description: 'x'.repeat(1001),
    })

    assert.equal(badOrderId.success, false)
    if (!badOrderId.success) assert.equal(badOrderId.error, 'Invalid return request')
    assert.equal(shortReason.success, false)
    assert.equal(longDescription.success, false)
  })
})
