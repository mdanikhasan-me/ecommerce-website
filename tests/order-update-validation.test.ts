import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  parseAdminOrderStatusPayload,
  parseAdminPaymentStatusPayload,
} from '@/backend/admin/order-update-editor'

describe('admin order update validation', () => {
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
})
