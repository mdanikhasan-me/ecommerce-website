import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { logAdminAudit, requireAdminSession } from '@/backend/admin/admin-utils'

const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession()
    const { id } = await params
    const { status, note } = await req.json()

    if (!PAYMENT_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    }

    const order = await db.order.findUnique({
      where: { id },
      include: { payment: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updatedOrder = await db.$transaction(async (tx) => {
      const nextOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: status,
          payment: order.payment
            ? {
                update: {
                  status,
                  paidAt: status === 'PAID' ? new Date() : order.payment.paidAt,
                },
              }
            : undefined,
          statusHistory: {
            create: {
              status: order.status,
              note: note?.trim() || `Payment status updated to ${status} by admin`,
            },
          },
        },
      })

      if (!order.payment) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            amount: order.total,
            currency: order.currency,
            method: order.paymentMethod,
            status,
            paidAt: status === 'PAID' ? new Date() : null,
          },
        })
      }

      return nextOrder
    })

    await db.notification.create({
      data: {
        userId: order.userId,
        type: 'ORDER',
        title: `Payment update for ${order.orderNumber}`,
        message: `Your payment status is now ${status.replace('_', ' ')}`,
        link: `/account/orders/${order.id}`,
      },
    }).catch(() => {})

    await logAdminAudit({
      userId: session.user.id,
      action: 'order.payment.updated',
      entity: 'order',
      entityId: order.id,
      oldValues: { paymentStatus: order.paymentStatus },
      newValues: { paymentStatus: status, note: note || null },
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${order.id}`)
    revalidatePath(`/account/orders/${order.id}`)

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 403 : 400
    return NextResponse.json({ error: error.message || 'Could not update payment status' }, { status })
  }
}
