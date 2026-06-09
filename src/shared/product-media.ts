export const CATALOG_PRODUCT_MEDIA_ROOT = '/assets/products/catalog' as const

export type CatalogProductMediaSource =
  | 'existing-local-source-copied'
  | 'committed-managed-demo-upload-copied'
  | 'existing-repo-seed-remote-localized'

export type CatalogProductMediaEntry = {
  slug: string
  categorySlug: string
  subcategorySlug: string
  path: `${typeof CATALOG_PRODUCT_MEDIA_ROOT}/${string}`
  sourceType: CatalogProductMediaSource
  sourceControlled: true
  ownerReviewNeeded: boolean
  note: string
}

export const CATALOG_PRODUCT_MEDIA: readonly CatalogProductMediaEntry[] = []

export const CATALOG_PRODUCT_MEDIA_BY_SLUG = {} as Record<string, CatalogProductMediaEntry>

export const OWNER_REVIEW_NEEDED_PRODUCT_MEDIA: readonly CatalogProductMediaEntry[] = []
