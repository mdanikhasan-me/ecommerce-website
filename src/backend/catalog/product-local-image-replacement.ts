import {
  CATALOG_PRODUCT_MEDIA,
  type CatalogProductMediaEntry,
} from '@/shared/product-media'

export type ProductImageUrlBucket =
  | 'remote'
  | 'local-catalog'
  | 'managed-upload'
  | 'local-other'
  | 'empty'
  | 'other'

export type LocalCatalogProductImage = {
  productSlug: string
  publicUrl: string
  fileName: string
  extension: string
  fileExists: boolean
  sourceControlled: boolean
  gitTracked: boolean
  mapsCleanlyToProductSlug: boolean
}

export type ProductImageLocalizationInput = {
  productName: string
  sku: string
  slug: string
  images: Array<{
    id: string
    url: string
    alt: string | null
    isPrimary: boolean
    sortOrder: number
  }>
}

export type ProductImageLocalizationAction =
  | 'replace remote with local'
  | 'keep because already local'
  | 'keep because no local match'
  | 'keep because ambiguous/multiple unsafe matches'

export type CatalogImageResolution =
  | {
      status: 'found'
      image: LocalCatalogProductImage
      manifestEntry: CatalogProductMediaEntry | null
    }
  | {
      status: 'missing'
      reason: string
    }
  | {
      status: 'ambiguous'
      reason: string
      candidates: LocalCatalogProductImage[]
    }

export type ProductImageLocalizationPlanRow = {
  productName: string
  sku: string
  slug: string
  imageId: string
  currentUrl: string
  alt: string | null
  isPrimary: boolean
  sortOrder: number
  bucket: ProductImageUrlBucket
  matchingLocalCatalogAssetPath: string | null
  matchingLocalCatalogAssetExists: boolean
  proposedReplacementUrl: string | null
  action: ProductImageLocalizationAction
}

export type ProductImageLocalizationPlan = {
  generatedAt: string
  productCount: number
  productImageRowCount: number
  localCatalogAssetCount: number
  replacementCount: number
  ambiguousCount: number
  missingLocalMatchCount: number
  alreadyLocalCount: number
  rows: ProductImageLocalizationPlanRow[]
  replacements: ProductImageLocalizationPlanRow[]
}

export function classifyProductImageUrl(url: string | null | undefined): ProductImageUrlBucket {
  const value = url?.trim()
  if (!value) return 'empty'
  if (/^https?:\/\//i.test(value)) return 'remote'
  if (value.startsWith('/assets/products/catalog/')) return 'local-catalog'
  if (value.startsWith('/uploads/products/')) return 'managed-upload'
  if (value.startsWith('/')) return 'local-other'
  return 'other'
}

function isMainImage(publicUrl: string) {
  return /\/main\.(?:avif|gif|jpe?g|png|webp)$/i.test(publicUrl)
}

export function resolveLocalCatalogImageForSlug(
  productSlug: string,
  localCatalogImages: readonly LocalCatalogProductImage[],
  manifestEntries: readonly CatalogProductMediaEntry[] = CATALOG_PRODUCT_MEDIA,
): CatalogImageResolution {
  const slug = productSlug.trim()
  if (!slug) {
    return { status: 'missing', reason: 'Product slug is empty.' }
  }

  const manifestMatches = manifestEntries.filter((entry) => entry.slug === slug)
  if (manifestMatches.length > 1) {
    return {
      status: 'ambiguous',
      reason: 'Multiple manifest entries map to the same product slug.',
      candidates: [],
    }
  }

  const cleanInventoryMatches = localCatalogImages.filter(
    (image) =>
      image.productSlug === slug &&
      image.fileExists &&
      image.mapsCleanlyToProductSlug &&
      image.publicUrl.startsWith('/assets/products/catalog/'),
  )

  const manifestEntry = manifestMatches[0] ?? null
  if (manifestEntry) {
    const manifestImage = cleanInventoryMatches.find((image) => image.publicUrl === manifestEntry.path)
    if (!manifestImage) {
      return {
        status: 'missing',
        reason: 'Manifest entry exists but the catalog image file is missing.',
      }
    }

    return { status: 'found', image: manifestImage, manifestEntry }
  }

  const mainImages = cleanInventoryMatches.filter((image) => isMainImage(image.publicUrl))
  if (mainImages.length === 1) {
    return { status: 'found', image: mainImages[0], manifestEntry: null }
  }

  if (mainImages.length > 1 || cleanInventoryMatches.length > 1) {
    return {
      status: 'ambiguous',
      reason: 'Multiple local catalog images exist and no single safe main image was resolved.',
      candidates: mainImages.length > 1 ? mainImages : cleanInventoryMatches,
    }
  }

  if (cleanInventoryMatches.length === 1) {
    return { status: 'found', image: cleanInventoryMatches[0], manifestEntry: null }
  }

  return { status: 'missing', reason: 'No local catalog image maps to this product slug.' }
}

export function buildProductImageLocalizationPlan({
  generatedAt = new Date().toISOString(),
  products,
  localCatalogImages,
  manifestEntries = CATALOG_PRODUCT_MEDIA,
}: {
  generatedAt?: string
  products: readonly ProductImageLocalizationInput[]
  localCatalogImages: readonly LocalCatalogProductImage[]
  manifestEntries?: readonly CatalogProductMediaEntry[]
}): ProductImageLocalizationPlan {
  const rows: ProductImageLocalizationPlanRow[] = []

  for (const product of products) {
    const resolution = resolveLocalCatalogImageForSlug(product.slug, localCatalogImages, manifestEntries)

    for (const image of product.images) {
      const bucket = classifyProductImageUrl(image.url)
      const foundImage = resolution.status === 'found' ? resolution.image : null
      const baseRow = {
        productName: product.productName,
        sku: product.sku,
        slug: product.slug,
        imageId: image.id,
        currentUrl: image.url,
        alt: image.alt,
        isPrimary: image.isPrimary,
        sortOrder: image.sortOrder,
        bucket,
        matchingLocalCatalogAssetPath: foundImage?.publicUrl ?? null,
        matchingLocalCatalogAssetExists: Boolean(foundImage),
        proposedReplacementUrl: null,
      }

      if (bucket === 'remote') {
        if (resolution.status === 'found') {
          rows.push({
            ...baseRow,
            proposedReplacementUrl: resolution.image.publicUrl,
            action: 'replace remote with local',
          })
          continue
        }

        rows.push({
          ...baseRow,
          action: resolution.status === 'ambiguous'
            ? 'keep because ambiguous/multiple unsafe matches'
            : 'keep because no local match',
        })
        continue
      }

      rows.push({
        ...baseRow,
        action: 'keep because already local',
      })
    }
  }

  const replacements = rows.filter((row) => row.action === 'replace remote with local')

  return {
    generatedAt,
    productCount: products.length,
    productImageRowCount: rows.length,
    localCatalogAssetCount: localCatalogImages.filter((image) => image.fileExists).length,
    replacementCount: replacements.length,
    ambiguousCount: rows.filter((row) => row.action === 'keep because ambiguous/multiple unsafe matches').length,
    missingLocalMatchCount: rows.filter((row) => row.action === 'keep because no local match').length,
    alreadyLocalCount: rows.filter((row) => row.action === 'keep because already local').length,
    rows,
    replacements,
  }
}
