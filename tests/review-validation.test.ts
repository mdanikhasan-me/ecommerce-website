import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { MAX_PUBLIC_ID_LENGTH } from '@/backend/api/public-input'
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

  it('accepts exact public review field boundaries', () => {
    const productId = 'a'.repeat(MAX_PUBLIC_ID_LENGTH)
    const title = 'x'.repeat(120)
    const body = 'b'.repeat(20)
    const parsed = parseReviewPayload({
      productId: ` ${productId} `,
      rating: '1',
      title,
      body,
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.productId, productId)
      assert.equal(parsed.data.rating, 1)
      assert.equal(parsed.data.title, title)
      assert.equal(parsed.data.body, body)
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

  it('normalizes null and omitted titles to null', () => {
    const nullTitle = parseReviewPayload({
      productId: 'product-1',
      rating: 5,
      title: null,
      body: 'This review has enough useful detail to pass validation.',
    })
    const omittedTitle = parseReviewPayload({
      productId: 'product-1',
      rating: 5,
      body: 'This review has enough useful detail to pass validation.',
    })

    assert.equal(nullTitle.success, true)
    assert.equal(omittedTitle.success, true)
    if (nullTitle.success) {
      assert.equal(nullTitle.data.title, null)
    }
    if (omittedTitle.success) {
      assert.equal(omittedTitle.data.title, null)
    }
  })

  it('accepts underscore and dash product ids after trimming', () => {
    const parsed = parseReviewPayload({
      productId: ' product_1-variant ',
      rating: '4',
      body: 'This review has enough useful detail to pass validation.',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.productId, 'product_1-variant')
      assert.equal(parsed.data.rating, 4)
      assert.equal(parsed.data.title, null)
    }
  })

  it('rejects ratings outside the 1 to 5 range or non-integer values', () => {
    assert.equal(parseReviewPayload({ productId: 'p1', rating: 0, body: 'This body is long enough to pass.' }).success, false)
    assert.equal(parseReviewPayload({ productId: 'p1', rating: 6, body: 'This body is long enough to pass.' }).success, false)
    assert.equal(parseReviewPayload({ productId: 'p1', rating: 4.5, body: 'This body is long enough to pass.' }).success, false)
    assert.equal(parseReviewPayload({ productId: 'p1', rating: '4.5', body: 'This body is long enough to pass.' }).success, false)
  })

  it('rejects short and oversized review text', () => {
    const shortBody = parseReviewPayload({ productId: 'p1', rating: 5, body: 'Too short' })
    const longBody = parseReviewPayload({ productId: 'p1', rating: 5, body: 'x'.repeat(4001) })
    const longTitle = parseReviewPayload({
      productId: 'p1',
      rating: 5,
      title: 'x'.repeat(121),
      body: 'This review has enough useful detail to pass validation.',
    })

    assert.equal(shortBody.success, false)
    assert.equal(longBody.success, false)
    assert.equal(longTitle.success, false)
  })

  it('rejects malformed review payloads before review database work', () => {
    const malformedPayloads: unknown[] = [
      null,
      [],
      'review',
      {},
      { rating: 5, body: 'This review has enough useful detail to pass validation.' },
      { productId: 'p1', body: 'This review has enough useful detail to pass validation.' },
      { productId: 'p1', rating: 5 },
      { productId: 12, rating: 5, body: 'This review has enough useful detail to pass validation.' },
      { productId: 'p1', rating: 'not-a-number', body: 'This review has enough useful detail to pass validation.' },
      { productId: 'p1', rating: 5, body: 12 },
    ]

    for (const payload of malformedPayloads) {
      const parsed = parseReviewPayload(payload)

      assert.equal(parsed.success, false)
    }
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
