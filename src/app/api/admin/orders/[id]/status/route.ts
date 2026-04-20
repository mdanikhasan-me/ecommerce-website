import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { OrderStatus } from '@prisma/client'
import { db } from '@/backend/database'
import { logAdminAudit, requireAdminSession } from '@/backend/admin/admin-utils'
import { syncProductSoldCounts } from '@/backend/commerce-stats'

const ALLOWED_STATUSES = new Set<OrderStatus>([
  'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED',
  'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUND_REQUESTED', 'REFUNDED',
])

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession()
    const { id } = await params
    const { status, note } = await req.json()

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 })
    }
    const safeNote = typeof note === 'string' ? note.trim().slice(0, 500) || null : null

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          select: { productId: true },
        },
      },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
        deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
        cancelledAt: status === 'CANCELLED' ? new Date() : undefined,
        statusHistory: {
          create: {
            status: status as OrderStatus,
            note: safeNote ?? `Status updated to ${status} by admin`,
          },
        },
      },
    })

    await db.notification.create({
      data: {
        userId: order.userId,
        type: 'ORDER',
        title: `Order ${order.orderNumber} Update`,
        message: `Your order status has been updated to ${status.replace('_', ' ')}`,
        link: `/account/orders/${order.id}`,
      },
    }).catch(() => {})

    await logAdminAudit({
      userId: session.user.id,
      action: 'order.status.updated',
      entity: 'order',
      entityId: order.id,
      oldValues: { status: order.status },
      newValues: { status, note: safeNote },
    })

    await syncProductSoldCounts(order.items.map((item) => item.productId))

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${order.id}`)
    revalidatePath(`/account/orders/${order.id}`)

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error: any) {
    const isAuth = error?.message === 'Unauthorized'
    return NextResponse.json(
      { error: isAuth ? 'Unauthorized' : 'Could not update order status' },
      { status: isAuth ? 403 : 400 },
    )
  }
}
