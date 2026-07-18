import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { expandCouponCategoryIds } from '@/backend/coupons/category-scope'
import { parseCouponCode } from '@/backend/api/public-input'
import { rateLimit } from '@/backend/security/rate-limit'
import { evaluateCouponForLines } from '@/shared/coupon-math'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'

const couponRequestSchema = z.object({
  code: z.string().max(40),
  items: z.array(z.object({
    productId: z.string().trim().min(1).max(64),
    variantId: z.string().trim().min(1).max(64).optional().nullable(),
    quantity: z.coerce.number().int().min(1).max(100),
  })).min(1).max(100),
})

function couponError(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { key: 'coupons:validate', limit: 30, windowMs: 60_000 })
  if (limited) return limited

  const body = await readBoundedJsonBody(req, JSON_BODY_LIMITS.collection)
  if (!body.success) return body.response
  const parsed = couponRequestSchema.safeParse(body.data)
  if (!parsed.success) return couponError('Cart details are invalid')

  const code = parseCouponCode(parsed.data.code)
  if (!code) return couponError('Coupon code required')

  const coupon = await db.coupon.findUnique({ where: { code } })
  if (!coupon) return couponError('Invalid coupon code')
  if (!coupon.isActive) return couponError('This coupon is no longer active')

  const now = new Date()
  if (coupon.startsAt && coupon.startsAt > now) return couponError('Coupon is not yet active')
  if (coupon.expiresAt && coupon.expiresAt < now) return couponError('Coupon has expired')
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return couponError('Coupon usage limit reached')

  const combinedItems = new Map<string, { productId: string; variantId: string | null; quantity: number }>()
  for (const item of parsed.data.items) {
    const variantId = item.variantId || null
    const key = `${item.productId}:${variantId ?? ''}`
    const previous = combinedItems.get(key)
    const quantity = (previous?.quantity ?? 0) + item.quantity
    if (quantity > 100) return couponError('Cart quantity is invalid')
    combinedItems.set(key, { productId: item.productId, variantId, quantity })
  }

  const items = Array.from(combinedItems.values())
  const productIds = Array.from(new Set(items.map((item) => item.productId)))
  const variantIds = Array.from(new Set(items.map((item) => item.variantId).filter((id): id is string => Boolean(id))))
  const [products, variants] = await Promise.all([
    db.product.findMany({
      where: getBuyerVisibleProductWhere({ id: { in: productIds } }),
      select: { id: true, categoryId: true, basePrice: true, salePrice: true, stockQuantity: true },
    }),
    variantIds.length
      ? db.productVariant.findMany({
          where: { id: { in: variantIds }, isActive: true },
          select: { id: true, productId: true, price: true, salePrice: true, stockQuantity: true },
        })
      : Promise.resolve([]),
  ])

  const productMap = new Map(products.map((product) => [product.id, product]))
  const variantMap = new Map(variants.map((variant) => [variant.id, variant]))
  const lines = []

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product || product.stockQuantity < item.quantity) return couponError('Your cart changed. Review the available items and try again')

    let unitPrice = product.salePrice ?? product.basePrice
    if (item.variantId) {
      const variant = variantMap.get(item.variantId)
      if (!variant || variant.productId !== product.id || variant.stockQuantity < item.quantity) {
        return couponError('Your cart contains an unavailable product option')
      }
      unitPrice = variant.salePrice ?? variant.price ?? unitPrice
    }

    lines.push({
      productId: product.id,
      categoryId: product.categoryId,
      total: unitPrice * item.quantity,
    })
  }

  const expandedCategoryIds = await expandCouponCategoryIds(
    () => db.category.findMany({ select: { id: true, parentId: true } }),
    coupon.categoryIds,
  )
  const evaluation = evaluateCouponForLines({ ...coupon, categoryIds: expandedCategoryIds }, lines)
  if (!evaluation.hasEligibleItems) return couponError('This coupon does not apply to the items in your cart')
  if (!evaluation.meetsMinimum) {
    const minimumLabel = evaluation.hasRestrictions ? 'eligible items' : 'your order'
    return couponError(
      `Add Tk ${evaluation.minimumRemaining.toLocaleString('en-BD')} more in ${minimumLabel} to use this coupon`,
    )
  }

  const session = await auth()
  if (session?.user?.id && coupon.perUserLimit) {
    const usageCount = await db.order.count({
      where: { userId: session.user.id, couponId: coupon.id, status: { not: 'CANCELLED' } },
    })
    if (usageCount >= coupon.perUserLimit) return couponError('You have reached the usage limit for this coupon')
  }

  return NextResponse.json({
    success: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      discount: evaluation.discount,
      qualifyingSubtotal: evaluation.qualifyingSubtotal,
      hasRestrictions: evaluation.hasRestrictions,
    },
  })
}
