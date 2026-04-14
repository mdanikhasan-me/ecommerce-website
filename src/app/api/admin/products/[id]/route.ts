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
  requireAdminSession,
  validateProductPayload,
  validateProductRelations,
  type AdminProductPayload,
} from '@/backend/admin/product-editor'

interface RouteContext {
  params: { id: string }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminSession()

    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
      include: {
        images: true,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const payload = (await req.json()) as AdminProductPayload
    validateProductPayload(payload)
    await validateProductRelations(payload)

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
              brandId: payload.brandId || null,
              sellerId: payload.sellerId,
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
    } catch (cleanupError) {
      console.error('Could not delete replaced product images', cleanupError)
    }

    return NextResponse.json({ product })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to update product' }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminSession()

    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
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
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to delete product' }, { status })
  }
}
