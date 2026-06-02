import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { OrderStatus } from '@prisma/client'
import { db } from '@/backend/database'
import { logAdminAudit, requireAdminSession } from '@/backend/admin/admin-utils'
import { syncProductSoldCounts } from '@/backend/commerce-stats'
import { parseAdminOrderStatusPayload } from '@/backend/admin/order-update-editor'
import { protectMutationRequest } from '@/backend/security/request-guard'

const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED'],
  RETURNED: ['REFUND_REQUESTED'],
  REFUND_REQUESTED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
}

function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus) {
  return current === next || ALLOWED_STATUS_TRANSITIONS[current].includes(next)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

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
          select: { productId: true, variantId: true, quantity: true },
        },
      },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!canTransitionOrderStatus(order.status, status)) {
      return NextResponse.json(
        { error: `Order cannot move from ${order.status.replace('_', ' ')} to ${status.replace('_', ' ')}` },
        { status: 400 }
      )
    }

    const updatedOrder = await db.$transaction(async (tx) => {
      if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          })

          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQuantity: { increment: item.quantity } },
            })
          }
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          status,
          deliveredAt: status === 'DELIVERED' ? new Date() : order.deliveredAt,
          cancelledAt: status === 'CANCELLED' ? new Date() : order.cancelledAt,
          statusHistory: {
            create: {
              status,
              note: note ?? `Status updated to ${status} by admin`,
            },
          },
        },
      })
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
