import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  MAX_COUPON_AMOUNT,
  MAX_COUPON_CODE_LENGTH,
  MAX_PUBLIC_ID_LENGTH,
  MAX_PUBLIC_PRODUCT_IDS,
  MAX_PUBLIC_SEARCH_QUERY_LENGTH,
  MAX_PUBLIC_SEARCH_WORDS,
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
    assert.equal(parsePublicId('product-123'), 'product-123')
    assert.equal(parsePublicId('../../bad'), null)
    assert.equal(parsePublicId('bad id'), null)
    assert.equal(parsePublicId(''), null)
    assert.equal(parsePublicId('x'.repeat(100)), null)
    assert.equal(parsePublicId(null), null)
  })

  it('accepts exact public id limits and rejects boundary overflows', () => {
    const exactId = 'a'.repeat(MAX_PUBLIC_ID_LENGTH)

    assert.equal(parsePublicId(` ${exactId} `), exactId)
    assert.equal(parsePublicId('a'.repeat(MAX_PUBLIC_ID_LENGTH + 1)), null)
    assert.equal(parsePublicId('valid_123-ABC'), 'valid_123-ABC')
    assert.equal(parsePublicId('bad/segment'), null)
    assert.equal(parsePublicId('bad.segment'), null)
  })

  it('deduplicates, caps, and sanitizes public id lists', () => {
    const ids = ['prod-1', 'prod-1', '../../bad', ...Array.from({ length: MAX_PUBLIC_PRODUCT_IDS + 5 }, (_, index) => `p${index}`)]
    const parsed = parsePublicIdList(ids.join(','))

    assert.equal(parsed[0], 'prod-1')
    assert.equal(parsed.includes('../../bad'), false)
    assert.equal(parsed.length, MAX_PUBLIC_PRODUCT_IDS)
    assert.deepEqual(parsePublicIdList(['prod-1']), [])
  })

  it('trims list entries before dedupe and keeps first valid ids', () => {
    const parsed = parsePublicIdList(' prod-1 ,prod-2,prod-1, bad id ,prod_3,')

    assert.deepEqual(parsed, ['prod-1', 'prod-2', 'prod_3'])
  })

  it('normalizes coupon codes and amounts', () => {
    assert.equal(parseCouponCode(' save500 '), 'SAVE500')
    assert.equal(parseCouponCode('save_500-bd'), 'SAVE_500-BD')
    assert.equal(parseCouponCode('bad code'), null)
    assert.equal(parseCouponCode(''), null)
    assert.equal(parseCouponCode('x'.repeat(100)), null)
    assert.equal(parseCouponAmount(''), 0)
    assert.equal(parseCouponAmount(' 250.75 '), 250.75)
    assert.equal(parseCouponAmount('5000'), 5000)
    assert.equal(parseCouponAmount('999999999999'), MAX_COUPON_AMOUNT)
    assert.equal(parseCouponAmount('-1'), null)
    assert.equal(parseCouponAmount('not-a-number'), null)
    assert.equal(parseCouponAmount(500), null)
  })

  it('accepts exact coupon code limits and rejects unsafe coupon amount values', () => {
    const exactCode = 'x'.repeat(MAX_COUPON_CODE_LENGTH)

    assert.equal(parseCouponCode(` ${exactCode} `), exactCode.toUpperCase())
    assert.equal(parseCouponCode('x'.repeat(MAX_COUPON_CODE_LENGTH + 1)), null)
    assert.equal(parseCouponCode('SAVE.500'), null)
    assert.equal(parseCouponAmount('0'), 0)
    assert.equal(parseCouponAmount('Infinity'), null)
    assert.equal(parseCouponAmount('NaN'), null)
    assert.equal(parseCouponAmount('0x10'), null)
    assert.equal(parseCouponAmount('1e3'), null)
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
    assert.equal(parsePublicSearchQuery(null), null)
    assert.deepEqual(getPublicSearchWords('a bb cc bb dd ee ff gg hh ii jj kk'), [
      'bb',
      'cc',
      'dd',
      'ee',
      'ff',
      'gg',
      'hh',
      'ii',
      'jj',
      'kk',
    ])
  })

  it('normalizes public search whitespace and caps unique searchable words', () => {
    const parsed = parsePublicSearchQuery("  phone\tcase\ncharger  ")
    const cappedWords = getPublicSearchWords('aa bb cc dd ee ff gg hh ii jj kk ll')

    assert.equal(parsed, 'phone case charger')
    assert.equal(cappedWords.length, MAX_PUBLIC_SEARCH_WORDS)
    assert.deepEqual(cappedWords, ['aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh', 'ii', 'jj'])
  })
})
