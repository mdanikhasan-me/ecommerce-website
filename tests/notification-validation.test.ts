import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  parseAdminNotificationPayload,
  parseAdminNotificationReadPayload,
  resolveNotificationAudienceWhere,
} from '@/backend/admin/notification-editor'

describe('admin notification validation', () => {
  it('normalizes notification payloads', () => {
    const parsed = parseAdminNotificationPayload({
      recipientType: 'ALL',
      type: 'SELLER',
      title: '  Seller update  ',
      message: '  New seller policy is live  ',
      link: ' /admin/settings ',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.type, 'SELLER')
      assert.equal(parsed.data.title, 'Seller update')
      assert.equal(parsed.data.message, 'New seller policy is live')
      assert.equal(parsed.data.link, '/admin/settings')
    }
  })

  it('defaults notification type and normalizes blank optional fields', () => {
    const parsed = parseAdminNotificationPayload({
      recipientType: 'CUSTOMERS',
      userId: '  ',
      title: '  Promo update  ',
      message: '  Sale starts soon  ',
      link: '',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.recipientType, 'CUSTOMERS')
      assert.equal(parsed.data.userId, null)
      assert.equal(parsed.data.type, 'SYSTEM')
      assert.equal(parsed.data.title, 'Promo update')
      assert.equal(parsed.data.message, 'Sale starts soon')
      assert.equal(parsed.data.link, null)
    }
  })

  it('trims direct notification user ids', () => {
    const parsed = parseAdminNotificationPayload({
      recipientType: 'USER',
      userId: ' user_123 ',
      title: 'Hello',
      message: 'A direct note',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.userId, 'user_123')
    }
  })

  it('requires a user for direct notifications', () => {
    const parsed = parseAdminNotificationPayload({
      recipientType: 'USER',
      title: 'Hello',
      message: 'A direct note',
    })

    assert.equal(parsed.success, false)
  })

  it('rejects invalid links, notification types, and recipient types', () => {
    const invalidLink = parseAdminNotificationPayload({
      recipientType: 'ALL',
      title: 'Hello',
      message: 'World',
      link: 'javascript:alert(1)',
    })
    const invalidType = parseAdminNotificationPayload({
      recipientType: 'ALL',
      type: 'EMAIL',
      title: 'Hello',
      message: 'World',
    })
    const invalidRecipient = parseAdminNotificationPayload({
      recipientType: 'ADMINS',
      title: 'Hello',
      message: 'World',
    })

    assert.equal(invalidLink.success, false)
    assert.equal(invalidType.success, false)
    assert.equal(invalidRecipient.success, false)
  })

  it('rejects blank and overlong notification copy', () => {
    const blankTitle = parseAdminNotificationPayload({
      recipientType: 'ALL',
      title: '  ',
      message: 'World',
    })
    const longTitle = parseAdminNotificationPayload({
      recipientType: 'ALL',
      title: 'x'.repeat(141),
      message: 'World',
    })
    const longMessage = parseAdminNotificationPayload({
      recipientType: 'ALL',
      title: 'Hello',
      message: 'x'.repeat(1001),
    })

    assert.equal(blankTitle.success, false)
    assert.equal(longTitle.success, false)
    assert.equal(longMessage.success, false)
  })

  it('validates read toggles', () => {
    const valid = parseAdminNotificationReadPayload({ isRead: true })
    const invalid = parseAdminNotificationReadPayload({ isRead: 'true' })
    const missing = parseAdminNotificationReadPayload({})

    assert.equal(valid.success, true)
    assert.equal(invalid.success, false)
    assert.equal(missing.success, false)
  })

  it('builds audience filters', () => {
    assert.deepEqual(resolveNotificationAudienceWhere('CUSTOMERS'), { role: 'CUSTOMER', isActive: true })
    assert.deepEqual(resolveNotificationAudienceWhere('ALL'), { isActive: true })
    assert.deepEqual(resolveNotificationAudienceWhere('USER'), { isActive: true })
  })
})
