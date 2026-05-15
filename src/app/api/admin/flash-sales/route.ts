import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminFlashSalePayload, validateFlashSaleProducts } from '@/backend/admin/flash-sale-editor'

export async function POST(req: NextRequest) {
  try {
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
    const message = error instanceof Error ? error.message : 'Unable to create flash sale'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
