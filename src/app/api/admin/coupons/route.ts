import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'

async function validateCouponRelations(categoryIds: string[], productIds: string[]) {
  const [categoryCount, productCount] = await Promise.all([
    categoryIds.length
      ? db.category.count({ where: { id: { in: categoryIds } } })
      : Promise.resolve(0),
    productIds.length
      ? db.product.count({ where: { id: { in: productIds } } })
      : Promise.resolve(0),
  ])

  if (categoryIds.length && categoryCount !== categoryIds.length) {
    throw new Error('One or more selected categories were not found')
  }
  if (productIds.length && productCount !== productIds.length) {
    throw new Error('One or more selected products were not found')
  }
}

function normalizeCouponPayload(payload: any) {
  if (!payload.code?.trim()) throw new Error('Coupon code is required')
  if (!payload.name?.trim()) throw new Error('Coupon name is required')
  if (!['PERCENTAGE', 'FIXED'].includes(payload.type)) throw new Error('Discount type is invalid')

  const value = Number(payload.value)
  if (!Number.isFinite(value) || value <= 0) throw new Error('Discount value is required')

  const minOrderAmount = Number(payload.minOrderAmount ?? 0)
  const usageLimit = payload.usageLimit ? Number(payload.usageLimit) : null
  const perUserLimit = Number(payload.perUserLimit ?? 1)
  const maxDiscount = payload.maxDiscount ? Number(payload.maxDiscount) : null
  const startsAt = payload.startsAt ? new Date(payload.startsAt) : null
  const expiresAt = payload.expiresAt ? new Date(payload.expiresAt) : null

  if (startsAt && Number.isNaN(startsAt.getTime())) throw new Error('Start date is invalid')
  if (expiresAt && Number.isNaN(expiresAt.getTime())) throw new Error('Expiry date is invalid')
  if (startsAt && expiresAt && startsAt > expiresAt) throw new Error('Expiry date must be later than the start date')

  return {
    code: payload.code.trim().toUpperCase(),
    name: payload.name.trim(),
    description: payload.description?.trim() || null,
    type: payload.type,
    value,
    minOrderAmount: Number.isFinite(minOrderAmount) ? minOrderAmount : 0,
    maxDiscount,
    usageLimit,
    perUserLimit: Number.isFinite(perUserLimit) ? perUserLimit : 1,
    isActive: payload.isActive ?? true,
    startsAt,
    expiresAt,
    categoryIds: Array.isArray(payload.categoryIds) ? payload.categoryIds : [],
    productIds: Array.isArray(payload.productIds) ? payload.productIds : [],
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession()

    const payload = normalizeCouponPayload(await req.json())
    await validateCouponRelations(payload.categoryIds, payload.productIds)

    const coupon = await db.coupon.create({
      data: payload,
    })

    return NextResponse.json({ coupon }, { status: 201 })
  } catch (error: any) {
    const message =
      error.code === 'P2002' ? 'Coupon code already exists' : error.message || 'Unable to create coupon'
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
