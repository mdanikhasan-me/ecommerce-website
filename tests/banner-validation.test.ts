import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseAdminBannerPayload } from '@/backend/admin/banner-editor'

describe('admin banner validation', () => {
  it('normalizes text fields and dates', () => {
    const parsed = parseAdminBannerPayload({
      title: '  Eid Deals  ',
      subtitle: '  Save on essentials  ',
      imageUrl: '/uploads/admin/banners/banner.webp',
      mobileImageUrl: '',
      linkUrl: ' /deals ',
      position: ' hero ',
      sortOrder: '4',
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2026-01-02T00:00:00.000Z',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.title, 'Eid Deals')
      assert.equal(parsed.data.subtitle, 'Save on essentials')
      assert.equal(parsed.data.mobileImageUrl, null)
      assert.equal(parsed.data.linkUrl, '/deals')
      assert.equal(parsed.data.position, 'hero')
      assert.equal(parsed.data.sortOrder, 4)
      assert.equal(parsed.data.startsAt instanceof Date, true)
    }
  })

  it('allows text-only banners', () => {
    const parsed = parseAdminBannerPayload({ title: 'Announcement', position: 'promo' })

    assert.equal(parsed.success, true)
  })

  it('rejects empty banners', () => {
    const parsed = parseAdminBannerPayload({ title: '', subtitle: '', imageUrl: '', mobileImageUrl: '' })

    assert.equal(parsed.success, false)
  })

  it('rejects unsafe link URLs', () => {
    const parsed = parseAdminBannerPayload({ title: 'Deal', linkUrl: 'javascript:alert(1)' })

    assert.equal(parsed.success, false)
  })

  it('rejects schedules where end is before start', () => {
    const parsed = parseAdminBannerPayload({
      title: 'Deal',
      startsAt: '2026-01-03T00:00:00.000Z',
      endsAt: '2026-01-02T00:00:00.000Z',
    })

    assert.equal(parsed.success, false)
  })
})
