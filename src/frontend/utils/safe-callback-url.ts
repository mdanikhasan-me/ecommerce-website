const FALLBACK_ORIGIN = 'https://boilabin.local'

function normalizeInternalCallbackPath(value: string | null | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return null
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) return null

  try {
    const url = new URL(trimmed, FALLBACK_ORIGIN)
    if (url.origin !== FALLBACK_ORIGIN) return null
    return `${url.pathname}${url.search}${url.hash}` || null
  } catch {
    return null
  }
}

export function getSafeCallbackUrl(value: string | null | undefined, fallback = '/') {
  const safeFallback = normalizeInternalCallbackPath(fallback) ?? '/'
  return normalizeInternalCallbackPath(value) ?? safeFallback
}
