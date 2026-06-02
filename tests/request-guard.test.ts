import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { isRequestSourceAllowed, normalizeOrigin } from '@/backend/security/request-guard'

describe('mutation request guard', () => {
  it('allows safe methods without source headers', () => {
    const result = isRequestSourceAllowed({
      method: 'GET',
      requestOrigin: 'https://boilabin.test',
      requireSourceHeader: true,
    })

    assert.equal(result.allowed, true)
  })

  it('allows same-origin mutation origins', () => {
    const result = isRequestSourceAllowed({
      method: 'POST',
      requestOrigin: 'https://boilabin.test',
      origin: 'https://boilabin.test',
      requireSourceHeader: true,
    })

    assert.equal(result.allowed, true)
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
  })

  it('requires a source signal when configured to do so', () => {
    const result = isRequestSourceAllowed({
      method: 'POST',
      requestOrigin: 'https://boilabin.test',
      requireSourceHeader: true,
    })

    assert.equal(result.allowed, false)
  })

  it('normalizes valid origins and rejects invalid values', () => {
    assert.equal(normalizeOrigin('https://Boilabin.test/account?x=1'), 'https://boilabin.test')
    assert.equal(normalizeOrigin('javascript:alert(1)'), null)
    assert.equal(normalizeOrigin('not a url'), null)
  })
})
