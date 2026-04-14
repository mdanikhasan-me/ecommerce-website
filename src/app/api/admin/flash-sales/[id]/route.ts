import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'

interface RouteContext {
  params: { id: string }
}

function normalizeFlashSalePayload(payload: any) {
  if (!payload.title?.trim()) throw new Error('Flash sale title is required')

  const startsAt = new Date(payload.startsAt)
  const endsAt = new Date(payload.endsAt)
  if (Number.isNaN(startsAt.getTime())) throw new Error('Start date is invalid')
  if (Number.isNaN(endsAt.getTime())) throw new Error('End date is invalid')
  if (startsAt > endsAt) throw new Error('End date must be later than the start date')

  const items = Array.isArray(payload.items) ? payload.items : []
  if (!items.length) throw new Error('At least one flash sale product is required')

  const normalizedItems = items.map((item: any) => {
    if (!item.productId) throw new Error('Flash sale item product is required')
    if (!['PERCENTAGE', 'FIXED'].includes(item.discountType)) throw new Error('Discount type is invalid')

    const discountValue = Number(item.discountValue)
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      throw new Error('Discount value is invalid')
    }

    return {
      productId: item.productId,
      discountType: item.discountType,
      discountValue,
      maxQuantity: item.maxQuantity ? Number(item.maxQuantity) : null,
    }
  })

  const uniqueProductIds = new Set(normalizedItems.map((item) => item.productId))
  if (uniqueProductIds.size !== normalizedItems.length) {
    throw new Error('Duplicate products cannot be added to the same flash sale')
  }

  return {
    title: payload.title.trim(),
    startsAt,
    endsAt,
    isActive: payload.isActive ?? true,
    items: normalizedItems,
  }
}

async function validateFlashSaleProducts(productIds: string[]) {
  const count = await db.product.count({ where: { id: { in: productIds } } })
  if (count !== productIds.length) {
    throw new Error('One or more selected products were not found')
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminSession()

    const existingFlashSale = await db.flashSale.findUnique({ where: { id: params.id } })
    if (!existingFlashSale) {
      return NextResponse.json({ error: 'Flash sale not found' }, { status: 404 })
    }

    const payload = normalizeFlashSalePayload(await req.json())
    await validateFlashSaleProducts(payload.items.map((item) => item.productId))

    const flashSale = await db.$transaction(async (tx) => {
      await tx.flashSaleItem.deleteMany({ where: { flashSaleId: existingFlashSale.id } })

      return tx.flashSale.update({
        where: { id: existingFlashSale.id },
        data: {
          title: payload.title,
          startsAt: payload.startsAt,
          endsAt: payload.endsAt,
          isActive: payload.isActive,
          items: {
            create: payload.items,
          },
        },
      })
    })

    return NextResponse.json({ flashSale })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to update flash sale' }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminSession()

    const existingFlashSale = await db.flashSale.findUnique({ where: { id: params.id } })
    if (!existingFlashSale) {
      return NextResponse.json({ error: 'Flash sale not found' }, { status: 404 })
    }

    await db.flashSale.delete({ where: { id: existingFlashSale.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to delete flash sale' }, { status })
  }
}
