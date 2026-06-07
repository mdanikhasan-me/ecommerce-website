import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { authConfig } from '@/backend/auth/config'
import { getSafeAuthRedirectUrl } from '@/backend/auth/redirect'

const baseUrl = 'https://shop.example.com'

describe('auth redirect callback safety', () => {
  it('allows same-origin page redirects and relative paths', async () => {
    assert.equal(
      getSafeAuthRedirectUrl('/account/orders?tab=returns#latest', baseUrl),
      'https://shop.example.com/account/orders?tab=returns#latest',
    )
    assert.equal(
      getSafeAuthRedirectUrl('https://shop.example.com/checkout?step=payment', baseUrl),
      'https://shop.example.com/checkout?step=payment',
    )
  })

  it('falls back to the canonical origin for external or unsupported redirect targets', () => {
    for (const redirectUrl of [
      'https://evil.example/phish',
      '//evil.example/phish',
      'javascript:alert(1)',
      'data:text/plain,boilabin',
      '/\\evil.example',
      'not a url',
    ]) {
      assert.equal(getSafeAuthRedirectUrl(redirectUrl, baseUrl), baseUrl, redirectUrl)
    }
  })

  it('falls back for auth, API, framework, static, upload, metadata, and encoded blocked targets', () => {
    for (const redirectUrl of [
      '/auth/login?callbackUrl=/account',
      '/api/orders',
      '/_next/static/chunks/app.js',
      '/assets/logo.svg',
      '/uploads/admin/product.webp',
      '/robots.txt?cache=1',
      '/%61uth/login',
      '/%61pi/orders',
      '/%2Fexample.com/phish',
      '/%5Cexample.com',
      '/%E0%A4%A',
    ]) {
      assert.equal(getSafeAuthRedirectUrl(redirectUrl, baseUrl), baseUrl, redirectUrl)
    }
  })

  it('does not block public route lookalikes', () => {
    assert.equal(getSafeAuthRedirectUrl('/authentication', baseUrl), 'https://shop.example.com/authentication')
    assert.equal(getSafeAuthRedirectUrl('/apiary', baseUrl), 'https://shop.example.com/apiary')
    assert.equal(getSafeAuthRedirectUrl('/assetsish/logo.svg', baseUrl), 'https://shop.example.com/assetsish/logo.svg')
    assert.equal(getSafeAuthRedirectUrl('/robots.txt-preview', baseUrl), 'https://shop.example.com/robots.txt-preview')
  })

  it('uses the same helper from the NextAuth redirect callback', async () => {
    const redirect = authConfig.callbacks?.redirect
    assert.ok(redirect)

    assert.equal(
      await redirect({ url: '/account/profile', baseUrl }),
      'https://shop.example.com/account/profile',
    )
    assert.equal(
      await redirect({ url: 'https://evil.example/phish', baseUrl }),
      baseUrl,
    )
  })

  it('falls back to a local path when baseUrl itself is invalid', () => {
    assert.equal(getSafeAuthRedirectUrl('/account', 'javascript:alert(1)'), '/')
  })
})
