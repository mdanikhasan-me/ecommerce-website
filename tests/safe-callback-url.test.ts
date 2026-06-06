import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getSafeCallbackUrl } from '@/frontend/utils/safe-callback-url'

describe('safe callback URL', () => {
  it('allows internal callback paths', () => {
    assert.equal(getSafeCallbackUrl('/checkout?step=payment'), '/checkout?step=payment')
    assert.equal(getSafeCallbackUrl('/account/orders#latest'), '/account/orders#latest')
    assert.equal(getSafeCallbackUrl(' /account/profile '), '/account/profile')
  })

  it('rejects external and protocol-relative callback URLs', () => {
    assert.equal(getSafeCallbackUrl('https://example.com/phish'), '/')
    assert.equal(getSafeCallbackUrl('//example.com/phish'), '/')
    assert.equal(getSafeCallbackUrl('/\\example.com'), '/')
    assert.equal(getSafeCallbackUrl('javascript:alert(1)'), '/')
    assert.equal(getSafeCallbackUrl('account/orders'), '/')
  })

  it('uses the provided fallback for blank or invalid values', () => {
    assert.equal(getSafeCallbackUrl('', '/account'), '/account')
    assert.equal(getSafeCallbackUrl(null, '/account'), '/account')
    assert.equal(getSafeCallbackUrl('https://example.com/phish', '/account'), '/account')
  })
})
