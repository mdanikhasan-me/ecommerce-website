import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { syncProductSoldCounts } from '@/backend/commerce-stats'

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const seller = await db.seller.findUnique({ where: { userId: session.user.id, status: 'APPROVED' } })
    if (!seller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing order id' }, { status: 400 })

    const { status } = await req.json()
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED'],
      CONFIRMED: ['PACKED'],
      PACKED: ['SHIPPED'],
    }

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          select: {
            productId: true,
            product: { select: { sellerId: true } },
          },
        },
      },
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const hasSellerItems = order.items.some((i) => i.product.sellerId === seller.id)
    if (!hasSellerItems) return NextResponse.json({ error: 'Not your order' }, { status: 403 })

    const allowed = validTransitions[order.status]
    if (!allowed?.includes(status)) {
      return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
    }

    const updated = await db.order.update({ where: { id }, data: { status } })
    await syncProductSoldCounts(
      order.items
        .filter((item) => item.product.sellerId === seller.id)
        .map((item) => item.productId)
    )
    return NextResponse.json({ order: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
