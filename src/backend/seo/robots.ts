import type { Metadata } from 'next'

export const indexableRobots = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large' as const,
    'max-snippet': -1,
  },
} satisfies Metadata['robots']

export const noIndexFollowRobots = {
  index: false,
  follow: true,
  googleBot: {
    index: false,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large' as const,
    'max-snippet': -1,
  },
} satisfies Metadata['robots']

export const noIndexNoFollowRobots = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
    'max-video-preview': -1,
    'max-image-preview': 'none' as const,
    'max-snippet': 0,
  },
} satisfies Metadata['robots']

type FacetedParams = Record<string, string | string[] | undefined>

const FACETED_CATEGORY_KEYS = [
  'category',
  'sort',
  'minPrice',
  'maxPrice',
  'rating',
  'inStock',
]
const PLAIN_PAGE_PATTERN = /^\d+$/

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function isFacetedPage(value: string | undefined) {
  const normalized = value?.trim()
  if (!normalized || !PLAIN_PAGE_PATTERN.test(normalized)) return false

  const parsed = Number(normalized)
  return Number.isSafeInteger(parsed) && parsed > 1
}

export function hasFacetedCategoryParams(params: FacetedParams) {
  if (FACETED_CATEGORY_KEYS.some((key) => Boolean(firstParam(params[key])))) return true

  return isFacetedPage(firstParam(params.page))
}

export function isSearchIndexable() {
  return false
}
