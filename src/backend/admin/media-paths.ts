const DEFAULT_SEGMENT = 'general'
const DEFAULT_MEDIA_SEGMENT = 'media'
const DEFAULT_EXTENSION = 'webp'
const ALLOWED_EXTENSIONS = new Set(['avif', 'gif', 'jpg', 'jpeg', 'png', 'webp'])

export type ProductMediaTaxonomy = {
  categorySlug?: string | null
  subcategorySlug?: string | null
}

export type ManagedUploadPathPlan = {
  directorySegments: string[]
  publicPathPrefix: string
  baseName: string
  examplePublicPath: string
}

export function sanitizeMediaPathSegment(
  value: string | number | null | undefined,
  fallback = DEFAULT_SEGMENT,
) {
  const raw = String(value ?? '').trim().toLowerCase()

  if (!raw || /[\0-\x1f\x7f]/.test(raw) || raw.includes('..') || /[\\/]/.test(raw)) {
    return fallback
  }

  const sanitized = raw
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return sanitized || fallback
}

export function normalizeMediaExtension(value: string | null | undefined, fallback = DEFAULT_EXTENSION) {
  const extension = value
    ?.trim()
    .toLowerCase()
    .replace(/^\.+/, '')
    .replace(/[^a-z0-9]/g, '')

  return extension && ALLOWED_EXTENSIONS.has(extension) ? extension : fallback
}

export function buildCatalogProductAssetPath(input: {
  categorySlug: string | null | undefined
  subcategorySlug?: string | null
  productSlug: string
  extension: string
}) {
  const category = sanitizeMediaPathSegment(input.categorySlug, 'uncategorized')
  const subcategory = sanitizeMediaPathSegment(input.subcategorySlug, DEFAULT_SEGMENT)
  const product = sanitizeMediaPathSegment(input.productSlug, 'product')
  const extension = normalizeMediaExtension(input.extension)

  return `/assets/products/catalog/${category}/${subcategory}/${product}/main.${extension}`
}

export function buildManagedProductUploadPath(input: ProductMediaTaxonomy & {
  productSlugOrId: string
  mediaId?: string | number | null
  extension?: string | null
}): ManagedUploadPathPlan {
  const category = sanitizeMediaPathSegment(input.categorySlug, 'uncategorized')
  const subcategory = sanitizeMediaPathSegment(input.subcategorySlug, DEFAULT_SEGMENT)
  const product = sanitizeMediaPathSegment(input.productSlugOrId, 'product')
  const media = sanitizeMediaPathSegment(input.mediaId, DEFAULT_MEDIA_SEGMENT)
  const extension = normalizeMediaExtension(input.extension)
  const publicPathPrefix = `/uploads/products/${category}/${subcategory}/${product}`

  return {
    directorySegments: ['uploads', 'products', category, subcategory, product],
    publicPathPrefix,
    baseName: media,
    examplePublicPath: `${publicPathPrefix}/${media}.${extension}`,
  }
}

export function buildManagedBannerUploadPath(input: {
  bannerSlugOrId: string | null | undefined
  mediaId?: string | number | null
  extension?: string | null
}): ManagedUploadPathPlan {
  const banner = sanitizeMediaPathSegment(input.bannerSlugOrId, 'banner')
  const media = sanitizeMediaPathSegment(input.mediaId, DEFAULT_MEDIA_SEGMENT)
  const extension = normalizeMediaExtension(input.extension)
  const publicPathPrefix = `/uploads/admin/banners/${banner}`

  return {
    directorySegments: ['uploads', 'admin', 'banners', banner],
    publicPathPrefix,
    baseName: media,
    examplePublicPath: `${publicPathPrefix}/${media}.${extension}`,
  }
}

export function buildManagedCategoryUploadPath(input: {
  categorySlug: string | null | undefined
  mediaId?: string | number | null
  extension?: string | null
}): ManagedUploadPathPlan {
  const category = sanitizeMediaPathSegment(input.categorySlug, 'category')
  const extension = normalizeMediaExtension(input.extension)
  const publicPathPrefix = '/uploads/categories'

  return {
    directorySegments: ['uploads', 'categories'],
    publicPathPrefix,
    baseName: category,
    examplePublicPath: `${publicPathPrefix}/${category}.${extension}`,
  }
}

export function buildManagedSubcategoryUploadPath(input: {
  subcategorySlug: string | null | undefined
  extension?: string | null
}): ManagedUploadPathPlan {
  const subcategory = sanitizeMediaPathSegment(input.subcategorySlug, 'subcategory')
  const extension = normalizeMediaExtension(input.extension)
  const publicPathPrefix = '/assets/categories/subcategories'

  return {
    directorySegments: ['assets', 'categories', 'subcategories'],
    publicPathPrefix,
    baseName: subcategory,
    examplePublicPath: `${publicPathPrefix}/${subcategory}.${extension}`,
  }
}
