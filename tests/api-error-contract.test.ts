import assert from 'node:assert/strict'
import { test } from 'node:test'
import { NextRequest } from 'next/server'

import { POST as postRegister } from '@/app/api/auth/register/route'
import { POST as postContact } from '@/app/api/contact/route'
import { GET as getCouponValidation } from '@/app/api/coupons/validate/route'
import { POST as postNewsletter } from '@/app/api/newsletter/route'
import { POST as postProductView } from '@/app/api/products/[id]/view/route'
import { GET as getReviews, POST as postReview } from '@/app/api/reviews/route'
import { GET as getSearchSuggestions } from '@/app/api/search/suggestions/route'
import { POST as postCspReport } from '@/app/api/security/csp-report/route'
import { rateLimit } from '@/backend/security/rate-limit'
import { protectMutationRequest } from '@/backend/security/request-guard'

let requestCounter = 0

function nextTestIp() {
  requestCounter += 1
  return `203.0.113.${requestCounter}`
}

function createJsonPost(pathname: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(`http://localhost:3000${pathname}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost:3000',
      'x-forwarded-for': nextTestIp(),
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

function createTextPost(pathname: string, body: string, headers: Record<string, string> = {}) {
  return new NextRequest(`http://localhost:3000${pathname}`, {
    method: 'POST',
    headers: {
      'content-type': 'text/plain',
      'x-forwarded-for': nextTestIp(),
      ...headers,
    },
    body,
  })
}

async function withEnvValue<T>(
  key: string,
  value: string | undefined,
  callback: () => Promise<T>,
): Promise<T> {
  const previous = process.env[key]

  if (value === undefined) {
    delete process.env[key]
  } else {
    process.env[key] = value
  }

  try {
    return await callback()
  } finally {
    if (previous === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = previous
    }
  }
}

async function captureWarnings<T>(callback: () => Promise<T>) {
  const previousWarn = console.warn
  const warnings: unknown[][] = []
  console.warn = (...args: unknown[]) => {
    warnings.push(args)
  }

  try {
    const result = await callback()
    return { result, warnings }
  } finally {
    console.warn = previousWarn
  }
}

test('mutation guard returns a stable forbidden JSON response', async () => {
  const { result: response, warnings } = await captureWarnings(async () => (
    protectMutationRequest(
      new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          origin: 'https://evil.example.test',
        },
      }),
    )
  ))

  assert(response)
  assert.equal(response.status, 403)
  assert.deepEqual(await response.json(), { error: 'Invalid request origin' })
  assert.equal(warnings.length, 1)
})

test('mutation guard returns missing-source JSON response when production requires a source signal', async () => {
  await withEnvValue('NODE_ENV', 'production', async () => {
    const { result: response, warnings } = await captureWarnings(async () => (
      protectMutationRequest(
        new NextRequest('http://localhost:3000/api/contact', {
          method: 'POST',
        }),
      )
    ))

    assert(response)
    assert.equal(response.status, 403)
    assert.deepEqual(await response.json(), { error: 'Invalid request origin' })
    assert.equal(warnings.length, 1)
  })
})

test('rate limiter returns contract error JSON and rate-limit headers', async () => {
  const ip = nextTestIp()
  const key = `api-contract:${Date.now()}:${Math.random()}`
  const options = { key, limit: 1, windowMs: 60_000 }
  const createRequest = () => new NextRequest('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: {
      'x-forwarded-for': ip,
    },
  })

  assert.equal(rateLimit(createRequest(), options), null)

  const { result: response, warnings } = await captureWarnings(async () => rateLimit(createRequest(), options))

  assert(response)
  assert.equal(response.status, 429)
  assert.deepEqual(await response.json(), { error: 'Too many requests. Please try again shortly.' })
  assert.equal(response.headers.get('X-RateLimit-Limit'), '1')
  assert.equal(response.headers.get('X-RateLimit-Remaining'), '0')
  assert.match(response.headers.get('Retry-After') ?? '', /^\d+$/)
  assert.equal(warnings.length, 1)
})

test('rate limiter treats unsafe forwarded identifiers as unknown but keeps the response contract', async () => {
  const key = `api-contract-unsafe-forwarded:${Date.now()}:${Math.random()}`
  const options = { key, limit: 1, windowMs: 60_000 }
  const createRequest = () => new NextRequest('http://localhost:3000/api/newsletter', {
    method: 'POST',
    headers: {
      'x-forwarded-for': '203.0.113.99 bad',
      'x-real-ip': '198.51.100.50\\bad',
    },
  })

  assert.equal(rateLimit(createRequest(), options), null)

  const { result: response, warnings } = await captureWarnings(async () => rateLimit(createRequest(), options))

  assert(response)
  assert.equal(response.status, 429)
  assert.deepEqual(await response.json(), { error: 'Too many requests. Please try again shortly.' })
  assert.equal(response.headers.get('X-RateLimit-Limit'), '1')
  assert.equal(response.headers.get('X-RateLimit-Remaining'), '0')
  assert.equal(warnings.length, 1)
})

test('CSP report endpoint returns disabled-by-default JSON contract', async () => {
  await withEnvValue('ENABLE_CSP_REPORT_COLLECTION', undefined, async () => {
    const response = await postCspReport(
      createJsonPost('/api/security/csp-report', {
        'csp-report': {
          'document-uri': 'https://boilabin.com/?token=SECRET',
        },
      }),
    )

    assert.equal(response.status, 404)
    assert.deepEqual(await response.json(), { error: 'Not found' })
  })
})

