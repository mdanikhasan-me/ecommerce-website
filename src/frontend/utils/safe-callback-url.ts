const FALLBACK_ORIGIN = 'https://boilabin.local'
const BLOCKED_CALLBACK_ROUTE_SEGMENTS = [
  '/_next',
  '/api',
  '/auth',
] as const
const BLOCKED_CALLBACK_ROUTE_PREFIXES = [
  '/assets/',
  '/uploads/',
] as const

function matchesPathSegment(pathname: string, segment: string) {
  return pathname === segment || pathname.startsWith(`${segment}/`)
}

function normalizeInternalCallbackPath(value: string | null | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return null
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) return null

  try {
    const url = new URL(trimmed, FALLBACK_ORIGIN)
    if (url.origin !== FALLBACK_ORIGIN) return null
    if (BLOCKED_CALLBACK_ROUTE_SEGMENTS.some((segment) => matchesPathSegment(url.pathname, segment))) return null
    if (BLOCKED_CALLBACK_ROUTE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return null
    return `${url.pathname}${url.search}${url.hash}` || null
  } catch {
    return null
  }
}

export function getSafeCallbackUrl(value: string | null | undefined, fallback = '/') {
  const safeFallback = normalizeInternalCallbackPath(fallback) ?? '/'
  return normalizeInternalCallbackPath(value) ?? safeFallback
}
