import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { parseCouponAmount, parseCouponCode, parsePublicIdList } from '@/backend/api/public-input'

export async function GET(req: NextRequest) {
  const code = parseCouponCode(req.nextUrl.searchParams.get('code'))
  const amount = parseCouponAmount(req.nextUrl.searchParams.get('amount') ?? '0')
  const productIds = parsePublicIdList(req.nextUrl.searchParams.get('productIds'))

  if (!code) return NextResponse.json({ error: 'Coupon code required' }, { status: 400 })
  if (amount === null) return NextResponse.json({ success: false, error: 'Invalid coupon amount' }, { status: 400 })

  const coupon = await db.coupon.findUnique({ where: { code } })

  if (!coupon) return NextResponse.json({ success: false, error: 'Invalid coupon code' }, { status: 400 })
  if (!coupon.isActive) return NextResponse.json({ success: false, error: 'This coupon is no longer active' }, { status: 400 })

  const now = new Date()
  if (coupon.startsAt && coupon.startsAt > now) return NextResponse.json({ success: false, error: 'Coupon is not yet active' }, { status: 400 })
  if (coupon.expiresAt && coupon.expiresAt < now) return NextResponse.json({ success: false, error: 'Coupon has expired' }, { status: 400 })
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return NextResponse.json({ success: false, error: 'Coupon usage limit reached' }, { status: 400 })
  if (amount < coupon.minOrderAmount) return NextResponse.json({ success: false, error: `Minimum order amount is Tk ${coupon.minOrderAmount.toLocaleString('en-BD')}` }, { status: 400 })

  if (coupon.productIds.length > 0 || coupon.categoryIds.length > 0) {
    const cartProducts = productIds.length
      ? await db.product.findMany({
          where: getBuyerVisibleProductWhere({ id: { in: productIds } }),
          select: { id: true, categoryId: true },
        })
      : []

    const productIdSet = new Set(coupon.productIds)
    const categoryIdSet = new Set(coupon.categoryIds)
    const hasEligibleProduct = cartProducts.some((product) => (
      productIdSet.has(product.id) || categoryIdSet.has(product.categoryId)
    ))

    if (!hasEligibleProduct) {
      return NextResponse.json(
        { success: false, error: 'This coupon does not apply to the items in your cart' },
        { status: 400 }
      )
    }
  }

  return NextResponse.json({ success: true, coupon: { id: coupon.id, code: coupon.code, name: coupon.name, type: coupon.type, value: coupon.value, maxDiscount: coupon.maxDiscount } })
}
