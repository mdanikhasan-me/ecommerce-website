import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  DEFAULT_CATALOG_LIMIT,
  MAX_CATALOG_LIMIT,
  MAX_PRODUCT_IDS,
  MAX_SEARCH_PAGE,
  MAX_SEARCH_PRICE,
  MAX_SEARCH_QUERY_LENGTH,
  parseCategorySearchParams,
  parseProductApiParams,
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

  it('parses URLSearchParams search inputs with normalized booleans and text', () => {
    const params = new URLSearchParams()
    params.append('q', ' phone\u0000case ')
    params.append('category', ' Electronics ')
    params.append('inStock', ' true ')
    params.append('featured', ' TRUE ')
    params.append('rating', '5')

    const parsed = parseSearchParams(params)

    assert.equal(parsed.q, 'phone case')
    assert.equal(parsed.category, 'electronics')
    assert.equal(parsed.inStock, true)
    assert.equal(parsed.featured, false)
    assert.equal(parsed.rating, 5)
    assert.deepEqual(parsed.queryParams, {
      q: 'phone case',
      category: 'electronics',
      rating: '5',
      inStock: 'true',
    })
  })

  it('keeps decimal prices and ratings bounded without rounding', () => {
    const parsed = parseSearchParams({
      minPrice: '100.5',
      maxPrice: '250.75',
      rating: '4.5',
    })

    assert.equal(parsed.minPrice, 100.5)
    assert.equal(parsed.maxPrice, 250.75)
    assert.equal(parsed.rating, 4.5)
    assert.deepEqual(parsed.queryParams, {
      minPrice: '100.5',
      maxPrice: '250.75',
      rating: '4.5',
    })
  })

  it('parses valid category listing filters without database access', () => {
    const parsed = parseCategorySearchParams({
      category: 'mobile-phones',
      minPrice: '5000',
      maxPrice: '25000',
      rating: '4',
      inStock: 'true',
      sort: 'rating',
      page: '5',
      q: 'ignored on category pages',
      featured: 'true',
    })

    assert.equal(parsed.category, 'mobile-phones')
    assert.equal(parsed.minPrice, 5000)
    assert.equal(parsed.maxPrice, 25000)
    assert.equal(parsed.rating, 4)
    assert.equal(parsed.inStock, true)
    assert.equal(parsed.sort, 'rating')
    assert.equal(parsed.page, 5)
    assert.deepEqual(parsed.queryParams, {
      category: 'mobile-phones',
      minPrice: '5000',
      maxPrice: '25000',
      rating: '4',
      inStock: 'true',
      sort: 'rating',
      page: '5',
    })
  })

  it('falls back safely for malformed category listing filters', () => {
    const parsed = parseCategorySearchParams({
      category: '../../bad',
      minPrice: 'bad',
      maxPrice: '-20',
      rating: 'Infinity',
      inStock: 'yes',
      sort: 'unexpected',
      page: 'not-a-number',
    })

    assert.equal(parsed.category, undefined)
    assert.equal(parsed.minPrice, null)
    assert.equal(parsed.maxPrice, null)
    assert.equal(parsed.rating, null)
    assert.equal(parsed.inStock, false)
    assert.equal(parsed.sort, 'popular')
    assert.equal(parsed.page, 1)
    assert.deepEqual(parsed.queryParams, {})
  })

  it('parses valid public product API params while preserving the existing response contract inputs', () => {
    const parsed = parseProductApiParams(new URLSearchParams({
      ids: 'prod_1,prod-2,prod_1',
      q: '  charger  ',
      category: 'electronics',
      minPrice: '100',
      maxPrice: '5000',
      featured: 'true',
      new: 'true',
      sort: 'newest',
      page: '2',
      limit: '12',
    }))

    assert.deepEqual(parsed.ids, ['prod_1', 'prod-2'])
    assert.equal(parsed.q, 'charger')
    assert.equal(parsed.category, 'electronics')
    assert.equal(parsed.minPrice, 100)
    assert.equal(parsed.maxPrice, 5000)
    assert.equal(parsed.featured, true)
    assert.equal(parsed.isNew, true)
    assert.equal(parsed.sort, 'newest')
    assert.equal(parsed.page, 2)
    assert.equal(parsed.limit, 12)
  })

  it('bounds malformed public product API page and limit params before Prisma', () => {
    const parsed = parseProductApiParams(new URLSearchParams({
      page: '-5',
      limit: '999999',
      minPrice: 'bad',
      maxPrice: 'also-bad',
      rating: 'not-a-number',
      category: '../../bad',
      sort: 'unknown',
      featured: 'false',
      new: 'yes',
    }))

    assert.equal(parsed.page, 1)
    assert.equal(parsed.limit, MAX_CATALOG_LIMIT)
    assert.equal(parsed.minPrice, null)
    assert.equal(parsed.maxPrice, null)
    assert.equal(parsed.rating, null)
    assert.equal(parsed.category, undefined)
    assert.equal(parsed.sort, 'popular')
    assert.equal(parsed.featured, false)
    assert.equal(parsed.isNew, false)
  })

  it('defaults invalid product API limits and uses first repeated URLSearchParams values', () => {
    const params = new URLSearchParams()
    params.append('page', '3')
    params.append('page', '4')
    params.append('limit', 'bad')
    params.append('sort', 'price_desc')
    params.append('sort', 'rating')

    const parsed = parseProductApiParams(params)

    assert.equal(parsed.page, 3)
    assert.equal(parsed.limit, DEFAULT_CATALOG_LIMIT)
    assert.equal(parsed.sort, 'price_desc')
  })

  it('bounds product API page and limit upper edges', () => {
    const parsed = parseProductApiParams(new URLSearchParams({
      page: '999999999999',
      limit: '0',
    }))
    const capped = parseProductApiParams(new URLSearchParams({
      limit: '999999999999',
    }))

    assert.equal(parsed.page, MAX_SEARCH_PAGE)
    assert.equal(parsed.limit, DEFAULT_CATALOG_LIMIT)
    assert.equal(capped.limit, MAX_CATALOG_LIMIT)
  })

  it('caps product API ids and ignores unsafe id tokens', () => {
    const ids = Array.from({ length: MAX_PRODUCT_IDS + 10 }, (_, index) => `product-${index}`)
    ids.splice(2, 0, '../bad', 'x'.repeat(100))

    const parsed = parseProductApiParams({ ids: ids.join(',') })

    assert.equal(parsed.ids.length, MAX_PRODUCT_IDS)
    assert.equal(parsed.ids.includes('../bad'), false)
    assert.equal(parsed.ids.some((id) => id.length > 80), false)
  })
})
