import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import {
  cleanupManagedUploads,
  deleteManagedUpload,
  deleteRemovedProductImages,
  ensureUniqueProductSlug,
  normalizeProductImages,
  normalizeTags,
  normalizeVariants,
  parseAdminProductPayload,
  requireAdminSession,
  validateProductRelations,
} from '@/backend/admin/product-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { logSecurityEvent } from '@/backend/security/security-log'

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
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const parsed = parseAdminProductPayload(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const payload = parsed.data
    const { sellerId } = await validateProductRelations(payload)

    const slug = await ensureUniqueProductSlug(payload.slug || payload.name, existingProduct.id)
    const images = await normalizeProductImages(payload.images, slug)
    const variants = normalizeVariants(payload.variants)
    const existingImageUrls = existingProduct.images.map((image) => image.url)
    const nextImageUrls = images.map((image) => image.url)
    const newUploadUrls = nextImageUrls.filter(
      (url) => url.startsWith('/uploads/products/') && !existingImageUrls.includes(url),
    )

    const product = await (async () => {
      try {
        return await db.$transaction(async (tx) => {
          await tx.productVariant.deleteMany({ where: { productId: existingProduct.id } })
          await tx.productImage.deleteMany({ where: { productId: existingProduct.id } })

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
      include: { images: true },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    try {
      await db.product.delete({ where: { id: existingProduct.id } })
      await Promise.all(existingProduct.images.map((image) => deleteManagedUpload(image.url)))

      return NextResponse.json({ success: true, deleted: true })
    } catch {
      await db.product.update({
        where: { id: existingProduct.id },
        data: { isActive: false },
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
