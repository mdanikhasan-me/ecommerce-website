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
        guest_checkout: 'true',
        low_stock_alert: '8',
      },
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.deepEqual(parsed.data, [
        { key: 'site_name', value: 'Boilabin', group: 'general' },
        { key: 'site_email', value: 'support@example.com', group: 'general' },
        { key: 'site_phone', value: '+880 1711-222333', group: 'general' },
        { key: 'guest_checkout', value: 'true', group: 'features' },
        { key: 'low_stock_alert', value: '8', group: 'inventory' },
      ])
    }
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

  it('rejects invalid low stock thresholds', () => {
    const parsed = parseAdminSettingsPayload({
      settings: {
        low_stock_alert: -1,
      },
    })

    assert.equal(parsed.success, false)
  })
})
