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

  it('requires a user for direct notifications', () => {
    const parsed = parseAdminNotificationPayload({
      recipientType: 'USER',
      title: 'Hello',
      message: 'A direct note',
    })

    assert.equal(parsed.success, false)
  })

  it('rejects invalid links and notification types', () => {
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

    assert.equal(invalidLink.success, false)
    assert.equal(invalidType.success, false)
  })

  it('validates read toggles', () => {
    const valid = parseAdminNotificationReadPayload({ isRead: true })
    const invalid = parseAdminNotificationReadPayload({ isRead: 'true' })

    assert.equal(valid.success, true)
    assert.equal(invalid.success, false)
  })

  it('builds audience filters', () => {
    assert.deepEqual(resolveNotificationAudienceWhere('CUSTOMERS'), { role: 'CUSTOMER', isActive: true })
    assert.deepEqual(resolveNotificationAudienceWhere('ALL'), { isActive: true })
  })
})
