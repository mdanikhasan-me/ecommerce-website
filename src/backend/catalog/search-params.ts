export const DEFAULT_SEARCH_PAGE = 1
export const MAX_SEARCH_PAGE = 1000
export const DEFAULT_CATALOG_LIMIT = 24
export const MAX_CATALOG_LIMIT = 50
export const MAX_SEARCH_QUERY_LENGTH = 120
export const MAX_SEARCH_SLUG_LENGTH = 80
export const MAX_SEARCH_PRICE = 10_000_000
export const MAX_PRODUCT_ID_LENGTH = 80
export const MAX_PRODUCT_IDS = 50

export const SEARCH_SORT_OPTIONS = ['popular', 'newest', 'price_asc', 'price_desc', 'rating'] as const
export type SearchSort = (typeof SEARCH_SORT_OPTIONS)[number]

export type RawSearchParams = Record<string, string | string[] | undefined>
type ParamSource = RawSearchParams | URLSearchParams

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
  bestSeller?: 'true'
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
  bestSeller: boolean
  queryParams: SanitizedSearchParams
}

export type ParsedCategorySearchParams = {
  category?: string
  minPrice: number | null
  maxPrice: number | null
  rating: number | null
  inStock: boolean
  sort: SearchSort
  page: number
  queryParams: SanitizedSearchParams
}

export type ParsedProductApiParams = ParsedSearchParams & {
  ids: string[]
  limit: number
  isNew: boolean
}

const SEARCH_SORT_SET = new Set<string>(SEARCH_SORT_OPTIONS)
const PLAIN_DECIMAL_PATTERN = /^\d+(?:\.\d+)?$/

export function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function readParam(params: ParamSource, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined
  return firstParam(params[key])
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

function normalizeLimit(value: string | undefined): number {
  const normalized = value?.trim()
  if (!normalized || !/^\d+$/.test(normalized)) return DEFAULT_CATALOG_LIMIT

  const parsed = Number(normalized)
  if (!Number.isSafeInteger(parsed) || parsed < 1) return DEFAULT_CATALOG_LIMIT
  return Math.min(parsed, MAX_CATALOG_LIMIT)
}

function normalizePrice(value: string | undefined): number | null {
  const normalized = value?.trim()
  if (!normalized) return null
  if (!PLAIN_DECIMAL_PATTERN.test(normalized)) return null

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return Math.min(parsed, MAX_SEARCH_PRICE)
}

function normalizeRating(value: string | undefined): number | null {
  const normalized = value?.trim()
  if (!normalized) return null
  if (!PLAIN_DECIMAL_PATTERN.test(normalized)) return null

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) return null
  return parsed
}

function normalizeSort(value: string | undefined): SearchSort {
  const normalized = value?.trim()
  return normalized && SEARCH_SORT_SET.has(normalized) ? (normalized as SearchSort) : 'popular'
}

function normalizeIds(value: string | undefined): string[] {
  if (!value) return []

  return Array.from(
    new Set(
      value
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0 && id.length <= MAX_PRODUCT_ID_LENGTH && /^[A-Za-z0-9_-]+$/.test(id)),
    ),
  ).slice(0, MAX_PRODUCT_IDS)
}

function stringParam(value: number | null): string | undefined {
  return value === null ? undefined : String(value)
}

export function parseSearchParams(params: ParamSource = {}): ParsedSearchParams {
  const q = normalizeSearchText(readParam(params, 'q'))
  const category = normalizeSlug(readParam(params, 'category'))
  const minPrice = normalizePrice(readParam(params, 'minPrice'))
  const maxPrice = normalizePrice(readParam(params, 'maxPrice'))
  const rating = normalizeRating(readParam(params, 'rating'))
  const inStock = readParam(params, 'inStock')?.trim() === 'true'
  const sort = normalizeSort(readParam(params, 'sort'))
  const page = normalizePage(readParam(params, 'page'))
  const featured = readParam(params, 'featured')?.trim() === 'true'
  const bestSeller = readParam(params, 'bestSeller')?.trim() === 'true'

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
  if (bestSeller) queryParams.bestSeller = 'true'

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
    bestSeller,
    queryParams,
  }
}

export function parseCategorySearchParams(params: RawSearchParams = {}): ParsedCategorySearchParams {
  const parsed = parseSearchParams(params)
  const queryParams: SanitizedSearchParams = {}

  if (parsed.category) queryParams.category = parsed.category
  if (parsed.minPrice !== null) queryParams.minPrice = stringParam(parsed.minPrice)
  if (parsed.maxPrice !== null) queryParams.maxPrice = stringParam(parsed.maxPrice)
  if (parsed.rating !== null) queryParams.rating = stringParam(parsed.rating)
  if (parsed.inStock) queryParams.inStock = 'true'
  if (parsed.sort !== 'popular') queryParams.sort = parsed.sort
  if (parsed.page !== DEFAULT_SEARCH_PAGE) queryParams.page = String(parsed.page)

  return {
    category: parsed.category,
    minPrice: parsed.minPrice,
    maxPrice: parsed.maxPrice,
    rating: parsed.rating,
    inStock: parsed.inStock,
    sort: parsed.sort,
    page: parsed.page,
    queryParams,
  }
}

export function parseProductApiParams(params: ParamSource): ParsedProductApiParams {
  const parsed = parseSearchParams(params)
  const ids = normalizeIds(readParam(params, 'ids'))
  const limit = normalizeLimit(readParam(params, 'limit'))
  const isNew = readParam(params, 'new')?.trim() === 'true'

  return {
    ...parsed,
    ids,
    limit,
    isNew,
  }
}
