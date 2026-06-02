import { NextRequest, NextResponse } from 'next/server'
import { logSecurityEvent } from '@/backend/security/security-log'

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
}

const buckets = new Map<string, RateLimitEntry>()
const PRUNE_THRESHOLD = 1000
const MAX_BUCKETS = 10_000
const MAX_CLIENT_ID_LENGTH = 128

function sanitizeClientIdentifier(value: string | null | undefined) {
  const cleaned = value?.trim()
  if (!cleaned || cleaned.length > MAX_CLIENT_ID_LENGTH) return null
  if (/[\s"'`\\]/.test(cleaned)) return null
  return cleaned
}

function getClientIp(req: NextRequest) {
  const forwardedFor = sanitizeClientIdentifier(req.headers.get('x-forwarded-for')?.split(',')[0])
  const realIp = sanitizeClientIdentifier(req.headers.get('x-real-ip'))
  return forwardedFor || realIp || 'unknown'
}

function pruneExpired(now: number) {
  if (buckets.size < PRUNE_THRESHOLD) return

  for (const [key, entry] of buckets.entries()) {
    if (entry.resetAt <= now) buckets.delete(key)
  }
}

function enforceBucketLimit() {
  while (buckets.size > MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value
    if (!oldestKey) break
    buckets.delete(oldestKey)
  }
}

export function rateLimit(req: NextRequest, options: RateLimitOptions) {
  const now = Date.now()
  pruneExpired(now)

  const bucketKey = `${options.key}:${getClientIp(req)}`
  const current = buckets.get(bucketKey)

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + options.windowMs })
    enforceBucketLimit()
    return null
  }

  if (current.count >= options.limit) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000)
    logSecurityEvent({
      type: 'rate_limit_exceeded',
      severity: 'warn',
      route: req.nextUrl.pathname,
      method: req.method,
      statusCode: 429,
      errorCode: 'rate_limit_exceeded',
      metadata: {
        key: options.key,
        limit: options.limit,
        windowMs: options.windowMs,
      },
    })

    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(options.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(current.resetAt / 1000)),
        },
      },
    )
  }

  current.count += 1
  return null
}
