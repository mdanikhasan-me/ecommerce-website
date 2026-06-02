import { NextRequest, NextResponse } from 'next/server'
import { logSecurityEvent } from '@/backend/security/security-log'

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const TRUSTED_FETCH_SITES = new Set(['same-origin', 'same-site', 'none'])

type RequestSourceInput = {
  method: string
  requestOrigin?: string | null
  origin?: string | null
  referer?: string | null
  secFetchSite?: string | null
  allowedOrigins?: Iterable<string | null | undefined>
  requireSourceHeader?: boolean
}

export type RequestSourceCheck = {
  allowed: boolean
  reason?: 'safe-method' | 'allowed-origin' | 'allowed-referer' | 'trusted-fetch-site' | 'missing-source' | 'blocked-source'
}

export function normalizeOrigin(value: string | null | undefined) {
  if (!value) return null

  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.origin.toLowerCase()
  } catch {
    return null
  }
}

function addOrigin(target: Set<string>, value: string | null | undefined) {
  const normalized = normalizeOrigin(value)
  if (normalized) target.add(normalized)
}

function getFirstHeaderValue(value: string | null) {
  return value?.split(',')[0]?.trim() || null
}

function getOriginFromHost(host: string | null, proto: string | null) {
  const firstHost = getFirstHeaderValue(host)
  if (!firstHost || /[\s/\\]/.test(firstHost)) return null
  const scheme = getFirstHeaderValue(proto) ?? 'https'
  if (scheme !== 'http' && scheme !== 'https') return null
  return `${scheme}://${firstHost}`
}

function configuredOrigins() {
  return [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXTAUTH_URL,
    process.env.APP_URL,
    ...(process.env.CSRF_ALLOWED_ORIGINS?.split(/[\s,]+/) ?? []),
  ]
}

export function getAllowedRequestOrigins(req: NextRequest) {
  const origins = new Set<string>()

  addOrigin(origins, req.nextUrl.origin)
  addOrigin(
    origins,
    getOriginFromHost(
      req.headers.get('x-forwarded-host') ?? req.headers.get('host'),
      req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', ''),
    ),
  )

  for (const origin of configuredOrigins()) {
    addOrigin(origins, origin)
  }

  return origins
}

export function isRequestSourceAllowed(input: RequestSourceInput): RequestSourceCheck {
  const method = input.method.toUpperCase()
  if (!UNSAFE_METHODS.has(method)) {
    return { allowed: true, reason: 'safe-method' }
  }

  const allowedOrigins = new Set<string>()
  addOrigin(allowedOrigins, input.requestOrigin)
  for (const origin of input.allowedOrigins ?? []) {
    addOrigin(allowedOrigins, origin)
  }

  const origin = normalizeOrigin(input.origin)
  if (origin) {
    return allowedOrigins.has(origin)
      ? { allowed: true, reason: 'allowed-origin' }
      : { allowed: false, reason: 'blocked-source' }
  }

  const referer = normalizeOrigin(input.referer)
  if (referer) {
    return allowedOrigins.has(referer)
      ? { allowed: true, reason: 'allowed-referer' }
      : { allowed: false, reason: 'blocked-source' }
  }

  const secFetchSite = input.secFetchSite?.trim().toLowerCase()
  if (secFetchSite) {
    return TRUSTED_FETCH_SITES.has(secFetchSite)
      ? { allowed: true, reason: 'trusted-fetch-site' }
      : { allowed: false, reason: 'blocked-source' }
  }

  return input.requireSourceHeader
    ? { allowed: false, reason: 'missing-source' }
    : { allowed: true, reason: 'missing-source' }
}

export function protectMutationRequest(req: NextRequest) {
  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')
  const secFetchSite = req.headers.get('sec-fetch-site')
  const check = isRequestSourceAllowed({
    method: req.method,
    requestOrigin: req.nextUrl.origin,
    origin,
    referer,
    secFetchSite,
    allowedOrigins: getAllowedRequestOrigins(req),
    requireSourceHeader: process.env.NODE_ENV === 'production',
  })

  if (check.allowed) return null

  logSecurityEvent({
    type: 'mutation_request_blocked',
    severity: 'warn',
    route: req.nextUrl.pathname,
    method: req.method,
    origin: origin ?? referer,
    statusCode: 403,
    errorCode: check.reason,
    metadata: {
      secFetchSite,
    },
  })

  return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
}
