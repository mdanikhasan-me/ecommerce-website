import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  orderProductsById,
  selectEffectivePricePage,
  sortProductsByEffectivePrice,
} from '@/backend/catalog/product-price-filter'

const products = [
  { id: 'p3', basePrice: 500, salePrice: null },
  { id: 'p1', basePrice: 1000, salePrice: 750 },
  { id: 'p2', basePrice: 800, salePrice: 700 },
  { id: 'p4', basePrice: 700, salePrice: null },
]

describe('effective price filtering helpers', () => {
  it('sorts by sale price when present and base price otherwise', () => {
    assert.deepEqual(
      sortProductsByEffectivePrice(products, 'asc').map((product) => product.id),
      ['p3', 'p2', 'p4', 'p1'],
    )
    assert.deepEqual(
      sortProductsByEffectivePrice(products, 'desc').map((product) => product.id),
      ['p1', 'p2', 'p4', 'p3'],
    )
  })

  it('selects only the requested effective-price page', () => {
    assert.deepEqual(
      selectEffectivePricePage(products, 'asc', 1, 2).map((product) => product.id),
      ['p2', 'p4'],
    )
  })

  it('restores fetched products to the previously sorted ID order', () => {
    assert.deepEqual(
      orderProductsById(
        [
          { id: 'p4', name: 'Fourth' },
          { id: 'p2', name: 'Second' },
        ],
        ['p2', 'p4'],
      ).map((product) => product.name),
      ['Second', 'Fourth'],
    )
  })
})
