import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  isSafeClientErrorMessage,
  toSafeClientError,
  toSafeClientErrorMessage,
} from '@/backend/security/client-error'

test('safe validation messages pass through', () => {
  assert.equal(
    toSafeClientErrorMessage(new Error('Coupon code is required'), 'Invalid request.'),
    'Coupon code is required',
  )
  assert.equal(
    toSafeClientErrorMessage('One or more selected products were not found', 'Invalid request.'),
    'One or more selected products were not found',
  )
})

test('safe messages are normalized and bounded before returning to clients', () => {
  const longMessage = 'x'.repeat(220)

  assert.equal(
    toSafeClientErrorMessage('  Review   body\tis\nrequired  ', 'Invalid request.'),
    'Review body is required',
  )
  assert.equal(toSafeClientErrorMessage(longMessage, 'Invalid request.'), 'x'.repeat(180))
})

test('unauthorized messages keep the existing status behavior', () => {
  assert.deepEqual(toSafeClientError(new Error('Unauthorized'), 'Could not load users'), {
    message: 'Unauthorized',
    status: 401,
  })
})

test('fallback messages are normalized and defaulted when unsafe or blank', () => {
  assert.equal(
    toSafeClientErrorMessage('Prisma P2025 stack leaked', '  Could   not\tload\nreports  '),
    'Could not load reports',
  )
  assert.equal(
    toSafeClientErrorMessage('Prisma P2025 stack leaked', '   '),
    'Request could not be completed.',
  )
})

test('Prisma and database internals are replaced with fallback messages', () => {
  const prisma = new Error(
    'Invalid `prisma.product.update()` invocation: Unique constraint failed on the fields: (`slug`)',
  )
  const databaseUrl = new Error('DATABASE_URL=postgresql://user:pass@example.test/db could not connect')

  assert.equal(toSafeClientErrorMessage(prisma, 'Unable to update product'), 'Unable to update product')
  assert.equal(toSafeClientErrorMessage(databaseUrl, 'Request could not be completed.'), 'Request could not be completed.')
})

test('stack traces, file paths, tokens, and full URLs are unsafe', () => {
  const cases = [
    'Error: failed\n    at handler (P:/Projects/E-commers/boilabin-marketplace/src/app/api/orders/route.ts:1:1)',
    'Could not read C:\\Users\\anikh\\secret.txt',
    'Callback failed: https://boilabin.com/auth?token=SECRET#frag',
    'Bearer token leaked in helper message',
  ]

  for (const value of cases) {
    assert.equal(isSafeClientErrorMessage(value), false, value)
    assert.equal(toSafeClientErrorMessage(value, 'Request could not be completed.'), 'Request could not be completed.')
  }
})

test('unknown non-error values use fallback messages', () => {
  assert.equal(toSafeClientErrorMessage({ message: 'raw object' }, 'Invalid request.'), 'Invalid request.')
  assert.deepEqual(toSafeClientError(null, 'Could not load reports'), {
    message: 'Could not load reports',
    status: 400,
  })
})

test('safe errors preserve custom default status and unsafe errors keep sanitized status', () => {
  assert.deepEqual(toSafeClientError(new Error('Invalid coupon amount'), 'Could not validate coupon', 422), {
    message: 'Invalid coupon amount',
    status: 422,
  })
  assert.deepEqual(toSafeClientError(new Error('DATABASE_URL leaked'), 'Could not validate coupon', 422), {
    message: 'Could not validate coupon',
    status: 422,
  })
})
