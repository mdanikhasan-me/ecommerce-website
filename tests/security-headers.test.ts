import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { describe, it } from 'node:test'

const require = createRequire(import.meta.url)

type HeaderEntry = {
  source: string
  headers: Array<{ key: string; value: string }>
}

type NextConfigWithHeaders = {
  headers: () => Promise<HeaderEntry[]>
  images?: {
    dangerouslyAllowSVG?: boolean
    contentDispositionType?: string
    contentSecurityPolicy?: string
  }
}

const nextConfig = require('../next.config.js') as NextConfigWithHeaders

async function getRootSecurityHeaders() {
  const entries = await nextConfig.headers()
  const rootHeaders = entries.find((entry) => entry.source === '/:path*')
  assert.ok(rootHeaders, 'expected a global /:path* header rule')

  return new Map(rootHeaders.headers.map((header) => [header.key, header.value]))
}

describe('security headers config', () => {
  it('sets conservative global browser hardening headers', async () => {
    const headers = await getRootSecurityHeaders()

    assert.equal(headers.get('X-Content-Type-Options'), 'nosniff')
    assert.equal(headers.get('X-Frame-Options'), 'DENY')
    assert.equal(headers.get('X-DNS-Prefetch-Control'), 'off')
    assert.equal(headers.get('X-Permitted-Cross-Domain-Policies'), 'none')
    assert.equal(headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin')
    assert.equal(headers.get('Permissions-Policy'), 'camera=(), microphone=(), geolocation=(), payment=()')
  })

  it('enables HSTS only for production builds', async () => {
    const previousNodeEnv = process.env.NODE_ENV

    try {
      Reflect.set(process.env, 'NODE_ENV', 'development')
      assert.equal((await getRootSecurityHeaders()).has('Strict-Transport-Security'), false)

      Reflect.set(process.env, 'NODE_ENV', 'production')
      assert.equal(
        (await getRootSecurityHeaders()).get('Strict-Transport-Security'),
        'max-age=31536000; includeSubDomains; preload',
      )
    } finally {
      if (previousNodeEnv === undefined) {
        Reflect.deleteProperty(process.env, 'NODE_ENV')
      } else {
        Reflect.set(process.env, 'NODE_ENV', previousNodeEnv)
      }
    }
  })

  it('serves optimized SVGs with defensive content handling', () => {
    assert.equal(nextConfig.images?.dangerouslyAllowSVG, true)
    assert.equal(nextConfig.images?.contentDispositionType, 'attachment')
    assert.equal(nextConfig.images?.contentSecurityPolicy, "default-src 'self'; script-src 'none'; sandbox;")
  })
})
