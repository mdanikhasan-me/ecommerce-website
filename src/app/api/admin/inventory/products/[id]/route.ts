import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { revalidateProductSurfacesByIds } from '@/backend/catalog/storefront-revalidation'
import { logAdminAudit, requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminInventoryPayload } from '@/backend/admin/inventory-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    const session = await requireAdminSession()
    const { id } = await params
    const parsed = parseAdminInventoryPayload(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const payload = parsed.data

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

    const existingVariantMap = new Map(product.variants.map((variant) => [variant.id, variant]))

    for (const variant of payload.variants) {
      if (!existingVariantMap.has(variant.id)) {
        return NextResponse.json({ error: 'One or more variants do not belong to this product' }, { status: 400 })
      }
    }

    const updatedProduct = await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: product.id },
        data: {
          stockQuantity: payload.stockQuantity,
          lowStockThreshold: payload.lowStockThreshold,
        },
      })

      for (const variant of payload.variants) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stockQuantity: variant.stockQuantity,
          },
        })
      }

      return tx.product.findUniqueOrThrow({
        where: { id: product.id },
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
        stockQuantity: payload.stockQuantity,
        lowStockThreshold: payload.lowStockThreshold,
        note: payload.note,
        variants: payload.variants.map((variant) => ({
          id: variant.id,
          stockQuantity: variant.stockQuantity,
        })),
      },
    })

    revalidatePath('/admin/inventory')
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${product.id}`)
    await revalidateProductSurfacesByIds([product.id]).catch(() => {})

    return NextResponse.json({ product: updatedProduct })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not update inventory')
    return NextResponse.json({ error: message }, { status })
  }
}
