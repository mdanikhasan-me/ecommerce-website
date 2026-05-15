import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseProfilePayload } from '@/backend/account/profile'

describe('profile validation', () => {
  it('trims names and phone numbers', () => {
    const parsed = parseProfilePayload({ name: '  Arif Rahman  ', phone: ' 01712345678 ' })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.name, 'Arif Rahman')
      assert.equal(parsed.data.phone, '01712345678')
    }
  })

  it('normalizes blank phone values to null', () => {
    const parsed = parseProfilePayload({ name: 'Arif Rahman', phone: '   ' })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.phone, null)
    }
  })

  it('rejects missing names', () => {
    const parsed = parseProfilePayload({ name: '   ' })

    assert.equal(parsed.success, false)
  })

  it('rejects non-phone characters', () => {
    const parsed = parseProfilePayload({ name: 'Arif Rahman', phone: 'abc123' })

    assert.equal(parsed.success, false)
  })
})
