import { promises as fs } from 'fs'
import path from 'path'
import { db } from '@/backend/database'
import { slugify } from '@/backend/utils'
import { persistOptimizedImageUpload } from '@/backend/admin/image-processing'
import { createPrismaAdminMediaReferenceSource, AdminMediaPrismaLikeClient } from '@/backend/admin/media-reference-adapter'
import {
  classifyAdminMediaPath,
  resolveManagedMediaFilePath,
} from '@/backend/admin/media-lifecycle'
import {
  buildManagedProductUploadPath,
  ProductMediaTaxonomy,
} from '@/backend/admin/media-paths'
import {
  AdminMediaReferenceExclusion,
  AdminMediaReferenceSource,
  planAdminMediaDeletionWithReferences,
} from '@/backend/admin/media-reference-guard'
import { logSecurityEvent } from '@/backend/security/security-log'
import { z } from 'zod'

export { requireAdminSession } from '@/backend/admin/admin-utils'

type ProductImageInput = {
  url: string
  alt?: string | null
}

type ProductVariantInput = {
  name?: string
  sku?: string
  price?: number | null
  salePrice?: number | null
  stockQuantity?: number
  image?: string | null
  optionName?: string | null
  optionValue?: string | null
  isActive?: boolean
}

export type AdminProductPayload = {
  name: string
  slug?: string
  description: string
  shortDescription?: string | null
  sku: string
  basePrice: number
  salePrice?: number | null
  costPrice?: number | null
  stockQuantity?: number
  lowStockThreshold?: number
  weight?: number | null
  categoryId: string
  tags?: string[]
  metaTitle?: string | null
  metaDescription?: string | null
  isActive?: boolean
  isFeatured?: boolean
  isNew?: boolean
  isBestSeller?: boolean
  pinnedInNew?: boolean
  pinnedInBestSeller?: boolean
  isPreOrder?: boolean
  images?: ProductImageInput[]
  variants?: ProductVariantInput[]
}

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null)

const optionalNonNegativeNumber = (label: string) =>
  z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? null : value),
    z.union([z.null(), z.coerce.number().finite(`${label} is invalid`).min(0, `${label} cannot be negative`)]),
  )

const nonNegativeNumber = (label: string) =>
  z.coerce.number().finite(`${label} is invalid`).min(0, `${label} cannot be negative`)

const nonNegativeInt = (label: string) =>
  z.coerce.number().int(`${label} must be a whole number`).min(0, `${label} cannot be negative`)

const imageUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(500_000)
  .refine((value) => value.startsWith('/') || value.startsWith('data:image/') || /^https?:\/\//i.test(value), {
    message: 'Image URL must be a site path, data image, or http(s) URL',
  })

const productImagePayloadSchema = z.object({
  url: imageUrlSchema,
  alt: optionalTrimmedString(160),
})

const productVariantPayloadSchema = z
  .object({
    name: z.string().trim().min(1, 'Variant name is required').max(120),
    sku: z.string().trim().min(1, 'Variant SKU is required').max(80),
    price: optionalNonNegativeNumber('Variant price'),
    salePrice: optionalNonNegativeNumber('Variant sale price'),
    stockQuantity: nonNegativeInt('Variant stock').optional().default(0),
    image: optionalTrimmedString(500),
    optionName: optionalTrimmedString(80),
    optionValue: optionalTrimmedString(120),
    isActive: z.boolean().optional().default(true),
  })
  .superRefine((variant, ctx) => {
    if (variant.salePrice !== null && variant.price !== null && variant.salePrice > variant.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['salePrice'],
        message: 'Variant sale price cannot be higher than variant price',
      })
    }

    if (Boolean(variant.optionName) !== Boolean(variant.optionValue)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['optionValue'],
        message: 'Variant option name and value must be filled together',
      })
    }
  })

