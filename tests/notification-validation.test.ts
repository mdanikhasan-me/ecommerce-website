import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ADMIN_NOTIFICATION_RECIPIENT_TYPES,
  ADMIN_NOTIFICATION_TYPES,
  parseAdminNotificationPayload,
  parseAdminNotificationReadPayload,
  resolveNotificationAudienceWhere,
} from '@/backend/admin/notification-editor'

describe('admin notification validation', () => {
  it('documents supported notification types and recipient audiences', () => {
    assert.deepEqual([...ADMIN_NOTIFICATION_RECIPIENT_TYPES], ['ALL', 'CUSTOMERS', 'USER'])
    assert.deepEqual([...ADMIN_NOTIFICATION_TYPES].sort(), [
      'ORDER',
      'PROMOTION',
      'REVIEW',
      'SELLER',
      'SYSTEM',
    ])
  })

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

  it('allows trimmed absolute http links', () => {
    const parsed = parseAdminNotificationPayload({
      recipientType: 'ALL',
      title: 'External update',
      message: 'Read the external policy page.',
      link: ' https://example.com/policy ',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.link, 'https://example.com/policy')
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

  it('rejects blank direct notification user ids', () => {
    const parsed = parseAdminNotificationPayload({
      recipientType: 'USER',
      userId: '  ',
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
    const longLink = parseAdminNotificationPayload({
      recipientType: 'ALL',
      title: 'Hello',
      message: 'World',
      link: `/${'x'.repeat(500)}`,
    })

    assert.equal(invalidLink.success, false)
    assert.equal(invalidType.success, false)
    assert.equal(invalidRecipient.success, false)
    assert.equal(longLink.success, false)
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
    const blankMessage = parseAdminNotificationPayload({
      recipientType: 'ALL',
      title: 'Hello',
      message: '  ',
    })

    assert.equal(blankTitle.success, false)
    assert.equal(longTitle.success, false)
    assert.equal(longMessage.success, false)
    assert.equal(blankMessage.success, false)
  })

  it('validates read toggles', () => {
    const valid = parseAdminNotificationReadPayload({ isRead: true })
    const validFalse = parseAdminNotificationReadPayload({ isRead: false })
    const invalid = parseAdminNotificationReadPayload({ isRead: 'true' })
    const nullish = parseAdminNotificationReadPayload({ isRead: null })
    const missing = parseAdminNotificationReadPayload({})

    assert.equal(valid.success, true)
    assert.equal(validFalse.success, true)
    assert.equal(invalid.success, false)
    assert.equal(nullish.success, false)
    assert.equal(missing.success, false)
  })

  it('builds audience filters', () => {
    assert.deepEqual(resolveNotificationAudienceWhere('CUSTOMERS'), { role: 'CUSTOMER', isActive: true })
    assert.deepEqual(resolveNotificationAudienceWhere('ALL'), { isActive: true })
    assert.deepEqual(resolveNotificationAudienceWhere('USER'), { isActive: true })
  })
})
