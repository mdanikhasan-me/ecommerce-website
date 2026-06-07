import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  getAuthHostConfigurationWarnings,
  shouldTrustAuthHost,
} from '@/backend/auth/host'

describe('auth host configuration', () => {
  it('trusts local auth origins during local production verification', () => {
    assert.equal(
      shouldTrustAuthHost({
        NODE_ENV: 'production',
        NEXTAUTH_URL: 'http://localhost:3000',
      }),
      true,
    )
    assert.equal(
      shouldTrustAuthHost({
        NODE_ENV: 'production',
        AUTH_URL: 'http://127.0.0.1:3100',
      }),
      true,
    )
  })

  it('honors an explicit AUTH_TRUST_HOST override', () => {
    assert.equal(
      shouldTrustAuthHost({
        NODE_ENV: 'production',
        AUTH_TRUST_HOST: 'false',
        NEXTAUTH_URL: 'http://localhost:3000',
      }),
      false,
    )
    assert.equal(
      shouldTrustAuthHost({
        NODE_ENV: 'production',
        AUTH_TRUST_HOST: '1',
      }),
      true,
    )
  })

  it('normalizes AUTH_TRUST_HOST boolean values before evaluating host trust', () => {
    assert.equal(
      shouldTrustAuthHost({
        NODE_ENV: 'production',
        AUTH_TRUST_HOST: ' YES ',
      }),
      true,
    )
    assert.equal(
      shouldTrustAuthHost({
        NODE_ENV: 'production',
        AUTH_TRUST_HOST: ' No ',
        VERCEL: '1',
      }),
      false,
    )
  })

  it('trusts recognized managed production host signals without a blind custom-host fallback', () => {
    assert.equal(
      shouldTrustAuthHost({
        NODE_ENV: 'production',
        NEXTAUTH_URL: 'https://shop.example.com',
        VERCEL: '1',
      }),
      true,
    )
    assert.equal(
      shouldTrustAuthHost({
        NODE_ENV: 'production',
        NEXTAUTH_URL: 'https://shop.example.com',
        NETLIFY: 'true',
      }),
      true,
    )
  })

  it('does not silently trust unknown custom production hosts', () => {
    assert.equal(
      shouldTrustAuthHost({
        NODE_ENV: 'production',
        NEXTAUTH_URL: 'https://shop.example.com',
      }),
      false,
    )
  })

  it('uses NEXT_PUBLIC_SITE_URL as a local production verification fallback', () => {
    assert.equal(
      shouldTrustAuthHost({
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'http://[::1]:3000/account',
      }),
      true,
    )
  })

  it('ignores unsupported auth origin protocols when evaluating host trust', () => {
    assert.equal(
      shouldTrustAuthHost({
        NODE_ENV: 'production',
        NEXTAUTH_URL: 'javascript:alert(1)',
        NEXT_PUBLIC_SITE_URL: 'file:///tmp/boilabin',
      }),
      false,
    )
    assert.deepEqual(
      getAuthHostConfigurationWarnings({
        NODE_ENV: 'production',
        AUTH_URL: 'data:text/plain,boilabin',
        NEXTAUTH_URL: 'file:///tmp/boilabin',
      }),
      [
        'Set AUTH_URL or NEXTAUTH_URL to the canonical app origin.',
        'Set AUTH_TRUST_HOST=true for trusted reverse proxies or managed hosting.',
      ],
    )
  })

  it('trims canonical auth origins before comparing configured hosts', () => {
    assert.deepEqual(
      getAuthHostConfigurationWarnings({
        NODE_ENV: 'production',
        AUTH_URL: ' https://shop.example.com/auth/callback ',
        NEXTAUTH_URL: 'https://shop.example.com',
        AUTH_TRUST_HOST: 'true',
      }),
      [],
    )
  })

  it('warns about missing or inconsistent canonical origins', () => {
    assert.deepEqual(
      getAuthHostConfigurationWarnings({
        NODE_ENV: 'production',
      }),
      [
        'Set AUTH_URL or NEXTAUTH_URL to the canonical app origin.',
        'Set AUTH_TRUST_HOST=true for trusted reverse proxies or managed hosting.',
      ],
    )
    assert.deepEqual(
      getAuthHostConfigurationWarnings({
        NODE_ENV: 'production',
        AUTH_URL: 'https://auth.example.com',
        NEXTAUTH_URL: 'https://shop.example.com',
        AUTH_TRUST_HOST: 'maybe',
      }),
      [
        'AUTH_TRUST_HOST should be one of true, false, 1, or 0.',
        'AUTH_URL and NEXTAUTH_URL resolve to different origins.',
        'Set AUTH_TRUST_HOST=true for trusted reverse proxies or managed hosting.',
      ],
    )
  })

  it('does not warn for managed hosting trust when a canonical origin exists', () => {
    assert.deepEqual(
      getAuthHostConfigurationWarnings({
        NODE_ENV: 'production',
        NEXTAUTH_URL: 'https://shop.example.com/auth/callback?next=/account',
        VERCEL: '1',
      }),
      [],
    )
  })
})
