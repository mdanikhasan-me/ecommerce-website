import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { logAdminAudit, requireAdminSession } from '@/backend/admin/admin-utils'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession()
    const { id } = await params
    const { status, note } = await req.json()

    const order = await db.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updatedOrder = await db.order.update({
      where: { id },
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
      newValues: { status, note: note || null },
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${order.id}`)
    revalidatePath(`/account/orders/${order.id}`)

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 403 : 400
    return NextResponse.json({ error: error.message || 'Could not update order status' }, { status })
  }
}
