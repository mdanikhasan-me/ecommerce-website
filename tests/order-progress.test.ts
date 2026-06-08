import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  getOrderProgressState,
  isOrderProgressStepComplete,
  isOrderProgressStepCurrent,
  ORDER_PROGRESS_STEPS,
} from '@/backend/orders/order-progress'

describe('buyer order progress mapping', () => {
  it('keeps normal fulfillment statuses on the five visible order steps', () => {
    assert.equal(ORDER_PROGRESS_STEPS.length, 5)

    const shipped = getOrderProgressState('SHIPPED')

    assert.equal(shipped.tone, 'active')
    assert.equal(shipped.currentIndex, 3)
    assert.equal(shipped.completedIndex, 3)
    assert.equal(shipped.progressWidthClass, 'w-3/4')
    assert.equal(isOrderProgressStepComplete(shipped, 3), true)
    assert.equal(isOrderProgressStepComplete(shipped, 4), false)
    assert.equal(isOrderProgressStepCurrent(shipped, 3), true)
  })

  it('does not mark future fulfillment steps complete for pending or cancelled orders', () => {
    const pending = getOrderProgressState('PENDING')
    assert.equal(pending.completedIndex, 0)
    assert.equal(pending.progressWidthClass, 'w-0')
    assert.equal(isOrderProgressStepComplete(pending, 1), false)

    const cancelled = getOrderProgressState('CANCELLED')
    assert.equal(cancelled.tone, 'cancelled')
    assert.equal(cancelled.currentIndex, 0)
    assert.equal(cancelled.completedIndex, 0)
    assert.equal(isOrderProgressStepComplete(cancelled, 1), false)
  })

  it('shows return and refund states as post-delivery without the normal active tone', () => {
    for (const status of ['RETURN_REQUESTED', 'RETURNED', 'REFUND_REQUESTED', 'REFUNDED']) {
      const state = getOrderProgressState(status)

      assert.equal(state.tone, 'return')
      assert.equal(state.currentIndex, 4)
      assert.equal(state.completedIndex, 4)
      assert.equal(state.progressWidthClass, 'w-full')
      assert.equal(isOrderProgressStepCurrent(state, 4), true)
    }
  })
})
