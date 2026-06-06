import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseAdminSettingsPayload } from '@/backend/admin/settings-editor'

describe('admin settings validation', () => {
  it('normalizes allowed settings', () => {
    const parsed = parseAdminSettingsPayload({
      settings: {
        site_name: '  Boilabin  ',
        site_email: ' support@example.com ',
        site_phone: ' +880 1711-222333 ',
        low_stock_alert: '8',
      },
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.deepEqual(parsed.data, [
        { key: 'site_name', value: 'Boilabin', group: 'general' },
        { key: 'site_email', value: 'support@example.com', group: 'general' },
        { key: 'site_phone', value: '+880 1711-222333', group: 'general' },
        { key: 'low_stock_alert', value: '8', group: 'inventory' },
      ])
    }
  })

  it('accepts blank optional contact fields while preserving setting groups', () => {
    const parsed = parseAdminSettingsPayload({
      settings: {
        site_email: '   ',
        site_tagline: '',
        site_address: '  Dhaka, Bangladesh  ',
      },
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.deepEqual(parsed.data, [
        { key: 'site_email', value: '', group: 'general' },
        { key: 'site_tagline', value: '', group: 'general' },
        { key: 'site_address', value: 'Dhaka, Bangladesh', group: 'general' },
      ])
    }
  })

  it('rejects malformed settings payloads before reading setting keys', () => {
    assert.equal(parseAdminSettingsPayload(null).success, false)
    assert.equal(parseAdminSettingsPayload({}).success, false)
    assert.equal(parseAdminSettingsPayload({ settings: null }).success, false)
  })

  it('rejects unsupported settings', () => {
    const parsed = parseAdminSettingsPayload({
      settings: {
        admin_backdoor: 'true',
      },
    })

    assert.equal(parsed.success, false)
  })

  it('rejects invalid email and phone settings', () => {
    const invalidEmail = parseAdminSettingsPayload({ settings: { site_email: 'not-email' } })
    const invalidPhone = parseAdminSettingsPayload({ settings: { site_phone: 'call-me' } })

    assert.equal(invalidEmail.success, false)
    assert.equal(invalidPhone.success, false)
  })

  it('rejects invalid low stock thresholds and length boundaries', () => {
    const negativeStock = parseAdminSettingsPayload({
      settings: {
        low_stock_alert: -1,
      },
    })
    const highStock = parseAdminSettingsPayload({
      settings: {
        low_stock_alert: 100_001,
      },
    })
    const longSiteName = parseAdminSettingsPayload({
      settings: {
        site_name: 'B'.repeat(121),
      },
    })

    assert.equal(negativeStock.success, false)
    assert.equal(highStock.success, false)
    assert.equal(longSiteName.success, false)
  })
})
