import { NextRequest, NextResponse } from 'next/server'

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

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = req.headers.get('x-real-ip')?.trim()
  return forwardedFor || realIp || 'unknown'
}

function pruneExpired(now: number) {
  if (buckets.size < 1000) return

  for (const [key, entry] of buckets.entries()) {
    if (entry.resetAt <= now) buckets.delete(key)
  }
}

export function rateLimit(req: NextRequest, options: RateLimitOptions) {
  const now = Date.now()
  pruneExpired(now)

  const bucketKey = `${options.key}:${getClientIp(req)}`
  const current = buckets.get(bucketKey)

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + options.windowMs })
    return null
  }

  if (current.count >= options.limit) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      },
    )
  }

  current.count += 1
  return null
}
