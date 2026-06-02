const DEFAULT_SITE_URL = 'https://boilabin.com'
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1'])

type SeoUrlEnv = Record<string, string | undefined>

function isHttpUrl(url: URL) {
  return url.protocol === 'http:' || url.protocol === 'https:'
}

function isLocalHostname(hostname: string) {
  return LOCAL_HOSTNAMES.has(hostname)
}

export function normalizeSiteUrl(value: string | null | undefined, env: SeoUrlEnv = process.env) {
  const candidate = value?.trim() || DEFAULT_SITE_URL

  try {
    const url = new URL(candidate)
    if (!isHttpUrl(url)) return DEFAULT_SITE_URL
    if (isLocalHostname(url.hostname)) return DEFAULT_SITE_URL
    return url.origin
  } catch {
    return DEFAULT_SITE_URL
  }
}

export function getSiteUrl(env: SeoUrlEnv = process.env) {
  return normalizeSiteUrl(env.NEXT_PUBLIC_SITE_URL, env)
}

export function toAbsoluteUrl(value: string | null | undefined, siteUrl = getSiteUrl()) {
  const trimmed = value?.trim()
  if (!trimmed) return undefined

  if (trimmed.startsWith('//')) return `https:${trimmed}`

  try {
    const parsed = new URL(trimmed)
    return isHttpUrl(parsed) ? parsed.toString() : undefined
  } catch {
    try {
      return new URL(trimmed.startsWith('/') ? trimmed : `/${trimmed}`, siteUrl).toString()
    } catch {
      return undefined
    }
  }
}

export function canonicalUrl(path = '', siteUrl = getSiteUrl()) {
  return toAbsoluteUrl(path || '/', siteUrl) ?? siteUrl
}
