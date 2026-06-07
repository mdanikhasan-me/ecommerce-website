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

  it('rejects auth, API, framework, and static asset callback targets', () => {
    for (const callbackUrl of [
      '/auth',
      '/auth/login?callbackUrl=/account',
      '/auth/register#start',
      '/api/orders',
      '/_next/static/chunks/app.js',
      '/_next/image?url=%2Fassets%2Flogo.svg',
      '/assets/logo.svg',
      '/uploads/admin/product.webp',
    ]) {
      assert.equal(getSafeCallbackUrl(callbackUrl), '/', callbackUrl)
    }
  })

  it('does not reject public callback path prefix lookalikes', () => {
    assert.equal(getSafeCallbackUrl('/authentication'), '/authentication')
    assert.equal(getSafeCallbackUrl('/apiary'), '/apiary')
    assert.equal(getSafeCallbackUrl('/_nextish/static'), '/_nextish/static')
    assert.equal(getSafeCallbackUrl('/assetsish/logo.svg'), '/assetsish/logo.svg')
    assert.equal(getSafeCallbackUrl('/uploadsish/product.webp'), '/uploadsish/product.webp')
  })

  it('uses the provided fallback for blank or invalid values', () => {
    assert.equal(getSafeCallbackUrl('', '/account'), '/account')
    assert.equal(getSafeCallbackUrl(null, '/account'), '/account')
    assert.equal(getSafeCallbackUrl('https://example.com/phish', '/account'), '/account')
  })

  it('sanitizes fallback values before using them', () => {
    assert.equal(getSafeCallbackUrl('', ' /account/orders?tab=returns#latest '), '/account/orders?tab=returns#latest')
    assert.equal(getSafeCallbackUrl(null, 'https://example.com/phish'), '/')
    assert.equal(getSafeCallbackUrl(undefined, '//example.com/phish'), '/')
    assert.equal(getSafeCallbackUrl('account/orders', '/\\example.com'), '/')
  })
})
