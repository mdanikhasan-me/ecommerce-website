import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { calculateEffectivePrice } from '@/backend/catalog/product-price-filter'
import { buildAutomaticProductTags } from '@/backend/catalog/product-search-tags'
import { revalidateProductSurfaces } from '@/backend/catalog/storefront-revalidation'
import {
  cleanupManagedUploads,
  ensureUniqueProductSlug,
  normalizeProductImages,
  normalizeProductAttributes,
  normalizeProductDescriptionImages,
  normalizeProductSpecifications,
  normalizeVariants,
  parseAdminProductPayload,
  requireAdminSession,
  validateProductRelations,
} from '@/backend/admin/product-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()

    const body = await readBoundedJsonBody(req, JSON_BODY_LIMITS.catalogEditor)
    if (!body.success) return body.response
    const parsed = parseAdminProductPayload(body.data)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const payload = parsed.data
    const {
      sellerId,
      mediaTaxonomy,
      categorySlug,
      parentCategorySlug,
      categoryName,
      parentCategoryName,
    } = await validateProductRelations(payload)

    const slug = await ensureUniqueProductSlug(payload.slug || payload.name)
    const images = await normalizeProductImages(payload.images, slug, mediaTaxonomy)
    const descriptionImages = await normalizeProductDescriptionImages(payload.descriptionImages, slug, mediaTaxonomy)
    const variants = normalizeVariants(payload.variants)
    const attributes = normalizeProductAttributes(payload.attributes)
    const specifications = [
      ...normalizeProductSpecifications(payload.specifications, payload.faqs),
      ...descriptionImages,
    ]
    const uploadedImageUrls = [...images.map((image) => image.url), ...descriptionImages.map((image) => image.value)]

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
          effectivePrice: calculateEffectivePrice(payload.basePrice, payload.salePrice),
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
          isPreOrder: payload.isPreOrder ?? false,
          tags: buildAutomaticProductTags({
            name: payload.name,
            sku: payload.sku,
            categoryName,
            parentCategoryName,
            attributes: payload.attributes,
            specifications: payload.specifications,
            variantOptions: payload.variants?.flatMap((variant) => [
              ...(variant.options ?? []),
              ...(variant.optionName && variant.optionValue
                ? [{ name: variant.optionName, value: variant.optionValue }]
                : []),
            ]),
          }),
          metaTitle: payload.metaTitle?.trim() || null,
          metaDescription: payload.metaDescription?.trim() || null,
          images: images.length ? { create: images } : undefined,
          variants: variants.length ? { create: variants } : undefined,
          attributes: attributes.length ? { create: attributes } : undefined,
          specifications: specifications.length ? { create: specifications } : undefined,
        },
        include: {
          images: true,
          variants: { include: { options: true } },
          attributes: true,
          specifications: true,
        },
      })

      revalidateProductSurfaces({
        productSlugs: [product.slug],
        categorySlugs: [categorySlug, parentCategorySlug],
      })

      return NextResponse.json({ product }, { status: 201 })
    } catch (error) {
      await cleanupManagedUploads(uploadedImageUrls)
      throw error
    }
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to create product')
    return NextResponse.json({ error: message }, { status })
  }
}
