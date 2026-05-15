import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getDescendantCategoryIds } from '@/frontend/components/admin/category-utils'

describe('admin category tree utilities', () => {
  it('finds direct and nested descendants', () => {
    const descendants = getDescendantCategoryIds(
      [
        { id: 'electronics', parentId: null },
        { id: 'phones', parentId: 'electronics' },
        { id: 'android', parentId: 'phones' },
        { id: 'fashion', parentId: null },
      ],
      'electronics',
    )

    assert.deepEqual([...descendants].sort(), ['android', 'phones'])
  })

  it('does not include unrelated branches', () => {
    const descendants = getDescendantCategoryIds(
      [
        { id: 'electronics', parentId: null },
        { id: 'phones', parentId: 'electronics' },
        { id: 'fashion', parentId: null },
        { id: 'mens', parentId: 'fashion' },
      ],
      'electronics',
    )

    assert.equal(descendants.has('phones'), true)
    assert.equal(descendants.has('fashion'), false)
    assert.equal(descendants.has('mens'), false)
  })
})
