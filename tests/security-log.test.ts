import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  MAX_SECURITY_LOG_STRING_LENGTH,
  logSecurityEvent,
  maskEmailForLog,
  sanitizeOriginForLog,
  sanitizeSecurityEvent,
  sanitizeStringForLog,
  sanitizeUrlForLog,
} from '@/backend/security/security-log'

test('sanitizeUrlForLog strips query strings and fragments', () => {
  assert.equal(
    sanitizeUrlForLog('https://boilabin.com/account/profile?token=SECRET#section'),
    'https://boilabin.com/account/profile',
  )
  assert.equal(sanitizeUrlForLog('/checkout?token=SECRET#step'), '/checkout')
})

test('sanitizeUrlForLog handles unsupported and invalid URLs safely', () => {
  assert.equal(sanitizeUrlForLog('javascript:alert(1)'), '[unsupported-url]')
  assert.equal(sanitizeUrlForLog('https://user:pass@boilabin.com/account'), '[invalid-url]')
  assert.equal(sanitizeUrlForLog('not a url with spaces'), '[invalid-url]')
  assert.equal(sanitizeUrlForLog('inline'), 'inline')
  assert.equal(sanitizeUrlForLog('data:text/plain,SECRET'), 'data:')
})

test('security log sanitizers reject URL userinfo credentials', () => {
  const event = sanitizeSecurityEvent({
    type: 'mutation_request_blocked',
    timestamp: '2026-06-02T00:00:00.000Z',
    origin: 'https://user:pass@evil.example.test/path',
    metadata: {
      documentUri: 'https://user:pass@boilabin.com/account?token=SECRET',
      sourceOrigin: 'https://admin:secret@evil.example.test',
    },
  })

  assert.equal(sanitizeOriginForLog('https://user:pass@evil.example.test/path'), undefined)
  assert.equal(event.origin, undefined)
  assert.deepEqual(event.metadata, {
    documentUri: '[invalid-url]',
  })
  assert(!JSON.stringify(event).includes('user:pass'))
  assert(!JSON.stringify(event).includes('admin:secret'))
})

test('sanitizeStringForLog caps strings and redacts obvious secret patterns', () => {
  const long = 'a'.repeat(MAX_SECURITY_LOG_STRING_LENGTH + 40)

  assert.equal(sanitizeStringForLog(long)?.length, MAX_SECURITY_LOG_STRING_LENGTH)
  assert.equal(
    sanitizeStringForLog('token=SECRET authorization:Bearer SECRET password=SECRET'),
    '[redacted] [redacted] [redacted]',
  )
})

test('maskEmailForLog masks email addresses', () => {
  assert.equal(maskEmailForLog('Buyer.Person@example.com'), 'b***@e***.com')
  assert.equal(maskEmailForLog('not-an-email'), undefined)
})

test('sanitizeSecurityEvent keeps a safe bounded shape', () => {
  const event = sanitizeSecurityEvent({
    type: 'MUTATION_REQUEST_BLOCKED',
    timestamp: '2026-06-02T00:00:00.000Z',
    route: 'https://boilabin.com/admin/products?token=SECRET#top',
    method: 'post',
    origin: 'https://evil.example.test/path?email=user@example.test',
    userRole: 'admin',
    statusCode: 403,
    errorCode: 'blocked-source',
    detail: 'token=SECRET reason',
    metadata: {
      documentUri: 'https://boilabin.com/checkout?token=SECRET#step',
      blockedUri: 'https://cdn.example.test/app.js?session=SECRET#frag',
      callbackPath: '/checkout?token=SECRET#step',
      buyerEmail: 'buyer@example.com',
      cookie: 'session=SECRET',
      authorization: 'Bearer SECRET',
      rawBody: { password: 'SECRET' },
      phone: '+8801700000000',
      address: 'Dhaka address',
      note: 'password=SECRET remains bounded',
      warnings: ['Set AUTH_URL', 'Set NEXTAUTH_URL'],
      status: 403,
    },
  })

  assert.equal(event.type, 'mutation_request_blocked')
  assert.equal(event.timestamp, '2026-06-02T00:00:00.000Z')
  assert.equal(event.route, '/admin/products')
  assert.equal(event.method, 'POST')
  assert.equal(event.origin, 'https://evil.example.test')
  assert.equal(event.userRole, 'ADMIN')
  assert.equal(event.statusCode, 403)
  assert.equal(event.errorCode, 'blocked-source')
  assert.equal(event.detail, '[redacted] reason')
  assert.deepEqual(event.metadata, {
    documentUri: 'https://boilabin.com/checkout',
    blockedUri: 'https://cdn.example.test/app.js',
    callbackPath: '/checkout',
    buyerEmail: 'b***@e***.com',
    note: '[redacted] remains bounded',
    warnings: ['Set AUTH_URL', 'Set NEXTAUTH_URL'],
    status: 403,
  })

  const serialized = JSON.stringify(event)
  assert(!serialized.includes('SECRET'))
  assert(!serialized.includes('token='))
  assert(!serialized.includes('session='))
  assert(!serialized.includes('cookie'))
  assert(!serialized.includes('authorization'))
  assert(!serialized.includes('rawBody'))
  assert(!serialized.includes('+880'))
  assert(!serialized.includes('Dhaka address'))
})

test('sanitizeSecurityEvent ignores raw errors and stack metadata', () => {
  const rawError = new Error('DATABASE_URL=postgresql://user:pass@example.test/db')
  const event = sanitizeSecurityEvent({
    type: 'server_error',
    route: '/api/orders',
    method: 'POST',
    statusCode: 500,
    errorCode: 'order_creation_failed',
    metadata: {
      error: rawError,
      rawError,
      stack: rawError.stack,
      errorName: 'PrismaClientKnownRequestError',
      feature: 'order_creation',
    },
  })

  assert.deepEqual(event.metadata, {
    errorName: 'PrismaClientKnownRequestError',
    feature: 'order_creation',
  })

  const serialized = JSON.stringify(event)
  assert(!serialized.includes('DATABASE_URL'))
  assert(!serialized.includes('postgresql://'))
  assert(!serialized.includes('stack'))
  assert(!serialized.includes('rawError'))
})

test('logSecurityEvent emits sanitized structured data only', () => {
  const previousWarn = console.warn
  const warnings: unknown[][] = []
  console.warn = (...args: unknown[]) => {
    warnings.push(args)
  }

  try {
    const event = logSecurityEvent({
      type: 'csp_violation_report',
      route: '/api/security/csp-report?token=SECRET#hash',
      method: 'post',
      statusCode: 204,
      metadata: {
        documentUri: 'https://boilabin.com/account?token=SECRET#hash',
        email: 'buyer@example.com',
        authorization: 'Bearer SECRET',
      },
    })

    assert.equal(warnings.length, 1)
    assert.equal(warnings[0][0], 'Security event')
    assert.deepEqual(warnings[0][1], event)

    const serialized = JSON.stringify(warnings)
    assert(!serialized.includes('SECRET'))
    assert(!serialized.includes('token='))
    assert(!serialized.includes('authorization'))
    assert(!serialized.includes('buyer@example.com'))
  } finally {
    console.warn = previousWarn
  }
})
