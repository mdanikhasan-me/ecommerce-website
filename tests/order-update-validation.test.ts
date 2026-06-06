import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { OrderStatus, PaymentStatus } from '@prisma/client'
import {
  parseAdminOrderStatusPayload,
  parseAdminPaymentStatusPayload,
} from '@/backend/admin/order-update-editor'

describe('admin order update validation', () => {
  it('documents supported order and payment status enums', () => {
    assert.deepEqual(Object.values(OrderStatus), [
      'PENDING',
      'CONFIRMED',
      'PACKED',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'RETURN_REQUESTED',
      'RETURNED',
      'REFUND_REQUESTED',
      'REFUNDED',
    ])
    assert.deepEqual(Object.values(PaymentStatus), [
      'PENDING',
      'PAID',
      'FAILED',
      'REFUNDED',
      'PARTIALLY_REFUNDED',
    ])
  })

  it('accepts all operational order statuses and trims notes', () => {
    const parsed = parseAdminOrderStatusPayload({
      status: 'RETURN_REQUESTED',
      note: '  customer requested a return  ',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.status, 'RETURN_REQUESTED')
      assert.equal(parsed.data.note, 'customer requested a return')
    }
  })

  it('accepts every order status with omitted notes', () => {
    for (const status of Object.values(OrderStatus)) {
      const parsed = parseAdminOrderStatusPayload({ status })

      assert.equal(parsed.success, true, status)
      if (parsed.success) {
        assert.equal(parsed.data.status, status)
        assert.equal(parsed.data.note, null)
      }
    }
  })

  it('accepts exact order note length boundaries', () => {
    const parsed = parseAdminOrderStatusPayload({
      status: 'PACKED',
      note: 'x'.repeat(500),
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.note?.length, 500)
    }
  })

  it('normalizes blank order status notes to null', () => {
    const parsed = parseAdminOrderStatusPayload({
      status: 'DELIVERED',
      note: '  ',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.note, null)
    }
  })

  it('normalizes omitted order status notes to null', () => {
    const parsed = parseAdminOrderStatusPayload({
      status: 'CONFIRMED',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.note, null)
    }
  })

  it('rejects invalid order statuses and long order notes', () => {
    const parsed = parseAdminOrderStatusPayload({
      status: 'LOST_IN_TRANSIT',
    })
    const longNote = parseAdminOrderStatusPayload({
      status: 'PACKED',
      note: 'x'.repeat(501),
    })

    assert.equal(parsed.success, false)
    assert.equal(longNote.success, false)
  })

  it('rejects malformed order status payloads without coercing status values', () => {
    assert.equal(parseAdminOrderStatusPayload(null).success, false)
    assert.equal(parseAdminOrderStatusPayload(['DELIVERED']).success, false)
    assert.equal(parseAdminOrderStatusPayload({}).success, false)
    assert.equal(parseAdminOrderStatusPayload({ status: ' delivered ' }).success, false)
    assert.equal(parseAdminOrderStatusPayload({ status: null }).success, false)
  })

  it('accepts payment statuses and trims notes', () => {
    const parsed = parseAdminPaymentStatusPayload({
      status: 'PARTIALLY_REFUNDED',
      note: '  partial refund issued  ',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.status, 'PARTIALLY_REFUNDED')
      assert.equal(parsed.data.note, 'partial refund issued')
    }
  })

  it('accepts every payment status with omitted notes', () => {
    for (const status of Object.values(PaymentStatus)) {
      const parsed = parseAdminPaymentStatusPayload({ status })

      assert.equal(parsed.success, true, status)
      if (parsed.success) {
        assert.equal(parsed.data.status, status)
        assert.equal(parsed.data.note, null)
      }
    }
  })

  it('accepts exact payment note length boundaries', () => {
    const parsed = parseAdminPaymentStatusPayload({
      status: 'PAID',
      note: 'x'.repeat(500),
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.note?.length, 500)
    }
  })

  it('normalizes blank payment notes to null', () => {
    const parsed = parseAdminPaymentStatusPayload({
      status: 'REFUNDED',
      note: '',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.note, null)
    }
  })

  it('rejects invalid payment statuses and long admin notes', () => {
    const longNote = parseAdminPaymentStatusPayload({
      status: 'PAID',
      note: 'x'.repeat(501),
    })
    const invalidStatus = parseAdminPaymentStatusPayload({
      status: 'SETTLED',
    })

    assert.equal(longNote.success, false)
    assert.equal(invalidStatus.success, false)
  })

  it('rejects malformed payment status payloads without coercing status values', () => {
    assert.equal(parseAdminPaymentStatusPayload(null).success, false)
    assert.equal(parseAdminPaymentStatusPayload(['PAID']).success, false)
    assert.equal(parseAdminPaymentStatusPayload({}).success, false)
    assert.equal(parseAdminPaymentStatusPayload({ status: ' paid ' }).success, false)
    assert.equal(parseAdminPaymentStatusPayload({ status: null }).success, false)
  })
})
