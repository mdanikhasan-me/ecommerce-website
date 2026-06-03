import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  MAX_SEARCH_PAGE,
  MAX_SEARCH_PRICE,
  MAX_SEARCH_QUERY_LENGTH,
  parseSearchParams,
} from '@/backend/catalog/search-params'

describe('search parameter parsing', () => {
  it('preserves valid buyer search parameters', () => {
    const parsed = parseSearchParams({
      q: '  gaming phone  ',
      category: 'electronics',
      minPrice: '1000',
      maxPrice: '50000',
      rating: '4.5',
      inStock: 'true',
      sort: 'price_asc',
      page: '3',
      featured: 'true',
    })

    assert.equal(parsed.q, 'gaming phone')
    assert.equal(parsed.category, 'electronics')
    assert.equal(parsed.minPrice, 1000)
    assert.equal(parsed.maxPrice, 50000)
    assert.equal(parsed.rating, 4.5)
    assert.equal(parsed.inStock, true)
    assert.equal(parsed.sort, 'price_asc')
    assert.equal(parsed.page, 3)
    assert.equal(parsed.featured, true)
    assert.deepEqual(parsed.queryParams, {
      q: 'gaming phone',
      category: 'electronics',
      minPrice: '1000',
      maxPrice: '50000',
      rating: '4.5',
      inStock: 'true',
      sort: 'price_asc',
      page: '3',
      featured: 'true',
    })
  })

  it('falls back safely for malformed numeric and sort parameters', () => {
    const parsed = parseSearchParams({
      q: 'phone',
      page: 'not-a-number',
      minPrice: 'bad',
      maxPrice: 'Infinity',
      rating: 'NaN',
      sort: 'unknown',
    })

    assert.equal(parsed.q, 'phone')
    assert.equal(parsed.page, 1)
    assert.equal(parsed.minPrice, null)
    assert.equal(parsed.maxPrice, null)
    assert.equal(parsed.rating, null)
    assert.equal(parsed.sort, 'popular')
    assert.deepEqual(parsed.queryParams, { q: 'phone' })
  })

  it('bounds page and price values before they reach Prisma', () => {
    const parsed = parseSearchParams({
      page: '999999999999',
      minPrice: '999999999999',
      maxPrice: '-5',
    })

    assert.equal(parsed.page, MAX_SEARCH_PAGE)
    assert.equal(parsed.minPrice, MAX_SEARCH_PRICE)
    assert.equal(parsed.maxPrice, null)
    assert.deepEqual(parsed.queryParams, {
      minPrice: String(MAX_SEARCH_PRICE),
      page: String(MAX_SEARCH_PAGE),
    })
  })

  it('rejects non-integer and non-positive page values', () => {
    assert.equal(parseSearchParams({ page: '0' }).page, 1)
    assert.equal(parseSearchParams({ page: '-5' }).page, 1)
    assert.equal(parseSearchParams({ page: '1.5' }).page, 1)
  })

  it('keeps inverted price ranges safe without rewriting the buyer filter', () => {
    const parsed = parseSearchParams({ minPrice: '50000', maxPrice: '1000' })

    assert.equal(parsed.minPrice, 50000)
    assert.equal(parsed.maxPrice, 1000)
    assert.deepEqual(parsed.queryParams, { minPrice: '50000', maxPrice: '1000' })
  })

  it('sanitizes text and slug-like filters', () => {
    const longQuery = `  ${'phone '.repeat(80)}  `

    const parsed = parseSearchParams({
      q: longQuery,
      category: '../admin',
      inStock: 'false',
      featured: 'yes',
    })

    assert.equal(parsed.q?.length, MAX_SEARCH_QUERY_LENGTH)
    assert.equal(parsed.category, undefined)
    assert.equal(parsed.inStock, false)
    assert.equal(parsed.featured, false)
    assert.deepEqual(parsed.queryParams, { q: parsed.q })
  })

  it('uses the first repeated parameter value', () => {
    const parsed = parseSearchParams({
      q: ['phone', 'laptop'],
      sort: ['newest', 'rating'],
      page: ['2', '3'],
    })

    assert.equal(parsed.q, 'phone')
    assert.equal(parsed.sort, 'newest')
    assert.equal(parsed.page, 2)
  })
})
