import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminCouponPayload, resolveCouponMutationError, validateCouponRelations } from '@/backend/admin/coupon-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const { id } = await params

    const existingCoupon = await db.coupon.findUnique({ where: { id } })
    if (!existingCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    const body = await readBoundedJsonBody(req, JSON_BODY_LIMITS.collection)
    if (!body.success) return body.response
    const parsed = parseAdminCouponPayload(body.data)
    if (!parsed.success) throw new Error(parsed.error)
    const payload = parsed.data
    await validateCouponRelations(payload.categoryIds, payload.productIds)

    const coupon = await db.coupon.update({
      where: { id: existingCoupon.id },
      data: payload,
    })

    return NextResponse.json({ coupon })
  } catch (error: unknown) {
    const message = resolveCouponMutationError(error, 'Unable to update coupon')
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const { id } = await params

    const existingCoupon = await db.coupon.findUnique({ where: { id } })
    if (!existingCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    try {
      await db.coupon.delete({ where: { id: existingCoupon.id } })
      return NextResponse.json({ success: true, deleted: true })
    } catch {
      await db.coupon.update({
        where: { id: existingCoupon.id },
        data: { isActive: false },
      })
      return NextResponse.json({ success: true, deleted: false, archived: true })
    }
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to delete coupon')
    return NextResponse.json({ error: message }, { status })
  }
}
