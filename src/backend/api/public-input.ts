export const MAX_PUBLIC_ID_LENGTH = 80
export const MAX_COUPON_CODE_LENGTH = 40
export const MAX_COUPON_AMOUNT = 10_000_000
export const MAX_PUBLIC_PRODUCT_IDS = 50
export const MAX_PUBLIC_SEARCH_QUERY_LENGTH = 120
export const MAX_PUBLIC_SEARCH_WORDS = 10

const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]+$/
const SAFE_COUPON_CODE_PATTERN = /^[A-Z0-9_-]+$/

export function parsePublicId(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  if (!normalized || normalized.length > MAX_PUBLIC_ID_LENGTH) return null
  return SAFE_ID_PATTERN.test(normalized) ? normalized : null
}

export function parsePublicIdList(value: unknown): string[] {
  if (typeof value !== 'string') return []

  return Array.from(
    new Set(
      value
        .split(',')
        .map((id) => parsePublicId(id))
        .filter((id): id is string => Boolean(id)),
    ),
  ).slice(0, MAX_PUBLIC_PRODUCT_IDS)
}

export function parseCouponCode(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toUpperCase()
  if (!normalized || normalized.length > MAX_COUPON_CODE_LENGTH) return null
  return SAFE_COUPON_CODE_PATTERN.test(normalized) ? normalized : null
}

export function parseCouponAmount(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  if (!normalized) return 0

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.min(parsed, MAX_COUPON_AMOUNT)
}

export function parsePublicSearchQuery(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')

  if (!normalized) return null
  return normalized.slice(0, MAX_PUBLIC_SEARCH_QUERY_LENGTH)
}

export function getPublicSearchWords(query: string): string[] {
  return Array.from(
    new Set(query.toLowerCase().split(/\s+/).filter((word) => word.length >= 2)),
  ).slice(0, MAX_PUBLIC_SEARCH_WORDS)
}
