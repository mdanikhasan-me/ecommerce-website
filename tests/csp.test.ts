import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { NextRequest } from 'next/server'

import middleware from '@/middleware'
import {
  CSP_REPORT_ENDPOINT_PATH,
  CSP_REPORT_ONLY_HEADER,
  buildCspReportOnlyPolicyForFamily,
  classifyCspRoute,
  cspKnownImageSources,
  getCspReportOnlyHeader,
  getCspReportOnlyPolicy,
  isCspReportCollectionEnabled,
  isCspReportOnlyEnabled,
  type CspRouteFamily,
} from '@/backend/security/csp'

function directiveValues(policy: string, directiveName: string) {
  const directive = policy
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${directiveName} `))

  assert.ok(directive, `expected ${directiveName} directive`)
  return directive.split(/\s+/).slice(1)
}

function withEnvValue<T>(key: string, value: string | undefined, callback: () => T) {
  const previous = process.env[key]

  try {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }

    return callback()
  } finally {
    if (previous === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = previous
    }
  }
}

describe('route-aware CSP helper', () => {
  it('classifies route families without applying CSP to static assets', () => {
    const cases: Array<[string, CspRouteFamily | null]> = [
      ['/', 'public'],
      ['/category/electronics', 'public'],
      ['/products/test-product', 'public'],
      ['/auth/login', 'auth'],
      ['/account/profile', 'account'],
      ['/order/BLB-TEST/confirmation', 'account'],
      ['/checkout', 'checkout'],
      ['/cart', 'checkout'],
      ['/api', 'api'],
      ['/admin/dashboard', 'admin'],
      ['/admin', 'admin'],
      ['/api/products', 'api'],
      ['/api/admin/products', 'api'],
      ['/auth', 'auth'],
      ['/robots.txt', 'metadata'],
      ['/sitemap.xml', 'metadata'],
      ['/_next/static/chunks/app.js', null],
      ['/_next/image', null],
      ['/assets/payments/visa.svg', null],
      ['/uploads/admin/product/test.webp', null],
    ]

    for (const [pathname, expected] of cases) {
      assert.equal(classifyCspRoute(pathname), expected, pathname)
    }
  })

  it('uses path segment boundaries for framework static routes', () => {
    const publicPrefixLookalikes = [
      '/_next/staticish/chunks/app.js',
      '/_next/image-proxy',
      '/_next/images/product.webp',
    ]

    for (const pathname of publicPrefixLookalikes) {
      assert.equal(classifyCspRoute(pathname), 'public', pathname)
    }
  })

  it('uses path segment boundaries for protected route families', () => {
    const publicPrefixLookalikes = [
      '/administrator',
      '/administer/products',
      '/authentication',
      '/authentic-products',
      '/accounting',
      '/apiary',
    ]

    for (const pathname of publicPrefixLookalikes) {
      assert.equal(classifyCspRoute(pathname), 'public', pathname)
    }
  })

  it('generates explicit report-only policies for every route family', () => {
    const families: CspRouteFamily[] = ['public', 'auth', 'account', 'checkout', 'admin', 'api', 'metadata']

    for (const family of families) {
      const policy = buildCspReportOnlyPolicyForFamily(family)

      assert.match(policy, /default-src /)
      assert.doesNotMatch(policy, /Content-Security-Policy/i)
      assert.doesNotMatch(policy, /\*/)
      assert.doesNotMatch(policy, /(?:^|\s)https:(?:\s|;|$)/)
    }
  })

  it('keeps current known image hosts in page policies', () => {
    const policy = buildCspReportOnlyPolicyForFamily('public')
    const imageSources = directiveValues(policy, 'img-src')

    for (const imageSource of cspKnownImageSources) {
      assert.ok(imageSources.includes(imageSource), `${imageSource} missing from img-src`)
    }
  })

  it('does not include payment or tracking domains before those integrations exist', () => {
    const policy = [
      buildCspReportOnlyPolicyForFamily('public'),
      buildCspReportOnlyPolicyForFamily('auth'),
      buildCspReportOnlyPolicyForFamily('checkout'),
      buildCspReportOnlyPolicyForFamily('admin'),
    ].join('; ').toLowerCase()

    const forbidden = [
      'bkash',
      'nagad',
      'stripe',
      'sslcommerz',
      'shurjopay',
      'googletagmanager',
      'google-analytics',
      'facebook.net',
      'connect.facebook.net',
    ]

    for (const domain of forbidden) {
      assert.equal(policy.includes(domain), false, `${domain} should not be in CSP`)
    }
  })

  it('keeps API and metadata policies minimal', () => {
    const apiPolicy = buildCspReportOnlyPolicyForFamily('api')
    const metadataPolicy = buildCspReportOnlyPolicyForFamily('metadata')

    assert.equal(directiveValues(apiPolicy, 'default-src').join(' '), "'none'")
    assert.equal(apiPolicy.includes('script-src'), false)
    assert.equal(metadataPolicy.includes('script-src'), false)
    assert.deepEqual(directiveValues(metadataPolicy, 'img-src'), ["'self'", 'data:'])
  })

  it('keeps report-only header disabled by default', () => {
    assert.equal(isCspReportOnlyEnabled({}), false)
    assert.equal(isCspReportCollectionEnabled({}), false)
    assert.equal(getCspReportOnlyHeader('/', {}), null)
    assert.equal(getCspReportOnlyHeader('/admin/dashboard', { ENABLE_CSP_REPORT_ONLY: 'false' }), null)
  })

  it('returns a report-only header only when explicitly enabled', () => {
    const header = getCspReportOnlyHeader('/auth/login', { ENABLE_CSP_REPORT_ONLY: 'true' })

    assert.ok(header)
    assert.equal(header.key, CSP_REPORT_ONLY_HEADER)
    assert.equal(header.value, getCspReportOnlyPolicy('/auth/login'))
    assert.equal(getCspReportOnlyHeader('/assets/payments/visa.svg', { ENABLE_CSP_REPORT_ONLY: 'true' }), null)
  })

  it('adds report-uri only when report-only and collection are both enabled', () => {
    const reportOnly = getCspReportOnlyHeader('/', { ENABLE_CSP_REPORT_ONLY: 'true' })
    const collectionOnly = getCspReportOnlyHeader('/', { ENABLE_CSP_REPORT_COLLECTION: 'true' })
    const bothEnabled = getCspReportOnlyHeader('/', {
      ENABLE_CSP_REPORT_ONLY: 'true',
      ENABLE_CSP_REPORT_COLLECTION: 'true',
    })

    assert.ok(reportOnly)
    assert.equal(reportOnly.value.includes('report-uri'), false)
    assert.equal(collectionOnly, null)
    assert.ok(bothEnabled)
    assert.match(bothEnabled.value, new RegExp(`report-uri ${CSP_REPORT_ENDPOINT_PATH.replace(/\//g, '\\/')}`))
  })
})

describe('middleware CSP report-only behavior', () => {
  it('does not add CSP headers by default and preserves protected redirects', () => {
    withEnvValue('ENABLE_CSP_REPORT_ONLY', undefined, () => {
      const response = middleware(new NextRequest('http://localhost:3000/admin/dashboard'))

      assert.equal(response.status, 307)
      assert.match(response.headers.get('location') ?? '', /\/auth\/login/)
      assert.equal(response.headers.has(CSP_REPORT_ONLY_HEADER), false)
      assert.equal(response.headers.has('Content-Security-Policy'), false)
    })
  })

  it('adds report-only CSP when enabled without adding enforced CSP', () => {
    withEnvValue('ENABLE_CSP_REPORT_ONLY', 'true', () => {
      const response = middleware(new NextRequest('http://localhost:3000/admin/dashboard'))

      assert.equal(response.status, 307)
      assert.match(response.headers.get('location') ?? '', /\/auth\/login/)
      assert.equal(response.headers.has(CSP_REPORT_ONLY_HEADER), true)
      assert.equal(response.headers.has('Content-Security-Policy'), false)
    })
  })
})
