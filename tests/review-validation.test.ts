import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseReviewPayload } from '@/backend/reviews'

describe('review validation', () => {
  it('coerces valid rating and trims text fields', () => {
    const parsed = parseReviewPayload({
      productId: ' product-1 ',
      rating: '5',
      title: '  Great product  ',
      body: '  This product worked very well for my daily use.  ',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.productId, 'product-1')
      assert.equal(parsed.data.rating, 5)
      assert.equal(parsed.data.title, 'Great product')
      assert.equal(parsed.data.body, 'This product worked very well for my daily use.')
    }
  })

  it('normalizes blank titles to null', () => {
    const parsed = parseReviewPayload({
      productId: 'product-1',
      rating: 4,
      title: '   ',
      body: 'This review has enough useful detail to pass validation.',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.title, null)
    }
  })

  it('rejects ratings outside the 1 to 5 range', () => {
    assert.equal(parseReviewPayload({ productId: 'p1', rating: 0, body: 'This body is long enough to pass.' }).success, false)
    assert.equal(parseReviewPayload({ productId: 'p1', rating: 6, body: 'This body is long enough to pass.' }).success, false)
  })

  it('rejects short review bodies', () => {
    const parsed = parseReviewPayload({ productId: 'p1', rating: 5, body: 'Too short' })

    assert.equal(parsed.success, false)
  })

  it('rejects unsafe product ids before review database work', () => {
    const invalidPath = parseReviewPayload({
      productId: '../../bad',
      rating: 5,
      body: 'This review has enough useful detail to pass validation.',
    })
    const tooLong = parseReviewPayload({
      productId: 'x'.repeat(100),
      rating: 5,
      body: 'This review has enough useful detail to pass validation.',
    })

    assert.equal(invalidPath.success, false)
    assert.equal(tooLong.success, false)
  })
})
