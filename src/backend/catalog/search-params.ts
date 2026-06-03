export const DEFAULT_SEARCH_PAGE = 1
export const MAX_SEARCH_PAGE = 1000
export const MAX_SEARCH_QUERY_LENGTH = 120
export const MAX_SEARCH_SLUG_LENGTH = 80
export const MAX_SEARCH_PRICE = 10_000_000

export const SEARCH_SORT_OPTIONS = ['popular', 'newest', 'price_asc', 'price_desc', 'rating'] as const
export type SearchSort = (typeof SEARCH_SORT_OPTIONS)[number]

export type RawSearchParams = Record<string, string | string[] | undefined>

export type SanitizedSearchParams = Record<string, string | undefined> & {
  q?: string
  category?: string
  minPrice?: string
  maxPrice?: string
  rating?: string
  inStock?: 'true'
  sort?: SearchSort
  page?: string
  featured?: 'true'
}

export type ParsedSearchParams = {
  q?: string
  category?: string
  minPrice: number | null
  maxPrice: number | null
  rating: number | null
  inStock: boolean
  sort: SearchSort
  page: number
  featured: boolean
  queryParams: SanitizedSearchParams
}

const SEARCH_SORT_SET = new Set<string>(SEARCH_SORT_OPTIONS)

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function normalizeSearchText(value: string | undefined): string | undefined {
  const normalized = value
    ?.replace(/[\x00-\x1F\x7F]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')

  if (!normalized) return undefined
  return normalized.slice(0, MAX_SEARCH_QUERY_LENGTH)
}

function normalizeSlug(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase()
  if (!normalized || normalized.length > MAX_SEARCH_SLUG_LENGTH) return undefined
  return /^[a-z0-9][a-z0-9-]*$/.test(normalized) ? normalized : undefined
}

function normalizePage(value: string | undefined): number {
  const normalized = value?.trim()
  if (!normalized || !/^\d+$/.test(normalized)) return DEFAULT_SEARCH_PAGE

  const parsed = Number(normalized)
  if (!Number.isSafeInteger(parsed) || parsed < DEFAULT_SEARCH_PAGE) return DEFAULT_SEARCH_PAGE
  return Math.min(parsed, MAX_SEARCH_PAGE)
}

function normalizePrice(value: string | undefined): number | null {
  const normalized = value?.trim()
  if (!normalized) return null

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.min(parsed, MAX_SEARCH_PRICE)
}

function normalizeRating(value: string | undefined): number | null {
  const normalized = value?.trim()
  if (!normalized) return null

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) return null
  return parsed
}

function normalizeSort(value: string | undefined): SearchSort {
  const normalized = value?.trim()
  return normalized && SEARCH_SORT_SET.has(normalized) ? (normalized as SearchSort) : 'popular'
}

function stringParam(value: number | null): string | undefined {
  return value === null ? undefined : String(value)
}

export function parseSearchParams(params: RawSearchParams = {}): ParsedSearchParams {
  const q = normalizeSearchText(firstParam(params.q))
  const category = normalizeSlug(firstParam(params.category))
  const minPrice = normalizePrice(firstParam(params.minPrice))
  const maxPrice = normalizePrice(firstParam(params.maxPrice))
  const rating = normalizeRating(firstParam(params.rating))
  const inStock = firstParam(params.inStock)?.trim() === 'true'
  const sort = normalizeSort(firstParam(params.sort))
  const page = normalizePage(firstParam(params.page))
  const featured = firstParam(params.featured)?.trim() === 'true'

  const queryParams: SanitizedSearchParams = {}
  if (q) queryParams.q = q
  if (category) queryParams.category = category
  if (minPrice !== null) queryParams.minPrice = stringParam(minPrice)
  if (maxPrice !== null) queryParams.maxPrice = stringParam(maxPrice)
  if (rating !== null) queryParams.rating = stringParam(rating)
  if (inStock) queryParams.inStock = 'true'
  if (sort !== 'popular') queryParams.sort = sort
  if (page !== DEFAULT_SEARCH_PAGE) queryParams.page = String(page)
  if (featured) queryParams.featured = 'true'

  return {
    q,
    category,
    minPrice,
    maxPrice,
    rating,
    inStock,
    sort,
    page,
    featured,
    queryParams,
  }
}
