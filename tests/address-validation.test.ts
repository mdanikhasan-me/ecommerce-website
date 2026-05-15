import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseAddressPayload } from '@/backend/account/address'

const validAddress = {
  fullName: 'Arif Rahman',
  phone: '01712345678',
  addressLine1: 'House 12, Road 4',
  addressLine2: 'Near market',
  city: 'Dhaka City',
  district: 'Dhaka',
  division: 'Dhaka',
  postalCode: '1207',
  isDefault: true,
}

describe('address validation', () => {
  it('trims valid address fields', () => {
    const parsed = parseAddressPayload({
      ...validAddress,
      fullName: '  Arif Rahman  ',
      addressLine2: '  Near market  ',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.fullName, 'Arif Rahman')
      assert.equal(parsed.data.addressLine2, 'Near market')
    }
  })

  it('normalizes blank optional fields to null', () => {
    const parsed = parseAddressPayload({
      ...validAddress,
      addressLine2: '   ',
      postalCode: '',
    })

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.addressLine2, null)
      assert.equal(parsed.data.postalCode, null)
    }
  })

  it('rejects invalid phone numbers', () => {
    const parsed = parseAddressPayload({
      ...validAddress,
      phone: '01712 ABC',
    })

    assert.equal(parsed.success, false)
  })

  it('defaults isDefault to false', () => {
    const { isDefault: _isDefault, ...payload } = validAddress
    const parsed = parseAddressPayload(payload)

    assert.equal(parsed.success, true)
    if (parsed.success) {
      assert.equal(parsed.data.isDefault, false)
    }
  })
})
