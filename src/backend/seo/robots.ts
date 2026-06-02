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

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export function hasFacetedCategoryParams(params: FacetedParams) {
  if (FACETED_CATEGORY_KEYS.some((key) => Boolean(firstParam(params[key])))) return true

  const page = firstParam(params.page)
  if (!page) return false

  const parsed = Number(page)
  return Number.isFinite(parsed) && parsed > 1
}

export function isSearchIndexable() {
  return false
}
