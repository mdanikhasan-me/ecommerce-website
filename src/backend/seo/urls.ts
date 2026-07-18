const DEFAULT_SITE_URL = 'https://boilabin.com'
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])

type SeoUrlEnv = Record<string, string | undefined>

function isHttpUrl(url: URL) {
  return url.protocol === 'http:' || url.protocol === 'https:'
}

function hasUrlUserinfo(url: URL) {
  return Boolean(url.username || url.password)
}

function isSafeHttpUrl(url: URL) {
  return isHttpUrl(url) && !hasUrlUserinfo(url)
}

function isLocalHostname(hostname: string) {
  return LOCAL_HOSTNAMES.has(hostname)
}

export function normalizeSiteUrl(value: string | null | undefined) {
  const candidate = value?.trim() || DEFAULT_SITE_URL

  try {
    const url = new URL(candidate)
    if (!isSafeHttpUrl(url)) return DEFAULT_SITE_URL
    if (isLocalHostname(url.hostname)) return DEFAULT_SITE_URL
    return url.origin
  } catch {
    return DEFAULT_SITE_URL
  }
}

export function getSiteUrl(env: SeoUrlEnv = process.env) {
  return normalizeSiteUrl(env.NEXT_PUBLIC_SITE_URL)
}

export function toAbsoluteUrl(value: string | null | undefined, siteUrl = getSiteUrl()) {
  const trimmed = value?.trim()
  if (!trimmed) return undefined

  try {
    const parsed = trimmed.startsWith('//')
      ? new URL(`https:${trimmed}`)
      : new URL(trimmed)

    return isSafeHttpUrl(parsed) ? parsed.toString() : undefined
  } catch {
    try {
      const parsed = new URL(
        trimmed.startsWith('/') ? trimmed : `/${trimmed}`,
        normalizeSiteUrl(siteUrl),
      )

      return isSafeHttpUrl(parsed) ? parsed.toString() : undefined
    } catch {
      return undefined
    }
  }
}

export function canonicalUrl(path = '', siteUrl = getSiteUrl()) {
  const safeSiteUrl = normalizeSiteUrl(siteUrl)
  return toAbsoluteUrl(path || '/', safeSiteUrl) ?? safeSiteUrl
}
