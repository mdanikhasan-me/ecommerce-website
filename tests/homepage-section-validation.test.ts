import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseAdminHomepageSectionPayload } from '@/backend/admin/homepage-section-editor'

describe('admin homepage section validation', () => {
  it('normalizes text fields and parses config JSON', () => {
    const parsed = parseAdminHomepageSectionPayload({
      type: ' featured_categories ',
      title: '  Shop by category  ',
      subtitle: '',
      config: '{"limit":8,"ids":["cat_1","cat_2"]}',
      sortOrder: '3',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.type, 'featured_categories')
      assert.equal(parsed.data.title, 'Shop by category')
      assert.equal(parsed.data.subtitle, null)
      assert.deepEqual(parsed.data.config, { limit: 8, ids: ['cat_1', 'cat_2'] })
      assert.equal(parsed.data.sortOrder, 3)
      assert.equal(parsed.data.isActive, true)
    }
  })

  it('accepts object config input', () => {
    const parsed = parseAdminHomepageSectionPayload({
      type: 'hero:deals',
      config: { layout: 'grid', visible: true },
    })

    assert.equal(parsed.success, true)
  })

  it('rejects invalid config JSON', () => {
    const parsed = parseAdminHomepageSectionPayload({
      type: 'featured_categories',
      config: '{"limit":}',
    })

    assert.equal(parsed.success, false)
    if (!parsed.success) {
      assert.equal(parsed.error, 'Config must be valid JSON')
    }
  })

  it('rejects unsupported section types', () => {
    const parsed = parseAdminHomepageSectionPayload({
      type: 'featured categories',
    })

    assert.equal(parsed.success, false)
  })

  it('rejects non-integer sort order', () => {
    const parsed = parseAdminHomepageSectionPayload({
      type: 'featured_categories',
      sortOrder: 1.5,
    })

    assert.equal(parsed.success, false)
  })
})
