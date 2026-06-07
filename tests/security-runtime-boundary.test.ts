import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { NextRequest } from 'next/server'

import middleware, { config as middlewareConfig } from '@/middleware'

const repoRoot = process.cwd()

function readProjectFile(pathname: string) {
  return readFileSync(join(repoRoot, pathname), 'utf8')
}

describe('security runtime route boundary guardrails', () => {
  it('keeps account and admin page families behind middleware redirects', () => {
    const source = readProjectFile('src/middleware.ts')

    assert.match(source, /matchesPathSegment\(pathname, '\/admin'\)/)
    assert.match(source, /matchesPathSegment\(pathname, '\/account'\)/)
    assert.match(source, /authjs\.session-token/)
    assert.match(source, /__Secure-next-auth\.session-token/)
    assert.match(source, /\/auth\/login\?callbackUrl=\$\{encodeURIComponent\(pathname\)\}/)
  })

  it('redirects private admin and account segments without catching public lookalikes', () => {
    const privatePaths = ['/admin', '/admin/products', '/account', '/account/orders']

    for (const pathname of privatePaths) {
      const response = middleware(new NextRequest(`http://localhost:3000${pathname}`))

      assert.equal(response.status, 307, pathname)
      assert.match(response.headers.get('location') ?? '', /\/auth\/login/, pathname)
    }

    for (const pathname of ['/administrator', '/administer/products', '/accounting']) {
      const response = middleware(new NextRequest(`http://localhost:3000${pathname}`))

      assert.equal(response.status, 200, pathname)
      assert.equal(response.headers.get('location'), null, pathname)
    }
  })

  it('only treats exact or chunked auth session cookie names as session hints', () => {
    for (const cookieName of [
      'authjs.session-token-fake',
      '__Secure-authjs.session-token-old',
      'next-auth.session-tokenary',
      '__Secure-next-auth.session-token_backup',
    ]) {
      const response = middleware(new NextRequest('http://localhost:3000/admin/products', {
        headers: { cookie: `${cookieName}=present` },
      }))

      assert.equal(response.status, 307, cookieName)
      assert.match(response.headers.get('location') ?? '', /\/auth\/login/, cookieName)
    }

    for (const cookieName of [
      'authjs.session-token',
      'authjs.session-token.0',
      '__Secure-authjs.session-token.1',
      'next-auth.session-token',
      '__Secure-next-auth.session-token.2',
    ]) {
      const response = middleware(new NextRequest('http://localhost:3000/admin/products', {
        headers: { cookie: `${cookieName}=present` },
      }))

      assert.equal(response.status, 200, cookieName)
      assert.equal(response.headers.get('location'), null, cookieName)
    }
  })

  it('keeps middleware matcher static exclusions segment-aware', () => {
    const matcher = middlewareConfig.matcher[0]
    const matcherRegex = new RegExp(`^${matcher}$`)

    for (const pathname of [
      '/_next/static/chunks/app.js',
      '/_next/image',
      '/assets/logo.svg',
      '/uploads/admin/product.webp',
      '/favicon.ico',
      '/apple-touch-icon.png',
    ]) {
      assert.equal(matcherRegex.test(pathname), false, pathname)
    }

    for (const pathname of [
      '/_next/staticish/chunks/app.js',
      '/_next/image-proxy',
      '/assetsish/logo.svg',
      '/uploadsish/product.webp',
      '/favicon.icology',
      '/apple-touch-icon.png.backup',
    ]) {
      assert.equal(matcherRegex.test(pathname), true, pathname)
    }
  })

  it('keeps checkout and order confirmation private before sensitive order data loads', () => {
    const checkoutSource = readProjectFile('src/app/(store)/checkout/page.tsx')
    const confirmationSource = readProjectFile('src/app/(store)/order/[orderNumber]/confirmation/page.tsx')

    assert.match(checkoutSource, /const session = await auth\(\)/)
    assert.match(checkoutSource, /redirect\('\/auth\/login\?callbackUrl=\/checkout&reason=checkout'\)/)
    assert.match(confirmationSource, /generateNoIndexPageMetadata\(/)
    assert.match(confirmationSource, /if \(!session\?\.user\) notFound\(\)/)
    assert.match(confirmationSource, /\.\.\.\(isOrderAdmin \? \{\} : \{ userId: session\.user\.id \}\)/)
  })

  it('keeps private and utility route families out of public robots/sitemap discovery', () => {
    const robotsSource = readProjectFile('src/app/robots.ts')
    const sitemapSource = readProjectFile('src/app/sitemap.ts')

    for (const privatePath of ['/admin/', '/api/', '/account/', '/checkout/', '/order/', '/track-order']) {
      assert.match(robotsSource, new RegExp(privatePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    }

    for (const privatePath of ['/admin', '/api', '/account', '/checkout', '/order', '/track-order']) {
      assert.doesNotMatch(sitemapSource, new RegExp(`canonicalUrl\\('${privatePath}`))
    }
  })
})

describe('public and buyer API guardrail source coverage', () => {
  const mutationRoutes = [
    ['src/app/api/contact/route.ts', 'contact:create'],
    ['src/app/api/newsletter/route.ts', 'newsletter:create'],
    ['src/app/api/auth/register/route.ts', 'auth:register'],
    ['src/app/api/reviews/route.ts', 'reviews:create'],
    ['src/app/api/orders/route.ts', 'orders:create'],
    ['src/app/api/returns/route.ts', 'returns:create'],
    ['src/app/api/products/[id]/view/route.ts', 'products:view'],
  ] as const

  it('keeps public and buyer mutation routes origin-guarded and rate-limited', () => {
    for (const [pathname, rateLimitKey] of mutationRoutes) {
      const source = readProjectFile(pathname)

      assert.match(source, /protectMutationRequest\(req\)/, pathname)
      assert.match(source, new RegExp(`rateLimit\\(req, \\{ key: '${rateLimitKey}'`), pathname)
    }
  })

  it('keeps GET-only public APIs from using mutation guard response contracts', () => {
    for (const pathname of [
      'src/app/api/coupons/validate/route.ts',
      'src/app/api/products/route.ts',
      'src/app/api/search/suggestions/route.ts',
    ]) {
      const source = readProjectFile(pathname)

      assert.doesNotMatch(source, /protectMutationRequest\(req\)/, pathname)
    }
  })
})

describe('public and buyer API error leakage guardrails', () => {
  const publicBuyerRoutes = [
    'src/app/api/contact/route.ts',
    'src/app/api/newsletter/route.ts',
    'src/app/api/auth/register/route.ts',
    'src/app/api/reviews/route.ts',
    'src/app/api/orders/route.ts',
    'src/app/api/returns/route.ts',
    'src/app/api/products/[id]/view/route.ts',
    'src/app/api/coupons/validate/route.ts',
    'src/app/api/products/route.ts',
    'src/app/api/search/suggestions/route.ts',
  ]

  it('does not return obvious raw internal error objects, stacks, URLs, or secrets', () => {
    for (const pathname of publicBuyerRoutes) {
      const source = readProjectFile(pathname)

      assert.doesNotMatch(source, /NextResponse\.json\(\s*\{\s*error:\s*(?:error|err)\.message\b/, pathname)
      assert.doesNotMatch(source, /String\((?:error|err)\)/, pathname)
      assert.doesNotMatch(source, /JSON\.stringify\((?:error|err)\)/, pathname)
      assert.doesNotMatch(source, /\.(?:stack)\b/, pathname)
      assert.doesNotMatch(source, /DATABASE_URL|postgres(?:ql)?:\/\/|authorization:\s|bearer token/i, pathname)
    }
  })
})
