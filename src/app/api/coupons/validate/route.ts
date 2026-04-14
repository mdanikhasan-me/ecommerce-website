import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase()
  const amount = parseFloat(req.nextUrl.searchParams.get('amount') ?? '0')

  if (!code) return NextResponse.json({ error: 'Coupon code required' }, { status: 400 })

  const coupon = await db.coupon.findUnique({ where: { code } })

  if (!coupon) return NextResponse.json({ success: false, error: 'Invalid coupon code' }, { status: 400 })
  if (!coupon.isActive) return NextResponse.json({ success: false, error: 'This coupon is no longer active' }, { status: 400 })

  const now = new Date()
  if (coupon.startsAt && coupon.startsAt > now) return NextResponse.json({ success: false, error: 'Coupon is not yet active' }, { status: 400 })
  if (coupon.expiresAt && coupon.expiresAt < now) return NextResponse.json({ success: false, error: 'Coupon has expired' }, { status: 400 })
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return NextResponse.json({ success: false, error: 'Coupon usage limit reached' }, { status: 400 })
  if (amount < coupon.minOrderAmount) return NextResponse.json({ success: false, error: `Minimum order amount is ৳${coupon.minOrderAmount}` }, { status: 400 })

  return NextResponse.json({ success: true, coupon: { id: coupon.id, code: coupon.code, name: coupon.name, type: coupon.type, value: coupon.value, maxDiscount: coupon.maxDiscount } })
}
