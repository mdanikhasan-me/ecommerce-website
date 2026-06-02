import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminFlashSalePayload, validateFlashSaleProducts } from '@/backend/admin/flash-sale-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()

    const parsed = parseAdminFlashSalePayload(await req.json())
    if (!parsed.success) throw new Error(parsed.error)
    const payload = parsed.data
    await validateFlashSaleProducts(payload.items.map((item) => item.productId))

    const flashSale = await db.flashSale.create({
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

    return NextResponse.json({ flashSale }, { status: 201 })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to create flash sale')
    return NextResponse.json({ error: message }, { status })
  }
}
