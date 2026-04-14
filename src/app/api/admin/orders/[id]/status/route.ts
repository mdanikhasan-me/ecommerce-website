import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { status, note } = await req.json()

  const order = await db.order.findUnique({ where: { id: params.id } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const updatedOrder = await db.order.update({
    where: { id: params.id },
    data: {
      status: status as any,
      deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
      cancelledAt: status === 'CANCELLED' ? new Date() : undefined,
      statusHistory: {
        create: {
          status: status as any,
          note: note || `Status updated to ${status} by admin`,
        },
      },
    },
  })

  // Notify customer
  await db.notification.create({
    data: {
      userId: order.userId,
      type: 'ORDER',
      title: `Order ${order.orderNumber} Update`,
      message: `Your order status has been updated to: ${status.replace('_', ' ')}`,
      link: `/account/orders/${order.id}`,
    },
  }).catch(() => {})

  return NextResponse.json({ success: true, order: updatedOrder })
}
