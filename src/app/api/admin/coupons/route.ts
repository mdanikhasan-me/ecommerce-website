import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminCouponPayload, resolveCouponMutationError, validateCouponRelations } from '@/backend/admin/coupon-editor'
import { protectMutationRequest } from '@/backend/security/request-guard'

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()

    const parsed = parseAdminCouponPayload(await req.json())
    if (!parsed.success) throw new Error(parsed.error)
    const payload = parsed.data
    await validateCouponRelations(payload.categoryIds, payload.productIds)

    const coupon = await db.coupon.create({
      data: payload,
    })

    return NextResponse.json({ coupon }, { status: 201 })
  } catch (error: unknown) {
    const message = resolveCouponMutationError(error, 'Unable to create coupon')
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
