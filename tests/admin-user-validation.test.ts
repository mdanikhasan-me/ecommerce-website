import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildAdminUserWhere,
  parseAdminUserListFilters,
  parseAdminUserPayload,
} from '@/backend/admin/user-editor'

describe('admin user validation', () => {
  it('normalizes editable user fields', () => {
    const parsed = parseAdminUserPayload({
      name: '  Ayesha Rahman  ',
      phone: '  +880 1711-222333  ',
      role: 'ADMIN',
      isActive: true,
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.name, 'Ayesha Rahman')
      assert.equal(parsed.data.phone, '+880 1711-222333')
      assert.equal(parsed.data.role, 'ADMIN')
      assert.equal(parsed.data.isActive, true)
    }
  })

  it('normalizes blank optional profile fields to null', () => {
    const parsed = parseAdminUserPayload({
      name: '  ',
      phone: '',
      role: 'CUSTOMER',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.name, null)
      assert.equal(parsed.data.phone, null)
    }
  })

  it('rejects invalid roles and phone characters', () => {
    const invalidRole = parseAdminUserPayload({ role: 'SELLER' })
    const invalidPhone = parseAdminUserPayload({ phone: 'call-me-now' })

    assert.equal(invalidRole.success, false)
    assert.equal(invalidPhone.success, false)
  })

  it('normalizes list filters and ignores invalid roles', () => {
    const params = new URLSearchParams({
      page: '2.8',
      limit: '500',
      q: ` ${'x'.repeat(130)} `,
      role: 'SELLER',
    })
    const filters = parseAdminUserListFilters(params)

    assert.equal(filters.page, 2)
    assert.equal(filters.limit, 100)
    assert.equal(filters.q.length, 120)
    assert.equal(filters.role, '')
  })

  it('builds typed list filters for search and role', () => {
    const where = buildAdminUserWhere({ q: 'ayesha', role: 'ADMIN' })

    assert.equal(where.role, 'ADMIN')
    assert.equal(Array.isArray(where.OR), true)
  })
})
