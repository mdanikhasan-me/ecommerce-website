import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseAdminFlashSalePayload } from '@/backend/admin/flash-sale-editor'

const validFlashSale = {
  title: ' Eid Flash Sale ',
  startsAt: '2026-01-01T00:00:00.000Z',
  endsAt: '2026-01-02T00:00:00.000Z',
  isActive: true,
  items: [
    {
      productId: 'product-1',
      discountType: 'PERCENTAGE',
      discountValue: '25',
      maxQuantity: '10',
    },
  ],
}

describe('admin flash sale validation', () => {
  it('normalizes text, dates, numeric values, and quantities', () => {
    const parsed = parseAdminFlashSalePayload(validFlashSale)

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.title, 'Eid Flash Sale')
      assert.equal(parsed.data.items[0].discountValue, 25)
      assert.equal(parsed.data.items[0].maxQuantity, 10)
      assert.equal(parsed.data.startsAt instanceof Date, true)
    }
  })

  it('normalizes blank max quantity to null', () => {
    const parsed = parseAdminFlashSalePayload({
      ...validFlashSale,
      items: [{ ...validFlashSale.items[0], maxQuantity: '' }],
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.items[0].maxQuantity, null)
    }
  })

  it('rejects duplicate products', () => {
    const parsed = parseAdminFlashSalePayload({
      ...validFlashSale,
      items: [validFlashSale.items[0], validFlashSale.items[0]],
    })

    assert.equal(parsed.success, false)
  })

  it('rejects percentage discounts above 100', () => {
    const parsed = parseAdminFlashSalePayload({
      ...validFlashSale,
      items: [{ ...validFlashSale.items[0], discountValue: 101 }],
    })

    assert.equal(parsed.success, false)
  })

  it('rejects schedules where end is before start', () => {
    const parsed = parseAdminFlashSalePayload({
      ...validFlashSale,
      startsAt: '2026-01-03T00:00:00.000Z',
      endsAt: '2026-01-02T00:00:00.000Z',
    })

    assert.equal(parsed.success, false)
  })
})
