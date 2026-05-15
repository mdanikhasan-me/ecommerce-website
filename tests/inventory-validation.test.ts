import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseAdminInventoryPayload } from '@/backend/admin/inventory-editor'

describe('admin inventory validation', () => {
  it('normalizes numeric strings and trims notes', () => {
    const parsed = parseAdminInventoryPayload({
      stockQuantity: '12',
      lowStockThreshold: '3',
      note: '  monthly stock count  ',
      variants: [{ id: 'variant_1', stockQuantity: '5' }],
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.stockQuantity, 12)
      assert.equal(parsed.data.lowStockThreshold, 3)
      assert.equal(parsed.data.note, 'monthly stock count')
      assert.deepEqual(parsed.data.variants, [{ id: 'variant_1', stockQuantity: 5 }])
    }
  })

  it('defaults variants to an empty list', () => {
    const parsed = parseAdminInventoryPayload({
      stockQuantity: 12,
      lowStockThreshold: 3,
      note: 'stock count',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.deepEqual(parsed.data.variants, [])
    }
  })

  it('rejects duplicate variant updates', () => {
    const parsed = parseAdminInventoryPayload({
      stockQuantity: 12,
      lowStockThreshold: 3,
      note: 'stock count',
      variants: [
        { id: 'variant_1', stockQuantity: 4 },
        { id: 'variant_1', stockQuantity: 5 },
      ],
    })

    assert.equal(parsed.success, false)
  })

  it('rejects negative stock quantities', () => {
    const parsed = parseAdminInventoryPayload({
      stockQuantity: -1,
      lowStockThreshold: 3,
      note: 'stock count',
    })

    assert.equal(parsed.success, false)
  })

  it('rejects missing adjustment notes', () => {
    const parsed = parseAdminInventoryPayload({
      stockQuantity: 12,
      lowStockThreshold: 3,
      note: '  ',
    })

    assert.equal(parsed.success, false)
  })
})
