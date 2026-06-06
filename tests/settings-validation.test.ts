import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ADMIN_SETTING_DEFINITIONS,
  parseAdminSettingsPayload,
} from '@/backend/admin/settings-editor'

describe('admin settings validation', () => {
  it('documents the supported settings and groups', () => {
    assert.deepEqual(ADMIN_SETTING_DEFINITIONS, [
      { key: 'site_name', group: 'general' },
      { key: 'site_tagline', group: 'general' },
      { key: 'site_email', group: 'general' },
      { key: 'site_phone', group: 'general' },
      { key: 'site_address', group: 'general' },
      { key: 'low_stock_alert', group: 'inventory' },
    ])
  })

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

  it('accepts zero low-stock thresholds and normalizes numeric strings', () => {
    const parsed = parseAdminSettingsPayload({
      settings: {
        low_stock_alert: '0',
      },
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.deepEqual(parsed.data, [
        { key: 'low_stock_alert', value: '0', group: 'inventory' },
      ])
    }
  })

  it('rejects malformed settings payloads before reading setting keys', () => {
    assert.equal(parseAdminSettingsPayload(null).success, false)
    assert.equal(parseAdminSettingsPayload({}).success, false)
    assert.equal(parseAdminSettingsPayload({ settings: null }).success, false)
    assert.equal(parseAdminSettingsPayload({ settings: 'site_name=Boilabin' }).success, false)
    assert.equal(parseAdminSettingsPayload({ settings: ['site_name'] }).success, false)
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
    const fractionalStock = parseAdminSettingsPayload({
      settings: {
        low_stock_alert: 1.5,
      },
    })
    const nonNumericStock = parseAdminSettingsPayload({
      settings: {
        low_stock_alert: 'many',
      },
    })
    const longTagline = parseAdminSettingsPayload({
      settings: {
        site_tagline: 'T'.repeat(181),
      },
    })
    const longAddress = parseAdminSettingsPayload({
      settings: {
        site_address: 'A'.repeat(241),
      },
    })

    assert.equal(negativeStock.success, false)
    assert.equal(highStock.success, false)
    assert.equal(longSiteName.success, false)
    assert.equal(fractionalStock.success, false)
    assert.equal(nonNumericStock.success, false)
    assert.equal(longTagline.success, false)
    assert.equal(longAddress.success, false)
  })
})
