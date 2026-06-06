import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Prisma } from '@prisma/client'
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
      type: 'hero:featured',
      config: { layout: 'grid', visible: true },
    })

    assert.equal(parsed.success, true)
  })

  it('normalizes blank config to Prisma JsonNull and preserves inactive state', () => {
    const parsed = parseAdminHomepageSectionPayload({
      type: 'promo_banner',
      config: '',
      isActive: false,
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.config, Prisma.JsonNull)
      assert.equal(parsed.data.isActive, false)
      assert.equal(parsed.data.sortOrder, 0)
    }
  })

  it('rejects config values that are not JSON-safe', () => {
    const withUndefined = parseAdminHomepageSectionPayload({
      type: 'promo_banner',
      config: { headline: undefined },
    })
    const withInfiniteNumber = parseAdminHomepageSectionPayload({
      type: 'promo_banner',
      config: { limit: Number.POSITIVE_INFINITY },
    })

    assert.equal(withUndefined.success, false)
    assert.equal(withInfiniteNumber.success, false)
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
