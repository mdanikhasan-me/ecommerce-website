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

  it('trims variant ids before duplicate detection', () => {
    const parsed = parseAdminInventoryPayload({
      stockQuantity: 12,
      lowStockThreshold: 3,
      note: 'stock count',
      variants: [
        { id: ' variant_1 ', stockQuantity: 4 },
        { id: 'variant_1', stockQuantity: 5 },
      ],
    })

    assert.equal(parsed.success, false)
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

  it('rejects invalid stock quantity boundaries', () => {
    const negativeStock = parseAdminInventoryPayload({
      stockQuantity: -1,
      lowStockThreshold: 3,
      note: 'stock count',
    })
    const highStock = parseAdminInventoryPayload({
      stockQuantity: 1_000_001,
      lowStockThreshold: 3,
      note: 'stock count',
    })
    const fractionalStock = parseAdminInventoryPayload({
      stockQuantity: 12.5,
      lowStockThreshold: 3,
      note: 'stock count',
    })

    assert.equal(negativeStock.success, false)
    assert.equal(highStock.success, false)
    assert.equal(fractionalStock.success, false)
  })

  it('rejects missing, short, and long adjustment notes', () => {
    const missingNote = parseAdminInventoryPayload({
      stockQuantity: 12,
      lowStockThreshold: 3,
      note: '  ',
    })
    const shortNote = parseAdminInventoryPayload({
      stockQuantity: 12,
      lowStockThreshold: 3,
      note: 'ok',
    })
    const longNote = parseAdminInventoryPayload({
      stockQuantity: 12,
      lowStockThreshold: 3,
      note: 'x'.repeat(501),
    })

    assert.equal(missingNote.success, false)
    assert.equal(shortNote.success, false)
    assert.equal(longNote.success, false)
  })
})
