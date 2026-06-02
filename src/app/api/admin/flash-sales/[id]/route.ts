import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminFlashSalePayload, validateFlashSaleProducts } from '@/backend/admin/flash-sale-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const { id } = await params

    const existingFlashSale = await db.flashSale.findUnique({ where: { id } })
    if (!existingFlashSale) {
      return NextResponse.json({ error: 'Flash sale not found' }, { status: 404 })
    }

    const parsed = parseAdminFlashSalePayload(await req.json())
    if (!parsed.success) throw new Error(parsed.error)
    const payload = parsed.data
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
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to update flash sale')
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const { id } = await params

    const existingFlashSale = await db.flashSale.findUnique({ where: { id } })
    if (!existingFlashSale) {
      return NextResponse.json({ error: 'Flash sale not found' }, { status: 404 })
    }

    await db.flashSale.delete({ where: { id: existingFlashSale.id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to delete flash sale')
    return NextResponse.json({ error: message }, { status })
  }
}
