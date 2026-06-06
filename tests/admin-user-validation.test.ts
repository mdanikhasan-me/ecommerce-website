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

  it('accepts sparse user updates without coercing booleans', () => {
    const sparse = parseAdminUserPayload({})
    const stringBoolean = parseAdminUserPayload({ isActive: 'true' })

    assert.equal(sparse.success, true)
    if (sparse.success) {
      assert.deepEqual(sparse.data, { name: null, phone: null })
    }
    assert.equal(stringBoolean.success, false)
  })

  it('rejects invalid roles, phone characters, and profile length boundaries', () => {
    const invalidRole = parseAdminUserPayload({ role: 'SELLER' })
    const invalidPhone = parseAdminUserPayload({ phone: 'call-me-now' })
    const longName = parseAdminUserPayload({ name: 'A'.repeat(121) })
    const longPhone = parseAdminUserPayload({ phone: '+'.repeat(21) })

    assert.equal(invalidRole.success, false)
    assert.equal(invalidPhone.success, false)
    assert.equal(longName.success, false)
    assert.equal(longPhone.success, false)
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

  it('defaults malformed list filters to safe pagination values', () => {
    const params = new URLSearchParams({
      page: 'not-a-number',
      limit: '-5',
      q: '   ',
      role: ' ADMIN ',
    })
    const filters = parseAdminUserListFilters(params)

    assert.equal(filters.page, 1)
    assert.equal(filters.limit, 1)
    assert.equal(filters.q, '')
    assert.equal(filters.role, 'ADMIN')
  })

  it('builds typed list filters for search and role', () => {
    const where = buildAdminUserWhere({ q: 'ayesha', role: 'ADMIN' })

    assert.equal(where.role, 'ADMIN')
    assert.equal(Array.isArray(where.OR), true)
  })

  it('builds empty where clauses when no search or role is provided', () => {
    assert.deepEqual(buildAdminUserWhere({ q: '', role: '' }), {})
  })
})