const productPayloadSchema = z
  .object({
    name: z.string().trim().min(1, 'Product name is required').max(180),
    slug: z.string().trim().max(220).optional().nullable().transform((value) => value || undefined),
    description: z.string().trim().min(1, 'Product description is required').max(20_000),
    shortDescription: optionalTrimmedString(280),
    sku: z.string().trim().min(1, 'SKU is required').max(80),
    basePrice: nonNegativeNumber('Base price'),
    salePrice: optionalNonNegativeNumber('Sale price'),
    costPrice: optionalNonNegativeNumber('Cost price'),
    stockQuantity: nonNegativeInt('Stock quantity').optional().default(0),
    lowStockThreshold: nonNegativeInt('Low stock threshold').optional().default(5),
    weight: optionalNonNegativeNumber('Weight'),
    categoryId: z.string().trim().min(1, 'Category is required'),
    tags: z.array(z.string().trim().max(60)).max(30).optional().default([]),
    metaTitle: optionalTrimmedString(70),
    metaDescription: optionalTrimmedString(180),
    isActive: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
    isNew: z.boolean().optional().default(true),
    isBestSeller: z.boolean().optional().default(false),
    pinnedInNew: z.boolean().optional().default(false),
    pinnedInBestSeller: z.boolean().optional().default(false),
    isPreOrder: z.boolean().optional().default(false),
    images: z.array(productImagePayloadSchema).max(20).optional().default([]),
    variants: z.array(productVariantPayloadSchema).max(100).optional().default([]),
  })
  .superRefine((payload, ctx) => {
    if (payload.salePrice !== null && payload.salePrice > payload.basePrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['salePrice'],
        message: 'Sale price cannot be higher than base price',
      })
    }

    const variantSkus = new Set<string>()
    for (const [index, variant] of payload.variants.entries()) {
      const sku = variant.sku.toLowerCase()
      if (variantSkus.has(sku)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['variants', index, 'sku'],
          message: 'Variant SKUs must be unique',
        })
        return
      }
      variantSkus.add(sku)
    }
  })

const MANAGED_PRODUCT_UPLOAD_PREFIX = '/uploads/products/' as const

export function parseAdminProductPayload(input: unknown) {
  const parsed = productPayloadSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Invalid product',
    }
  }

  return {
    success: true as const,
    data: parsed.data satisfies AdminProductPayload,
  }
}

export interface AdminCategoryOption {
  id: string
  name: string
  parentId: string | null
}

export interface AdminEditableProduct {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string | null
  sku: string
  basePrice: number
  salePrice: number | null
  costPrice: number | null
  stockQuantity: number
  lowStockThreshold: number
  weight: number | null
  categoryId: string
  officialStoreName: string
  tags: string[]
  metaTitle: string | null
  metaDescription: string | null
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  isBestSeller: boolean
  pinnedInNew: boolean
  pinnedInBestSeller: boolean
  isPreOrder: boolean
  images: Array<{
    id: string
    url: string
    alt: string | null
    sortOrder: number
  }>
  variants: Array<{
    id: string
    name: string
    sku: string
    price: number | null
    salePrice: number | null
    stockQuantity: number
    isActive: boolean
    options: Array<{
      id: string
      name: string
      value: string
    }>
  }>
}

export async function ensureUniqueProductSlug(rawSlug: string, excludeId?: string) {
  const baseSlug = slugify(rawSlug) || `product-${Date.now().toString(36)}`
  let candidate = baseSlug
  let suffix = 2

  while (true) {
    const existing = await db.product.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    })

    if (!existing) return candidate
    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }
}

async function persistImage(
  url: string,
  slug: string,
  taxonomy: ProductMediaTaxonomy | undefined,
  index: number,
) {
  if (!url.startsWith('data:image/')) {
    return url.trim()
  }

  const uploadPath = buildManagedProductUploadPath({
    categorySlug: taxonomy?.categorySlug,
    subcategorySlug: taxonomy?.subcategorySlug,
    productSlugOrId: slug,
    mediaId: `image-${index + 1}`,
  })

  return persistOptimizedImageUpload({
    dataUrl: url,
    directorySegments: uploadPath.directorySegments,
    baseName: uploadPath.baseName,
    publicPathPrefix: uploadPath.publicPathPrefix,
    profile: 'products',
  })
}

export function isManagedProductMediaPath(url: string | null | undefined) {
  const classification = classifyAdminMediaPath(url)
  return classification.managedPrefix === MANAGED_PRODUCT_UPLOAD_PREFIX &&
    classification.canDeleteLocalFile &&
    Boolean(classification.normalizedPath && path.posix.extname(classification.normalizedPath))
}

