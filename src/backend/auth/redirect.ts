const BLOCKED_REDIRECT_ROUTE_SEGMENTS = [
  '/_next',
  '/api',
  '/auth',
] as const
const BLOCKED_REDIRECT_EXACT_ROUTES = new Set([
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/opengraph-image',
  '/robots.txt',
  '/sitemap.xml',
])
const BLOCKED_REDIRECT_ROUTE_PREFIXES = [
  '/assets/',
  '/uploads/',
] as const

function matchesPathSegment(pathname: string, segment: string) {
  return pathname === segment || pathname.startsWith(`${segment}/`)
}

function parseHttpUrl(value: string | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (url.username || url.password) return null
    return url
  } catch {
    return null
  }
}

function decodeRedirectPathname(pathname: string) {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return null
  }
}

function isAllowedRedirectPathname(pathname: string) {
  const decodedPathname = decodeRedirectPathname(pathname)
  if (!decodedPathname || decodedPathname.startsWith('//') || decodedPathname.includes('\\')) return false
  if (BLOCKED_REDIRECT_EXACT_ROUTES.has(decodedPathname)) return false
  if (BLOCKED_REDIRECT_ROUTE_SEGMENTS.some((segment) => matchesPathSegment(decodedPathname, segment))) return false
  if (BLOCKED_REDIRECT_ROUTE_PREFIXES.some((prefix) => decodedPathname.startsWith(prefix))) return false
  return true
}

function parseRedirectTarget(value: string, baseOrigin: string) {
  const trimmed = value.trim()
  if (!trimmed || trimmed.includes('\\')) return null

  try {
    const url = trimmed.startsWith('/')
      ? new URL(trimmed, baseOrigin)
      : new URL(trimmed)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (url.username || url.password) return null
    if (url.origin !== baseOrigin) return null
    if (!isAllowedRedirectPathname(url.pathname)) return null

    return url
  } catch {
    return null
  }
}

export function getSafeAuthRedirectUrl(value: string, baseUrl: string) {
  const base = parseHttpUrl(baseUrl)
  if (!base) return '/'

  const baseOrigin = base.origin
  const target = parseRedirectTarget(value, baseOrigin)

  return target?.toString() ?? baseOrigin
}
