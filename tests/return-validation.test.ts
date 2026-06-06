import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  parseAdminReturnPayload,
  parseAdminReturnStatusFilter,
  resolveReturnOrderStatus,
} from '@/backend/admin/return-editor'

describe('admin return validation', () => {
  it('normalizes refund amounts and notes', () => {
    const parsed = parseAdminReturnPayload({
      status: 'APPROVED',
      refundAmount: '250.5',
      notes: '  approved after inspection  ',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.status, 'APPROVED')
      assert.equal(parsed.data.refundAmount, 250.5)
      assert.equal(parsed.data.notes, 'approved after inspection')
    }
  })

  it('normalizes blank optional values to null', () => {
    const parsed = parseAdminReturnPayload({
      status: 'REQUESTED',
      refundAmount: '',
      notes: '  ',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.refundAmount, null)
      assert.equal(parsed.data.notes, null)
    }
  })

  it('allows omitted optional return fields to normalize safely', () => {
    const parsed = parseAdminReturnPayload({
      status: 'INSPECTED',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.status, 'INSPECTED')
      assert.equal(parsed.data.refundAmount, null)
      assert.equal(parsed.data.notes, null)
    }
  })

  it('rejects invalid statuses and refund amounts', () => {
    const invalidStatus = parseAdminReturnPayload({ status: 'LOST', refundAmount: 10 })
    const invalidRefund = parseAdminReturnPayload({ status: 'APPROVED', refundAmount: -1 })
    const longNotes = parseAdminReturnPayload({
      status: 'APPROVED',
      refundAmount: 10,
      notes: 'n'.repeat(501),
    })

    assert.equal(invalidStatus.success, false)
    assert.equal(invalidRefund.success, false)
    assert.equal(longNotes.success, false)
  })

  it('ignores invalid status filters', () => {
    assert.equal(parseAdminReturnStatusFilter('REFUNDED'), 'REFUNDED')
    assert.equal(parseAdminReturnStatusFilter(null), null)
    assert.equal(parseAdminReturnStatusFilter(''), null)
    assert.equal(parseAdminReturnStatusFilter('LOST'), null)
    assert.equal(parseAdminReturnStatusFilter(' refunded '), null)
  })

  it('maps return statuses to order statuses', () => {
    assert.equal(resolveReturnOrderStatus('REQUESTED', 'DELIVERED'), 'RETURN_REQUESTED')
    assert.equal(resolveReturnOrderStatus('APPROVED', 'DELIVERED'), 'RETURN_REQUESTED')
    assert.equal(resolveReturnOrderStatus('PICKED_UP', 'RETURN_REQUESTED'), 'RETURNED')
    assert.equal(resolveReturnOrderStatus('INSPECTED', 'SHIPPED'), 'RETURNED')
    assert.equal(resolveReturnOrderStatus('REFUNDED', 'RETURNED'), 'REFUNDED')
    assert.equal(resolveReturnOrderStatus('REJECTED', 'RETURN_REQUESTED'), 'DELIVERED')
    assert.equal(resolveReturnOrderStatus('REJECTED', 'SHIPPED'), 'SHIPPED')
  })
})