export function resolvePublicProductMediaPath(
  url: string | null | undefined,
  publicRoot?: string,
) {
  const classification = classifyAdminMediaPath(url)
  if (
    !classification.canDeleteLocalFile ||
    !classification.normalizedPath ||
    classification.managedPrefix !== MANAGED_PRODUCT_UPLOAD_PREFIX
  ) {
    return null
  }

  if (!path.posix.extname(classification.normalizedPath)) return null

  return resolveManagedMediaFilePath(classification.normalizedPath, MANAGED_PRODUCT_UPLOAD_PREFIX, publicRoot)
}

export type ProductMediaCleanupOptions = {
  referenceSource?: AdminMediaReferenceSource
  exclude?: readonly AdminMediaReferenceExclusion[]
  publicRoot?: string
}

function getProductMediaReferenceSource(options: ProductMediaCleanupOptions) {
  return options.referenceSource ?? createPrismaAdminMediaReferenceSource(db as unknown as AdminMediaPrismaLikeClient)
}

function logProductUploadCleanupSkipped(input: {
  errorCode: string
  reason?: string
}) {
  logSecurityEvent({
    type: 'admin_upload_cleanup_failed',
    severity: 'warn',
    errorCode: input.errorCode,
    metadata: {
      feature: 'admin_product',
      reason: input.reason?.slice(0, 120),
    },
  })
}

async function resolveReferenceSafeProductDeletion(url: string, options: ProductMediaCleanupOptions) {
  try {
    if (!isManagedProductMediaPath(url)) {
      return null
    }

    const classification = classifyAdminMediaPath(url)
    if (
      !classification.canDeleteLocalFile ||
      !classification.normalizedPath ||
      classification.managedPrefix !== MANAGED_PRODUCT_UPLOAD_PREFIX
    ) {
      return null
    }

    const plan = await planAdminMediaDeletionWithReferences({
      candidateUrl: classification.normalizedPath,
      referenceSource: getProductMediaReferenceSource(options),
      exclude: options.exclude,
    })

    if (!plan.shouldDeleteLocalFile) {
      if (plan.incomplete) {
        logProductUploadCleanupSkipped({
          errorCode: 'product_media_reference_check_incomplete',
          reason: plan.reason,
        })
      }
      return null
    }

    return resolvePublicProductMediaPath(classification.normalizedPath, options.publicRoot)
  } catch {
    logProductUploadCleanupSkipped({
      errorCode: 'product_media_cleanup_plan_failed',
      reason: 'Cleanup planning failed before physical deletion.',
    })
    return null
  }
}

export async function removeEmptyManagedProductFolderIfSafe(
  url: string | null | undefined,
  options: Pick<ProductMediaCleanupOptions, 'publicRoot'> = {},
) {
  const filePath = resolvePublicProductMediaPath(url, options.publicRoot)
  if (!filePath) return false

  const publicRoot = path.resolve(options.publicRoot ?? path.resolve(process.cwd(), 'public'))
  const uploadRoot = path.resolve(publicRoot, MANAGED_PRODUCT_UPLOAD_PREFIX.replace(/^\/+|\/+$/g, ''))
  const folder = path.dirname(filePath)

  if (folder === uploadRoot || !folder.startsWith(`${uploadRoot}${path.sep}`)) {
    return false
  }

  try {
    const entries = await fs.readdir(folder)
    if (entries.length > 0) return false

    await fs.rmdir(folder)
    return true
  } catch {
    return false
  }
}

export async function deleteManagedUpload(url: string, options: ProductMediaCleanupOptions = {}) {
  const filePath = await resolveReferenceSafeProductDeletion(url, options)
  if (!filePath) return false

  try {
    await fs.rm(filePath, { force: true })
    await removeEmptyManagedProductFolderIfSafe(url, options)
    return true
  } catch {
    logProductUploadCleanupSkipped({
      errorCode: 'product_media_file_delete_failed',
      reason: 'Physical cleanup failed after reference-safe planning.',
    })
    return false
  }
}

export async function cleanupManagedUploads(urls: string[], options: ProductMediaCleanupOptions = {}) {
  return Promise.all(urls.filter(isManagedProductMediaPath).map((url) => deleteManagedUpload(url, options)))
}

export async function normalizeProductImages(
  images: ProductImageInput[] | undefined,
  slug: string,
  taxonomy?: ProductMediaTaxonomy,
) {
  const cleanedInputs = (images ?? [])
    .map((image) => ({
      url: image.url?.trim() ?? '',
      alt: image.alt?.trim() ?? '',
    }))
    .filter((image) => image.url.length > 0)

  const normalized = []
  for (const [index, image] of cleanedInputs.entries()) {
    const persistedUrl = await persistImage(image.url, slug, taxonomy, index)
    normalized.push({
      url: persistedUrl,
      alt: image.alt || null,
      isPrimary: index === 0,
      sortOrder: index,
    })
  }

  return normalized
}

