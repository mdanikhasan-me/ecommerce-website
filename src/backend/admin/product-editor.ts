import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { slugify } from '@/backend/utils'

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
  optionName?: string
  optionValue?: string
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
  brandId?: string | null
  sellerId: string
  tags?: string[]
  metaTitle?: string | null
  metaDescription?: string | null
  isActive?: boolean
  isFeatured?: boolean
  isNew?: boolean
  isBestSeller?: boolean
  images?: ProductImageInput[]
  variants?: ProductVariantInput[]
}

export interface AdminCategoryOption {
  id: string
  name: string
  parentId: string | null
}

export interface AdminBrandOption {
  id: string
  name: string
}

export interface AdminSellerOption {
  id: string
  storeName: string
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
  brandId: string | null
  sellerId: string
  tags: string[]
  metaTitle: string | null
  metaDescription: string | null
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  isBestSeller: boolean
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

const PRODUCT_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products')

export async function requireAdminSession() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    throw new Error('Unauthorized')
  }

  return session
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

function parseImageDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return null

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  }
}

function extensionForMime(mimeType: string) {
  if (mimeType.includes('png')) return 'png'
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg'
  if (mimeType.includes('webp')) return 'webp'
  if (mimeType.includes('gif')) return 'gif'
  return 'png'
}

async function persistImage(url: string, slug: string) {
  if (!url.startsWith('data:image/')) {
    return url.trim()
  }

  const parsed = parseImageDataUrl(url)
  if (!parsed) {
    throw new Error('Invalid image upload payload')
  }

  await fs.mkdir(PRODUCT_UPLOAD_DIR, { recursive: true })

  const filename = `${slug}-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}.${extensionForMime(parsed.mimeType)}`
  const outputPath = path.join(PRODUCT_UPLOAD_DIR, filename)

  await fs.writeFile(outputPath, parsed.buffer)

  return `/uploads/products/${filename}`
}

function isManagedUpload(url: string) {
  return url.startsWith('/uploads/products/')
}

export async function deleteManagedUpload(url: string) {
  if (!isManagedUpload(url)) return

  const filePath = path.join(process.cwd(), 'public', url.replace(/^\//, ''))
  await fs.rm(filePath, { force: true })
}

export async function cleanupManagedUploads(urls: string[]) {
  await Promise.all(urls.filter(isManagedUpload).map((url) => deleteManagedUpload(url)))
}

export async function normalizeProductImages(images: ProductImageInput[] | undefined, slug: string) {
  const cleanedInputs = (images ?? [])
    .map((image) => ({
      url: image.url?.trim() ?? '',
      alt: image.alt?.trim() ?? '',
    }))
    .filter((image) => image.url.length > 0)

  const normalized = []
  for (const [index, image] of cleanedInputs.entries()) {
    const persistedUrl = await persistImage(image.url, slug)
    normalized.push({
      url: persistedUrl,
      alt: image.alt || null,
      isPrimary: index === 0,
      sortOrder: index,
    })
  }

  return normalized
}

export async function deleteRemovedProductImages(existingUrls: string[], nextUrls: string[]) {
  const removedUrls = existingUrls.filter((url) => isManagedUpload(url) && !nextUrls.includes(url))
  await Promise.all(removedUrls.map((url) => deleteManagedUpload(url)))
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
  if (!payload.name?.trim()) throw new Error('Product name is required')
  if (!payload.description?.trim()) throw new Error('Product description is required')
  if (!payload.sku?.trim()) throw new Error('SKU is required')
  if (!payload.categoryId) throw new Error('Category is required')
  if (!payload.sellerId) throw new Error('Seller is required')
  if (!Number.isFinite(payload.basePrice) || payload.basePrice < 0) throw new Error('Base price is required')
  if (!Number.isFinite(payload.stockQuantity ?? 0) || (payload.stockQuantity ?? 0) < 0) throw new Error('Stock quantity is invalid')
}

export async function validateProductRelations(payload: AdminProductPayload) {
  const [category, brand, seller] = await Promise.all([
    db.category.findUnique({
      where: { id: payload.categoryId },
      select: { id: true },
    }),
    payload.brandId
      ? db.brand.findUnique({
          where: { id: payload.brandId },
          select: { id: true },
        })
      : Promise.resolve(null),
    db.seller.findUnique({
      where: { id: payload.sellerId },
      select: { id: true },
    }),
  ])

  if (!category) throw new Error('Selected category was not found')
  if (payload.brandId && !brand) throw new Error('Selected brand was not found')
  if (!seller) throw new Error('Selected seller was not found')
}

export async function getAdminProductEditorOptions() {
  const [categories, brands, sellers] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }),
    db.brand.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }),
    db.seller.findMany({
      select: {
        id: true,
        storeName: true,
      },
      orderBy: [{ isFirstParty: 'desc' }, { storeName: 'asc' }],
    }),
  ])

  return {
    categories: categories as AdminCategoryOption[],
    brands: brands as AdminBrandOption[],
    sellers: sellers as AdminSellerOption[],
  }
}

export async function getAdminEditableProduct(id: string) {
  return db.product.findUnique({
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
      brandId: true,
      sellerId: true,
      tags: true,
      metaTitle: true,
      metaDescription: true,
      isActive: true,
      isFeatured: true,
      isNew: true,
      isBestSeller: true,
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
  }) as Promise<AdminEditableProduct | null>
}