test('CSP report endpoint returns unsupported content-type contract when enabled', async () => {
  await withEnvValue('ENABLE_CSP_REPORT_COLLECTION', 'true', async () => {
    const response = await postCspReport(
      createTextPost('/api/security/csp-report', JSON.stringify({
        'csp-report': {
          'document-uri': 'https://boilabin.com/',
        },
      })),
    )

    assert.equal(response.status, 415)
    assert.deepEqual(await response.json(), { error: 'Unsupported content type' })
  })
})

test('CSP report endpoint returns invalid JSON contract when enabled', async () => {
  await withEnvValue('ENABLE_CSP_REPORT_COLLECTION', 'true', async () => {
    const response = await postCspReport(
      new NextRequest('http://localhost:3000/api/security/csp-report', {
        method: 'POST',
        headers: {
          'content-type': 'application/csp-report',
        },
        body: '{invalid-json',
      }),
    )

    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { error: 'Invalid JSON' })
  })
})

test('CSP report endpoint returns invalid report contract when enabled', async () => {
  await withEnvValue('ENABLE_CSP_REPORT_COLLECTION', 'true', async () => {
    const response = await postCspReport(createJsonPost('/api/security/csp-report', { report: {} }))

    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { error: 'Invalid CSP report' })
  })
})

test('contact API validation returns error JSON before database writes', async () => {
  const response = await postContact(createJsonPost('/api/contact', {}))

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'All fields are required' })
})

test('contact API invalid email and subject branches return validation JSON before database writes', async () => {
  const invalidEmail = await postContact(createJsonPost('/api/contact', {
    name: 'Test User',
    email: 'not-an-email',
    subject: 'Other',
    message: 'I need help with my order.',
  }))
  const invalidSubject = await postContact(createJsonPost('/api/contact', {
    name: 'Test User',
    email: 'user@example.test',
    subject: 'Unsupported Subject',
    message: 'I need help with my order.',
  }))

  assert.equal(invalidEmail.status, 400)
  assert.deepEqual(await invalidEmail.json(), { error: 'Invalid email address' })
  assert.equal(invalidSubject.status, 400)
  assert.deepEqual(await invalidSubject.json(), { error: 'Invalid subject' })
})

test('newsletter API validation returns error JSON before database writes', async () => {
  const response = await postNewsletter(createJsonPost('/api/newsletter', { email: 'not-an-email' }))

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'Invalid email address' })
})

test('newsletter API malformed JSON returns validation JSON before database writes', async () => {
  const response = await postNewsletter(
    new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'http://localhost:3000',
        'x-forwarded-for': nextTestIp(),
      },
      body: '{invalid-json',
    }),
  )

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'Invalid email address' })
})

test('register API validation returns error JSON before database lookup', async () => {
  const response = await postRegister(createJsonPost('/api/auth/register', { email: 'invalid' }))

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'Invalid input' })
})

test('register API missing name and short password return validation JSON before database lookup', async () => {
  const missingName = await postRegister(createJsonPost('/api/auth/register', {
    email: 'user@example.test',
    password: 'password123',
  }))
  const shortPassword = await postRegister(createJsonPost('/api/auth/register', {
    name: 'Test User',
    email: 'user@example.test',
    password: 'short',
  }))

  assert.equal(missingName.status, 400)
  assert.deepEqual(await missingName.json(), { error: 'Invalid input' })
  assert.equal(shortPassword.status, 400)
  assert.deepEqual(await shortPassword.json(), { error: 'Invalid input' })
})

test('coupon validation missing-code branch returns error JSON before database lookup', async () => {
  const response = await getCouponValidation(
    new NextRequest('http://localhost:3000/api/coupons/validate?amount=1000'),
  )

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'Coupon code required' })
})

test('coupon validation invalid amount returns coupon error JSON before database lookup', async () => {
  const response = await getCouponValidation(
    new NextRequest('http://localhost:3000/api/coupons/validate?code=SAVE500&amount=not-a-number'),
  )

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { success: false, error: 'Invalid coupon amount' })
})

test('coupon validation malformed productIds are ignored before database lookup when code is missing', async () => {
  const response = await getCouponValidation(
    new NextRequest('http://localhost:3000/api/coupons/validate?amount=1000&productIds=../../bad,valid-id'),
  )

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'Coupon code required' })
})

test('reviews GET missing productId returns validation JSON before database lookup', async () => {
  const response = await getReviews(new NextRequest('http://localhost:3000/api/reviews'))

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'productId required' })
})

test('reviews GET invalid productId returns validation JSON before database lookup', async () => {
  const response = await getReviews(
    new NextRequest('http://localhost:3000/api/reviews?productId=../../bad'),
  )

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'productId required' })
})

test('search suggestions short sanitized query returns empty suggestions before database lookup', async () => {
  const response = await getSearchSuggestions(
    new NextRequest('http://localhost:3000/api/search/suggestions?q=%00%20a'),
  )

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { suggestions: [] })
})

test('product view invalid id returns not found before database lookup', async () => {
  const response = await postProductView(
    createJsonPost('/api/products/../../bad/view', {}, {}),
    { params: Promise.resolve({ id: '../../bad' }) },
  )

  assert.equal(response.status, 404)
  assert.deepEqual(await response.json(), { error: 'Product not found' })
})

test('reviews POST blocked-origin branch returns before auth or database access', async () => {
  const { result: response, warnings } = await captureWarnings(async () => (
    postReview(createJsonPost('/api/reviews', { productId: 'p1', rating: 5, body: 'This is a useful review body.' }, {
      origin: 'https://evil.example.test',
    }))
  ))

  assert.equal(response.status, 403)
  assert.deepEqual(await response.json(), { error: 'Invalid request origin' })
  assert.equal(warnings.length, 1)
})
