import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import {
  cleanupManagedUploads,
  ensureUniqueProductSlug,
  normalizeProductImages,
  normalizeTags,
  normalizeVariants,
  parseAdminProductPayload,
  requireAdminSession,
  validateProductRelations,
} from '@/backend/admin/product-editor'

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession()

    const parsed = parseAdminProductPayload(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const payload = parsed.data
    const { sellerId } = await validateProductRelations(payload)

    const slug = await ensureUniqueProductSlug(payload.slug || payload.name)
    const images = await normalizeProductImages(payload.images, slug)
    const variants = normalizeVariants(payload.variants)
    const uploadedImageUrls = images.map((image) => image.url)

    try {
      const product = await db.product.create({
        data: {
          name: payload.name.trim(),
          slug,
          description: payload.description.trim(),
          shortDescription: payload.shortDescription?.trim() || null,
          sku: payload.sku.trim(),
          categoryId: payload.categoryId,
          brandId: null,
          sellerId,
          basePrice: payload.basePrice,
          salePrice: payload.salePrice ?? null,
          costPrice: payload.costPrice ?? null,
          stockQuantity: payload.stockQuantity ?? 0,
          lowStockThreshold: payload.lowStockThreshold ?? 5,
          weight: payload.weight ?? null,
          isActive: payload.isActive ?? true,
          isFeatured: payload.isFeatured ?? false,
          isNew: payload.isNew ?? true,
          isBestSeller: payload.isBestSeller ?? false,
          pinnedInNew: payload.pinnedInNew ?? false,
          pinnedInBestSeller: payload.pinnedInBestSeller ?? false,
          tags: normalizeTags(payload.tags),
          metaTitle: payload.metaTitle?.trim() || null,
          metaDescription: payload.metaDescription?.trim() || null,
          images: images.length ? { create: images } : undefined,
          variants: variants.length ? { create: variants } : undefined,
        },
        include: {
          images: true,
          variants: { include: { options: true } },
        },
      })

      return NextResponse.json({ product }, { status: 201 })
    } catch (error) {
      await cleanupManagedUploads(uploadedImageUrls)
      throw error
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to create product'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
