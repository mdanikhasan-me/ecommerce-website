const FALLBACK_ORIGIN = 'https://boilabin.local'

export function getSafeCallbackUrl(value: string | null | undefined, fallback = '/') {
  const trimmed = value?.trim()
  if (!trimmed) return fallback
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) return fallback

  try {
    const url = new URL(trimmed, FALLBACK_ORIGIN)
    if (url.origin !== FALLBACK_ORIGIN) return fallback
    return `${url.pathname}${url.search}${url.hash}` || fallback
  } catch {
    return fallback
  }
}
