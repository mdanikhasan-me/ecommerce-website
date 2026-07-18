import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { calculateEffectivePrice } from '@/backend/catalog/product-price-filter'
import { buildAutomaticProductTags } from '@/backend/catalog/product-search-tags'
import { revalidateProductSurfaces } from '@/backend/catalog/storefront-revalidation'
import {
  cleanupManagedUploads,
  deleteManagedUpload,
  deleteRemovedProductImages,
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
import { logSecurityEvent } from '@/backend/security/security-log'
import { PRODUCT_DESCRIPTION_IMAGE_GROUP } from '@/shared/product-content'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const { id } = await params

    const existingProduct = await db.product.findUnique({
      where: { id },
      include: {
        images: true,
        specifications: {
          select: { group: true, value: true },
        },
        category: {
          select: {
            slug: true,
            parent: { select: { slug: true } },
          },
        },
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

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

    const slug = await ensureUniqueProductSlug(payload.slug || payload.name, existingProduct.id)
    const images = await normalizeProductImages(payload.images, slug, mediaTaxonomy)
    const descriptionImages = await normalizeProductDescriptionImages(payload.descriptionImages, slug, mediaTaxonomy)
    const variants = normalizeVariants(payload.variants)
    const attributes = normalizeProductAttributes(payload.attributes)
    const specifications = [
      ...normalizeProductSpecifications(payload.specifications, payload.faqs),
      ...descriptionImages,
    ]
    const existingImageUrls = [
      ...existingProduct.images.map((image) => image.url),
      ...existingProduct.specifications
        .filter((specification) => specification.group === PRODUCT_DESCRIPTION_IMAGE_GROUP)
        .map((specification) => specification.value),
    ]
    const nextImageUrls = [...images.map((image) => image.url), ...descriptionImages.map((image) => image.value)]
    const newUploadUrls = nextImageUrls.filter(
      (url) => url.startsWith('/uploads/products/') && !existingImageUrls.includes(url),
    )

    const product = await (async () => {
      try {
        return await db.$transaction(async (tx) => {
          await tx.productVariant.deleteMany({ where: { productId: existingProduct.id } })
          await tx.productImage.deleteMany({ where: { productId: existingProduct.id } })
          await tx.productAttribute.deleteMany({ where: { productId: existingProduct.id } })
          await tx.productSpec.deleteMany({ where: { productId: existingProduct.id } })

          return tx.product.update({
            where: { id: existingProduct.id },
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
        })
      } catch (error) {
        await cleanupManagedUploads(newUploadUrls)
        throw error
      }
    })()

    try {
      await deleteRemovedProductImages(existingImageUrls, nextImageUrls)
    } catch {
      logSecurityEvent({
        type: 'admin_upload_cleanup_failed',
        severity: 'warn',
        route: req.nextUrl.pathname,
        method: req.method,
        statusCode: 200,
        errorCode: 'product_image_cleanup_failed',
        metadata: {
          feature: 'admin_product',
        },
      })
    }

    revalidateProductSurfaces({
      productSlugs: [existingProduct.slug, product.slug],
      categorySlugs: [
        existingProduct.category.slug,
        existingProduct.category.parent?.slug,
        categorySlug,
        parentCategorySlug,
      ],
    })

    return NextResponse.json({ product })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to update product')
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const { id } = await params

    const existingProduct = await db.product.findUnique({
      where: { id },
      include: {
        images: true,
        specifications: {
          select: { group: true, value: true },
        },
        category: {
          select: {
            slug: true,
            parent: { select: { slug: true } },
          },
        },
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    try {
      await db.product.delete({ where: { id: existingProduct.id } })
      const mediaUrls = [
        ...existingProduct.images.map((image) => image.url),
        ...existingProduct.specifications
          .filter((specification) => specification.group === PRODUCT_DESCRIPTION_IMAGE_GROUP)
          .map((specification) => specification.value),
      ]
      await Promise.all(mediaUrls.map((url) => deleteManagedUpload(url)))

      revalidateProductSurfaces({
        productSlugs: [existingProduct.slug],
        categorySlugs: [existingProduct.category.slug, existingProduct.category.parent?.slug],
      })

      return NextResponse.json({ success: true, deleted: true })
    } catch {
      await db.product.update({
        where: { id: existingProduct.id },
        data: { isActive: false },
      })

      revalidateProductSurfaces({
        productSlugs: [existingProduct.slug],
        categorySlugs: [existingProduct.category.slug, existingProduct.category.parent?.slug],
      })

      return NextResponse.json({
        success: true,
        deleted: false,
        archived: true,
      })
    }
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to delete product')
    return NextResponse.json({ error: message }, { status })
  }
}
