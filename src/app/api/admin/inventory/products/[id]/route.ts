import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { logAdminAudit, requireAdminSession } from '@/backend/admin/admin-utils'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession()
    const { id } = await params
    const payload = await req.json()

    const note = payload.note?.trim()
    if (!note) {
      return NextResponse.json({ error: 'Adjustment note is required' }, { status: 400 })
    }

    const product = await db.product.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            sku: true,
            stockQuantity: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const nextStockQuantity = Number(payload.stockQuantity)
    const nextLowStockThreshold = Number(payload.lowStockThreshold)

    if (!Number.isFinite(nextStockQuantity) || nextStockQuantity < 0) {
      return NextResponse.json({ error: 'Stock quantity is invalid' }, { status: 400 })
    }

    if (!Number.isFinite(nextLowStockThreshold) || nextLowStockThreshold < 0) {
      return NextResponse.json({ error: 'Low stock threshold is invalid' }, { status: 400 })
    }

    const variantUpdates = Array.isArray(payload.variants) ? payload.variants : []
    const existingVariantMap = new Map(product.variants.map((variant) => [variant.id, variant]))

    for (const variant of variantUpdates) {
      if (!existingVariantMap.has(variant.id)) {
        return NextResponse.json({ error: 'One or more variants do not belong to this product' }, { status: 400 })
      }

      const nextVariantStock = Number(variant.stockQuantity)
      if (!Number.isFinite(nextVariantStock) || nextVariantStock < 0) {
        return NextResponse.json({ error: 'Variant stock is invalid' }, { status: 400 })
      }
    }

    const updatedProduct = await db.$transaction(async (tx) => {
      const nextProduct = await tx.product.update({
        where: { id: product.id },
        data: {
          stockQuantity: nextStockQuantity,
          lowStockThreshold: nextLowStockThreshold,
        },
        include: {
          variants: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              name: true,
              sku: true,
              stockQuantity: true,
              isActive: true,
            },
          },
        },
      })

      for (const variant of variantUpdates) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stockQuantity: Number(variant.stockQuantity),
          },
        })
      }

      return nextProduct
    })

    await logAdminAudit({
      userId: session.user.id,
      action: 'inventory.adjusted',
      entity: 'product',
      entityId: product.id,
      oldValues: {
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        variants: product.variants.map((variant) => ({
          id: variant.id,
          name: variant.name,
          stockQuantity: variant.stockQuantity,
        })),
      },
      newValues: {
        stockQuantity: nextStockQuantity,
        lowStockThreshold: nextLowStockThreshold,
        note,
        variants: variantUpdates.map((variant: { id: string; stockQuantity: number }) => ({
          id: variant.id,
          stockQuantity: Number(variant.stockQuantity),
        })),
      },
    })

    revalidatePath('/admin/inventory')
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${product.id}`)

    return NextResponse.json({ product: updatedProduct })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Could not update inventory' }, { status })
  }
}
