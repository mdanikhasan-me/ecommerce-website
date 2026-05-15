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

  it('rejects invalid order statuses', () => {
    const parsed = parseAdminOrderStatusPayload({
      status: 'LOST_IN_TRANSIT',
    })

    assert.equal(parsed.success, false)
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

  it('rejects long admin notes', () => {
    const parsed = parseAdminPaymentStatusPayload({
      status: 'PAID',
      note: 'x'.repeat(501),
    })

    assert.equal(parsed.success, false)
  })
})
