import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ADMIN_MANAGED_ROLES,
  DEFAULT_ADMIN_USER_LIST_LIMIT,
  MAX_ADMIN_USER_LIST_LIMIT,
  MAX_ADMIN_USER_LIST_PAGE,
  buildAdminUserWhere,
  parseAdminUserListFilters,
  parseAdminUserPayload,
} from '@/backend/admin/user-editor'

describe('admin user validation', () => {
  it('documents managed admin user roles', () => {
    assert.deepEqual([...ADMIN_MANAGED_ROLES], ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'])
  })

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

  it('preserves explicit inactive and super admin updates', () => {
    const parsed = parseAdminUserPayload({
      role: 'SUPER_ADMIN',
      isActive: false,
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.role, 'SUPER_ADMIN')
      assert.equal(parsed.data.isActive, false)
      assert.equal(parsed.data.name, null)
      assert.equal(parsed.data.phone, null)
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

  it('rejects malformed user update payloads', () => {
    assert.equal(parseAdminUserPayload(null).success, false)
    assert.equal(parseAdminUserPayload(['ADMIN']).success, false)
    assert.equal(parseAdminUserPayload('role=ADMIN').success, false)
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
    assert.equal(filters.limit, MAX_ADMIN_USER_LIST_LIMIT)
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

  it('rejects non-decimal admin user list pagination before skip math', () => {
    for (const value of ['0x10', '1e3', '2abc', 'Infinity', 'NaN', '999999999999999999999']) {
      const filters = parseAdminUserListFilters(new URLSearchParams({ page: value, limit: value }))

      assert.equal(filters.page, 1)
      assert.equal(filters.limit, DEFAULT_ADMIN_USER_LIST_LIMIT)
    }

    const capped = parseAdminUserListFilters(new URLSearchParams({
      page: String(MAX_ADMIN_USER_LIST_PAGE + 1),
      limit: String(MAX_ADMIN_USER_LIST_LIMIT + 1),
    }))

    assert.equal(capped.page, MAX_ADMIN_USER_LIST_PAGE)
    assert.equal(capped.limit, MAX_ADMIN_USER_LIST_LIMIT)
  })

  it('defaults missing list filters to the first page', () => {
    const filters = parseAdminUserListFilters(new URLSearchParams())

    assert.deepEqual(filters, {
      page: 1,
      limit: 25,
      q: '',
      role: '',
    })
  })

  it('builds typed list filters for search and role', () => {
    const where = buildAdminUserWhere({ q: 'ayesha', role: 'ADMIN' })

    assert.equal(where.role, 'ADMIN')
    assert.equal(Array.isArray(where.OR), true)
    assert.deepEqual(where.OR, [
      { name: { contains: 'ayesha', mode: 'insensitive' } },
      { email: { contains: 'ayesha', mode: 'insensitive' } },
      { phone: { contains: 'ayesha', mode: 'insensitive' } },
    ])
  })

  it('builds role-only where clauses without adding search branches', () => {
    assert.deepEqual(buildAdminUserWhere({ q: '', role: 'SUPER_ADMIN' }), {
      role: 'SUPER_ADMIN',
    })
  })

  it('builds empty where clauses when no search or role is provided', () => {
    assert.deepEqual(buildAdminUserWhere({ q: '', role: '' }), {})
  })
})
