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

  it('rejects invalid phone numbers and non-boolean defaults', () => {
    const invalidPhone = parseAddressPayload({
      ...validAddress,
      phone: '01712 ABC',
    })
    const stringDefault = parseAddressPayload({
      ...validAddress,
      isDefault: 'true',
    })

    assert.equal(invalidPhone.success, false)
    assert.equal(stringDefault.success, false)
  })

  it('rejects missing required address fields and length boundaries', () => {
    const missingName = parseAddressPayload({
      ...validAddress,
      fullName: '  ',
    })
    const longAddress = parseAddressPayload({
      ...validAddress,
      addressLine1: 'A'.repeat(201),
    })
    const longOptionalLine = parseAddressPayload({
      ...validAddress,
      addressLine2: 'B'.repeat(201),
    })
    const longPostalCode = parseAddressPayload({
      ...validAddress,
      postalCode: '1'.repeat(21),
    })

    assert.equal(missingName.success, false)
    assert.equal(longAddress.success, false)
    assert.equal(longOptionalLine.success, false)
    assert.equal(longPostalCode.success, false)
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