export async function deleteRemovedProductImages(
  existingUrls: string[],
  nextUrls: string[],
  options: ProductMediaCleanupOptions = {},
) {
  const removedUrls = existingUrls.filter((url) => isManagedProductMediaPath(url) && !nextUrls.includes(url))
  return Promise.all(removedUrls.map((url) => deleteManagedUpload(url, options)))
}

export function normalizeTags(tags: string[] | undefined) {
  return (tags ?? [])
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
}

export function normalizeVariants(variants: ProductVariantInput[] | undefined) {
  return (variants ?? [])
    .map((variant) => ({
      name: variant.name?.trim() ?? '',
      sku: variant.sku?.trim() ?? '',
      price: variant.price ?? null,
      salePrice: variant.salePrice ?? null,
      stockQuantity: variant.stockQuantity ?? 0,
      image: variant.image?.trim() || null,
      optionName: variant.optionName?.trim() ?? '',
      optionValue: variant.optionValue?.trim() ?? '',
      isActive: variant.isActive ?? true,
    }))
    .filter((variant) => variant.name && variant.sku)
    .map((variant, index) => ({
      name: variant.name,
      sku: variant.sku,
      price: variant.price,
      salePrice: variant.salePrice,
      stockQuantity: variant.stockQuantity,
      image: variant.image,
      isActive: variant.isActive,
      sortOrder: index,
      options: variant.optionName && variant.optionValue
        ? {
            create: [
              {
                name: variant.optionName,
                value: variant.optionValue,
              },
            ],
          }
        : undefined,
    }))
}

export function validateProductPayload(payload: AdminProductPayload) {
  const parsed = parseAdminProductPayload(payload)
  if (!parsed.success) throw new Error(parsed.error)
}

async function getOfficialSeller() {
  const seller = await db.seller.findFirst({
    where: { isFirstParty: true, status: 'APPROVED' },
    select: {
      id: true,
      storeName: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  if (!seller) {
    throw new Error('Main store profile is not configured yet')
  }

  return seller
}

export async function validateProductRelations(payload: AdminProductPayload) {
  const [category, officialSeller] = await Promise.all([
    db.category.findUnique({
      where: { id: payload.categoryId },
      select: {
        id: true,
        slug: true,
        parent: {
          select: { slug: true },
        },
      },
    }),
    getOfficialSeller(),
  ])

  if (!category) throw new Error('Selected category was not found')
  return {
    brandId: null,
    sellerId: officialSeller.id,
    officialStoreName: officialSeller.storeName,
    categorySlug: category.slug,
    parentCategorySlug: category.parent?.slug ?? null,
    mediaTaxonomy: {
      categorySlug: category.parent?.slug ?? category.slug,
      subcategorySlug: category.parent ? category.slug : 'general',
    },
  }
}

export async function getAdminProductEditorOptions() {
  const [categories, officialSeller] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }),
    getOfficialSeller(),
  ])

  return {
    categories: categories as AdminCategoryOption[],
    officialStoreName: officialSeller.storeName,
  }
}

export async function getAdminEditableProduct(id: string) {
  const product = await db.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      shortDescription: true,
      sku: true,
      basePrice: true,
      salePrice: true,
      costPrice: true,
      stockQuantity: true,
      lowStockThreshold: true,
      weight: true,
      categoryId: true,
      tags: true,
      metaTitle: true,
      metaDescription: true,
      isActive: true,
      isFeatured: true,
      isNew: true,
      isBestSeller: true,
      pinnedInNew: true,
      pinnedInBestSeller: true,
      isPreOrder: true,
      seller: {
        select: {
          storeName: true,
        },
      },
      images: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          url: true,
          alt: true,
          sortOrder: true,
        },
      },
      variants: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          salePrice: true,
          stockQuantity: true,
          isActive: true,
          options: {
            select: {
              id: true,
              name: true,
              value: true,
            },
          },
        },
      },
    },
  })

  if (!product) return null

  return {
    ...product,
    officialStoreName: product.seller.storeName,
  } as AdminEditableProduct
}
