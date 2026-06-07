type CspEnv = Record<string, string | undefined>

export const CSP_REPORT_ONLY_HEADER = 'Content-Security-Policy-Report-Only'
export const CSP_REPORT_ENDPOINT_PATH = '/api/security/csp-report'

export type CspRouteFamily =
  | 'public'
  | 'auth'
  | 'account'
  | 'checkout'
  | 'admin'
  | 'api'
  | 'metadata'

const TRUE_VALUES = new Set(['1', 'true', 'yes'])
const CURRENT_IMAGE_SOURCES = [
  'https://images.unsplash.com',
  'https://uploadthing.com',
  'https://utfs.io',
  'https://lh3.googleusercontent.com',
  'https://placehold.co',
] as const

const LOCAL_CONNECT_SOURCES = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3100',
] as const

const STATIC_ROUTE_PREFIXES = [
  '/_next/static',
  '/_next/image',
  '/assets/',
  '/uploads/',
] as const

const METADATA_ROUTES = new Set([
  '/robots.txt',
  '/sitemap.xml',
  '/opengraph-image',
])

function normalizePathname(pathname: string) {
  if (!pathname.startsWith('/')) return `/${pathname}`
  return pathname
}

function matchesPathSegment(pathname: string, segment: string) {
  return pathname === segment || pathname.startsWith(`${segment}/`)
}

function unique(values: string[]) {
  return Array.from(new Set(values))
}

function serializeDirective(name: string, values: string[]) {
  return `${name} ${unique(values).join(' ')}`
}

function serializeCsp(directives: Array<[string, string[]]>) {
  return directives
    .map(([name, values]) => serializeDirective(name, values))
    .join('; ')
}

export function isCspReportOnlyEnabled(env: CspEnv = process.env) {
  return TRUE_VALUES.has((env.ENABLE_CSP_REPORT_ONLY ?? '').trim().toLowerCase())
}

export function isCspReportCollectionEnabled(env: CspEnv = process.env) {
  return TRUE_VALUES.has((env.ENABLE_CSP_REPORT_COLLECTION ?? '').trim().toLowerCase())
}

export function classifyCspRoute(pathname: string): CspRouteFamily | null {
  const path = normalizePathname(pathname)

  if (STATIC_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix))) return null
  if (METADATA_ROUTES.has(path)) return 'metadata'
  if (matchesPathSegment(path, '/api')) return 'api'
  if (matchesPathSegment(path, '/admin')) return 'admin'
  if (matchesPathSegment(path, '/auth')) return 'auth'
  if (matchesPathSegment(path, '/account')) return 'account'
  if (path.startsWith('/order/')) return 'account'
  if (path === '/checkout' || path.startsWith('/checkout/')) return 'checkout'
  if (path === '/cart' || path.startsWith('/cart/')) return 'checkout'

  return 'public'
}

function withReportUri(
  directives: Array<[string, string[]]>,
  options: { includeReportUri?: boolean } = {},
) {
  if (!options.includeReportUri) return directives
  return [...directives, ['report-uri', [CSP_REPORT_ENDPOINT_PATH]] satisfies [string, string[]]]
}

function buildPagePolicy(
  family: Exclude<CspRouteFamily, 'api' | 'metadata'>,
  options: { includeReportUri?: boolean } = {},
) {
  const formSources = family === 'auth'
    ? ["'self'", 'https://accounts.google.com']
    : ["'self'"]

  const directives: Array<[string, string[]]> = [
    ['default-src', ["'self'"]],
    ['base-uri', ["'self'"]],
    ['object-src', ["'none'"]],
    ['frame-ancestors', ["'none'"]],
    ['form-action', formSources],
    ['script-src', ["'self'", "'unsafe-inline'"]],
    ['style-src', ["'self'", "'unsafe-inline'"]],
    ['img-src', ["'self'", 'data:', 'blob:', ...CURRENT_IMAGE_SOURCES]],
    ['font-src', ["'self'", 'data:']],
    ['connect-src', ["'self'", ...LOCAL_CONNECT_SOURCES]],
    ['media-src', ["'self'", 'blob:']],
    ['manifest-src', ["'self'"]],
    ['worker-src', ["'self'", 'blob:']],
  ]

  return serializeCsp(withReportUri(directives, options))
}

function buildMinimalApiPolicy(options: { includeReportUri?: boolean } = {}) {
  return serializeCsp(withReportUri([
    ['default-src', ["'none'"]],
    ['base-uri', ["'none'"]],
    ['object-src', ["'none'"]],
    ['frame-ancestors', ["'none'"]],
    ['form-action', ["'none'"]],
  ], options))
}

function buildMetadataPolicy(options: { includeReportUri?: boolean } = {}) {
  return serializeCsp(withReportUri([
    ['default-src', ["'none'"]],
    ['base-uri', ["'none'"]],
    ['object-src', ["'none'"]],
    ['frame-ancestors', ["'none'"]],
    ['img-src', ["'self'", 'data:']],
  ], options))
}

export function buildCspReportOnlyPolicyForFamily(
  family: CspRouteFamily,
  options: { includeReportUri?: boolean } = {},
) {
  if (family === 'api') return buildMinimalApiPolicy(options)
  if (family === 'metadata') return buildMetadataPolicy(options)
  return buildPagePolicy(family, options)
}

export function getCspReportOnlyPolicy(pathname: string, env: CspEnv = process.env) {
  const family = classifyCspRoute(pathname)
  return family
    ? buildCspReportOnlyPolicyForFamily(family, {
        includeReportUri: isCspReportOnlyEnabled(env) && isCspReportCollectionEnabled(env),
      })
    : null
}

export function getCspReportOnlyHeader(pathname: string, env: CspEnv = process.env) {
  if (!isCspReportOnlyEnabled(env)) return null

  const value = getCspReportOnlyPolicy(pathname, env)
  if (!value) return null

  return {
    key: CSP_REPORT_ONLY_HEADER,
    value,
  }
}

export const cspKnownImageSources = CURRENT_IMAGE_SOURCES
