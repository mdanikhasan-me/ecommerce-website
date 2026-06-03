import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  MAX_COUPON_AMOUNT,
  MAX_PUBLIC_PRODUCT_IDS,
  MAX_PUBLIC_SEARCH_QUERY_LENGTH,
  getPublicSearchWords,
  parseCouponAmount,
  parseCouponCode,
  parsePublicId,
  parsePublicIdList,
  parsePublicSearchQuery,
} from '@/backend/api/public-input'

describe('public API input parsing', () => {
  it('normalizes safe public ids and rejects unsafe ids', () => {
    assert.equal(parsePublicId(' product_123 '), 'product_123')
    assert.equal(parsePublicId('../../bad'), null)
    assert.equal(parsePublicId('x'.repeat(100)), null)
    assert.equal(parsePublicId(null), null)
  })

  it('deduplicates, caps, and sanitizes public id lists', () => {
    const ids = ['prod-1', 'prod-1', '../../bad', ...Array.from({ length: MAX_PUBLIC_PRODUCT_IDS + 5 }, (_, index) => `p${index}`)]
    const parsed = parsePublicIdList(ids.join(','))

    assert.equal(parsed[0], 'prod-1')
    assert.equal(parsed.includes('../../bad'), false)
    assert.equal(parsed.length, MAX_PUBLIC_PRODUCT_IDS)
  })

  it('normalizes coupon codes and amounts', () => {
    assert.equal(parseCouponCode(' save500 '), 'SAVE500')
    assert.equal(parseCouponCode('bad code'), null)
    assert.equal(parseCouponCode('x'.repeat(100)), null)
    assert.equal(parseCouponAmount(''), 0)
    assert.equal(parseCouponAmount('5000'), 5000)
    assert.equal(parseCouponAmount('999999999999'), MAX_COUPON_AMOUNT)
    assert.equal(parseCouponAmount('-1'), null)
    assert.equal(parseCouponAmount('not-a-number'), null)
  })

  it('bounds public search text and words', () => {
    const parsed = parsePublicSearchQuery(` ${'phone '.repeat(80)} `)

    assert.equal(parsed?.length, MAX_PUBLIC_SEARCH_QUERY_LENGTH)
    assert.deepEqual(getPublicSearchWords('phone phone charger case cable cover glass camera laptop tablet'), [
      'phone',
      'charger',
      'case',
      'cable',
      'cover',
      'glass',
      'camera',
      'laptop',
      'tablet',
    ])
    assert.equal(parsePublicSearchQuery('\u0000 a '), 'a')
    assert.equal(parsePublicSearchQuery('   '), null)
  })
})
