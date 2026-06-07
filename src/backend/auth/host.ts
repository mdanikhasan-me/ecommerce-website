type AuthHostEnv = Record<string, string | undefined>

const TRUE_VALUES = new Set(['1', 'true', 'yes'])
const FALSE_VALUES = new Set(['0', 'false', 'no'])
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])

function parseBooleanEnv(value: string | undefined): boolean | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (TRUE_VALUES.has(normalized)) return true
  if (FALSE_VALUES.has(normalized)) return false
  return null
}

function parseOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.origin
  } catch {
    return null
  }
}

function getConfiguredAuthOrigin(env: AuthHostEnv): string | null {
  return parseOrigin(env.AUTH_URL) ?? parseOrigin(env.NEXTAUTH_URL) ?? parseOrigin(env.NEXT_PUBLIC_SITE_URL)
}

function isLocalOrigin(origin: string | null) {
  if (!origin) return false

  try {
    return LOCAL_HOSTNAMES.has(new URL(origin).hostname)
  } catch {
    return false
  }
}

function hasManagedHostSignal(env: AuthHostEnv) {
  return Boolean(
    env.VERCEL ||
      env.NETLIFY ||
      env.CF_PAGES ||
      env.RENDER ||
      env.RAILWAY_ENVIRONMENT ||
      env.FLY_APP_NAME,
  )
}

export function shouldTrustAuthHost(env: AuthHostEnv = process.env) {
  const explicit = parseBooleanEnv(env.AUTH_TRUST_HOST)
  if (explicit !== null) return explicit

  if (env.NODE_ENV !== 'production') return true
  if (isLocalOrigin(getConfiguredAuthOrigin(env))) return true

  return hasManagedHostSignal(env)
}

export function getAuthHostConfigurationWarnings(env: AuthHostEnv = process.env) {
  const warnings: string[] = []
  const authOrigin = parseOrigin(env.AUTH_URL)
  const nextAuthOrigin = parseOrigin(env.NEXTAUTH_URL)
  const publicOrigin = parseOrigin(env.NEXT_PUBLIC_SITE_URL)
  const hasExplicitTrustHost = parseBooleanEnv(env.AUTH_TRUST_HOST) !== null
  const trustsHost = shouldTrustAuthHost(env)

  if (env.AUTH_TRUST_HOST && parseBooleanEnv(env.AUTH_TRUST_HOST) === null) {
    warnings.push('AUTH_TRUST_HOST should be one of true, false, 1, or 0.')
  }

  if (!authOrigin && !nextAuthOrigin && !publicOrigin) {
    warnings.push('Set AUTH_URL or NEXTAUTH_URL to the canonical app origin.')
  }

  if (authOrigin && nextAuthOrigin && authOrigin !== nextAuthOrigin) {
    warnings.push('AUTH_URL and NEXTAUTH_URL resolve to different origins.')
  }

  if (!trustsHost && !hasExplicitTrustHost && env.NODE_ENV === 'production') {
    warnings.push('Set AUTH_TRUST_HOST=true for trusted reverse proxies or managed hosting.')
  }

  return warnings
}
