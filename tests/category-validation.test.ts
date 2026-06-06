import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseAdminCategoryPayload } from '@/backend/admin/category-editor'

describe('admin category validation', () => {
  it('trims category fields and normalizes blank optional values', () => {
    const parsed = parseAdminCategoryPayload({
      name: '  Electronics  ',
      slug: ' electronics ',
      description: '   ',
      icon: '',
      image: null,
      sortOrder: '12',
      isActive: true,
      parentId: '',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.name, 'Electronics')
      assert.equal(parsed.data.slug, 'electronics')
      assert.equal(parsed.data.description, null)
      assert.equal(parsed.data.icon, null)
      assert.equal(parsed.data.image, null)
      assert.equal(parsed.data.sortOrder, 12)
      assert.equal(parsed.data.parentId, null)
    }
  })

  it('defaults activity and sort order', () => {
    const parsed = parseAdminCategoryPayload({ name: 'Gaming' })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.isActive, true)
      assert.equal(parsed.data.sortOrder, 0)
    }
  })

  it('preserves inactive categories and allowed negative sort order', () => {
    const parsed = parseAdminCategoryPayload({
      name: 'Archive',
      isActive: false,
      sortOrder: '-10',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.isActive, false)
      assert.equal(parsed.data.sortOrder, -10)
    }
  })

  it('rejects missing category names', () => {
    const parsed = parseAdminCategoryPayload({ name: '   ' })

    assert.equal(parsed.success, false)
  })

  it('rejects non-integer sort orders', () => {
    const parsed = parseAdminCategoryPayload({ name: 'Gaming', sortOrder: 1.5 })

    assert.equal(parsed.success, false)
  })

  it('rejects out-of-range sort orders', () => {
    const low = parseAdminCategoryPayload({ name: 'Gaming', sortOrder: -10000 })
    const high = parseAdminCategoryPayload({ name: 'Gaming', sortOrder: 10000 })

    assert.equal(low.success, false)
    assert.equal(high.success, false)
  })
})
