import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { logAdminAudit, requireAdminSession } from '@/backend/admin/admin-utils'
import { syncProductSoldCounts } from '@/backend/commerce-stats'
import { parseAdminOrderStatusPayload } from '@/backend/admin/order-update-editor'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession()
    const { id } = await params
    const parsed = parseAdminOrderStatusPayload(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const { status, note } = parsed.data

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
        status,
        deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
        cancelledAt: status === 'CANCELLED' ? new Date() : undefined,
        statusHistory: {
          create: {
            status,
            note: note ?? `Status updated to ${status} by admin`,
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
      newValues: { status, note },
    })

    await syncProductSoldCounts(order.items.map((item) => item.productId))

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${order.id}`)
    revalidatePath(`/account/orders/${order.id}`)

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error: unknown) {
    const isAuth = error instanceof Error && error.message === 'Unauthorized'
    return NextResponse.json(
      { error: isAuth ? 'Unauthorized' : 'Could not update order status' },
      { status: isAuth ? 403 : 400 },
    )
  }
}
