import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildCategoryProductCountMap,
  collectCategoryProductCountIds,
} from '@/backend/catalog/category-product-counts'

const categories = [
  {
    id: 'electronics',
    children: [{ id: 'mobile' }, { id: 'gaming' }],
  },
  {
    id: 'fashion',
    children: [],
  },
]

describe('category product counts', () => {
  it('collects parent and child category ids once', () => {
    assert.deepEqual(
      collectCategoryProductCountIds([
        ...categories,
        { id: 'electronics', children: [{ id: 'mobile' }] },
      ]),
      ['electronics', 'mobile', 'gaming', 'fashion'],
    )
  })

  it('rolls direct and child product counts into the parent card count', () => {
    const counts = buildCategoryProductCountMap(categories, [
      { categoryId: 'electronics', count: 2 },
      { categoryId: 'mobile', count: 4 },
      { categoryId: 'gaming', count: 1 },
      { categoryId: 'fashion', count: 3 },
    ])

    assert.equal(counts.get('electronics'), 7)
    assert.equal(counts.get('fashion'), 3)
  })

  it('returns zero for categories with no visible products', () => {
    const counts = buildCategoryProductCountMap(categories, [])

    assert.equal(counts.get('electronics'), 0)
    assert.equal(counts.get('fashion'), 0)
  })
})
