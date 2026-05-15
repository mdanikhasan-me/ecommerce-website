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

  it('rejects missing category names', () => {
    const parsed = parseAdminCategoryPayload({ name: '   ' })

    assert.equal(parsed.success, false)
  })

  it('rejects non-integer sort orders', () => {
    const parsed = parseAdminCategoryPayload({ name: 'Gaming', sortOrder: 1.5 })

    assert.equal(parsed.success, false)
  })
})
