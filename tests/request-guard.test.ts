import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { isRequestSourceAllowed, normalizeOrigin } from '@/backend/security/request-guard'

describe('mutation request guard', () => {
  it('allows safe methods without source headers', () => {
    const result = isRequestSourceAllowed({
      method: 'get',
      requestOrigin: 'https://boilabin.test',
      requireSourceHeader: true,
    })

    assert.equal(result.allowed, true)
    assert.equal(result.reason, 'safe-method')
  })

  it('allows same-origin mutation origins', () => {
    const result = isRequestSourceAllowed({
      method: 'POST',
      requestOrigin: 'https://boilabin.test',
      origin: 'https://boilabin.test',
      requireSourceHeader: true,
    })

    assert.equal(result.allowed, true)
    assert.equal(result.reason, 'allowed-origin')
  })

  it('allows configured origins and same-origin referers', () => {
    const configured = isRequestSourceAllowed({
      method: 'PATCH',
      requestOrigin: 'https://admin.boilabin.test',
      origin: 'https://boilabin.test',
      allowedOrigins: ['https://boilabin.test'],
      requireSourceHeader: true,
    })
    const referer = isRequestSourceAllowed({
      method: 'DELETE',
      requestOrigin: 'https://boilabin.test',
      referer: 'https://boilabin.test/admin/products/1',
      requireSourceHeader: true,
    })

    assert.equal(configured.allowed, true)
    assert.equal(referer.allowed, true)
    assert.equal(configured.reason, 'allowed-origin')
    assert.equal(referer.reason, 'allowed-referer')
  })

  it('normalizes configured origins and lower-case unsafe methods', () => {
    const result = isRequestSourceAllowed({
      method: 'post',
      requestOrigin: 'https://admin.boilabin.test',
      origin: 'https://boilabin.test',
      allowedOrigins: [' HTTPS://Boilabin.test/account?from=admin '],
      requireSourceHeader: true,
    })

    assert.equal(result.allowed, true)
    assert.equal(result.reason, 'allowed-origin')
  })

  it('blocks cross-site mutation sources', () => {
    const origin = isRequestSourceAllowed({
      method: 'POST',
      requestOrigin: 'https://boilabin.test',
      origin: 'https://evil.test',
      requireSourceHeader: true,
    })
    const fetchMetadata = isRequestSourceAllowed({
      method: 'POST',
      requestOrigin: 'https://boilabin.test',
      secFetchSite: 'cross-site',
      requireSourceHeader: true,
    })

    assert.equal(origin.allowed, false)
    assert.equal(fetchMetadata.allowed, false)
    assert.equal(origin.reason, 'blocked-source')
    assert.equal(fetchMetadata.reason, 'blocked-source')
  })

  it('treats explicit origin as authoritative before fetch metadata', () => {
    const result = isRequestSourceAllowed({
      method: 'POST',
      requestOrigin: 'https://boilabin.test',
      origin: 'https://evil.test',
      secFetchSite: 'same-origin',
      requireSourceHeader: true,
    })

    assert.equal(result.allowed, false)
    assert.equal(result.reason, 'blocked-source')
  })

  it('treats explicit referer as authoritative before fetch metadata', () => {
    const result = isRequestSourceAllowed({
      method: 'PATCH',
      requestOrigin: 'https://boilabin.test',
      referer: 'https://evil.test/admin',
      secFetchSite: 'same-origin',
      requireSourceHeader: true,
    })

    assert.equal(result.allowed, false)
    assert.equal(result.reason, 'blocked-source')
  })

  it('blocks invalid explicit sources before trusting fetch metadata', () => {
    const invalidOrigin = isRequestSourceAllowed({
      method: 'POST',
      requestOrigin: 'https://boilabin.test',
      origin: 'javascript:alert(1)',
      secFetchSite: 'same-origin',
      requireSourceHeader: true,
    })
    const userinfoReferer = isRequestSourceAllowed({
      method: 'PATCH',
      requestOrigin: 'https://boilabin.test',
      referer: 'https://user:pass@boilabin.test/admin',
      secFetchSite: 'same-origin',
      requireSourceHeader: true,
    })

    assert.deepEqual(invalidOrigin, { allowed: false, reason: 'blocked-source' })
    assert.deepEqual(userinfoReferer, { allowed: false, reason: 'blocked-source' })
  })

  it('allows trusted fetch metadata variants when origin and referer are absent', () => {
    for (const secFetchSite of [' same-origin ', 'SAME-SITE', 'none']) {
      const result = isRequestSourceAllowed({
        method: 'DELETE',
        requestOrigin: 'https://boilabin.test',
        secFetchSite,
        requireSourceHeader: true,
      })

      assert.equal(result.allowed, true)
      assert.equal(result.reason, 'trusted-fetch-site')
    }
  })

  it('requires a source signal when configured to do so', () => {
    const result = isRequestSourceAllowed({
      method: 'POST',
      requestOrigin: 'https://boilabin.test',
      requireSourceHeader: true,
    })

    assert.equal(result.allowed, false)
    assert.equal(result.reason, 'missing-source')
    assert.deepEqual(isRequestSourceAllowed({
      method: 'POST',
      requestOrigin: 'https://boilabin.test',
      requireSourceHeader: false,
    }), { allowed: true, reason: 'missing-source' })
  })

  it('normalizes valid origins and rejects invalid values', () => {
    assert.equal(normalizeOrigin('https://Boilabin.test/account?x=1'), 'https://boilabin.test')
    assert.equal(normalizeOrigin(' http://localhost:3000/admin '), 'http://localhost:3000')
    assert.equal(normalizeOrigin('javascript:alert(1)'), null)
    assert.equal(normalizeOrigin('ftp://boilabin.test'), null)
    assert.equal(normalizeOrigin('https://user:pass@boilabin.test'), null)
    assert.equal(normalizeOrigin('not a url'), null)
  })
})
