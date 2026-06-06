import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseAdminInventoryPayload } from '@/backend/admin/inventory-editor'

describe('admin inventory validation', () => {
  const validPayload = {
    stockQuantity: 12,
    lowStockThreshold: 3,
    note: 'stock count',
  }

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

  it('accepts zero stock, maximum thresholds, and exact note limits', () => {
    const parsed = parseAdminInventoryPayload({
      stockQuantity: 0,
      lowStockThreshold: '1000000',
      note: 'x'.repeat(500),
      variants: [{ id: ' variant_max ', stockQuantity: '1000000' }],
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.stockQuantity, 0)
      assert.equal(parsed.data.lowStockThreshold, 1_000_000)
      assert.equal(parsed.data.note.length, 500)
      assert.deepEqual(parsed.data.variants, [{ id: 'variant_max', stockQuantity: 1_000_000 }])
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

  it('rejects invalid low stock threshold boundaries', () => {
    const negativeThreshold = parseAdminInventoryPayload({
      ...validPayload,
      lowStockThreshold: -1,
    })
    const highThreshold = parseAdminInventoryPayload({
      ...validPayload,
      lowStockThreshold: 1_000_001,
    })
    const fractionalThreshold = parseAdminInventoryPayload({
      ...validPayload,
      lowStockThreshold: 3.5,
    })

    assert.equal(negativeThreshold.success, false)
    assert.equal(highThreshold.success, false)
    assert.equal(fractionalThreshold.success, false)
  })

  it('rejects blank variant ids and invalid variant stock boundaries', () => {
    const blankVariantId = parseAdminInventoryPayload({
      ...validPayload,
      variants: [{ id: '   ', stockQuantity: 4 }],
    })
    const negativeVariantStock = parseAdminInventoryPayload({
      ...validPayload,
      variants: [{ id: 'variant_1', stockQuantity: -1 }],
    })
    const highVariantStock = parseAdminInventoryPayload({
      ...validPayload,
      variants: [{ id: 'variant_1', stockQuantity: 1_000_001 }],
    })
    const fractionalVariantStock = parseAdminInventoryPayload({
      ...validPayload,
      variants: [{ id: 'variant_1', stockQuantity: 4.5 }],
    })

    assert.equal(blankVariantId.success, false)
    assert.equal(negativeVariantStock.success, false)
    assert.equal(highVariantStock.success, false)
    assert.equal(fractionalVariantStock.success, false)
  })

  it('rejects malformed inventory payloads', () => {
    const malformedPayloads: unknown[] = [
      null,
      [],
      'inventory update',
      {},
      { lowStockThreshold: 3, note: 'stock count' },
      { stockQuantity: 12, note: 'stock count' },
      { stockQuantity: 12, lowStockThreshold: 3 },
      { ...validPayload, variants: null },
    ]

    for (const payload of malformedPayloads) {
      const parsed = parseAdminInventoryPayload(payload)

      assert.equal(parsed.success, false)
    }
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
