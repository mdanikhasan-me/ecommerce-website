import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { logAdminAudit, requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminPaymentStatusPayload } from '@/backend/admin/order-update-editor'
import { enqueuePaymentConfirmedEmail } from '@/backend/email/outbox'
import { toSafeClientErrorMessage } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    const session = await requireAdminSession()
    const { id } = await params
    const parsed = parseAdminPaymentStatusPayload(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const { status, note } = parsed.data

    const order = await db.order.findUnique({
      where: { id },
      include: {
        payment: true,
        user: { select: { email: true, name: true } },
      },
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
              note: note ?? `Payment status updated to ${status} by admin`,
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

      // Trusted backend payment confirmation: only an authorized admin
      // recording a real transition into PAID enqueues this email.
      if (status === 'PAID' && order.paymentStatus !== 'PAID') {
        await enqueuePaymentConfirmedEmail(tx, {
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          paymentMethod: order.paymentMethod,
          customerEmail: order.user.email,
          customerName: order.user.name,
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
      newValues: { paymentStatus: status, note },
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${order.id}`)
    revalidatePath(`/account/orders/${order.id}`)

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error: unknown) {
    const message = toSafeClientErrorMessage(error, 'Could not update payment status')
    const status = message === 'Unauthorized' ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
