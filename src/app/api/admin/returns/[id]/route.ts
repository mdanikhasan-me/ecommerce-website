import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { logAdminAudit, requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminReturnPayload, resolveReturnOrderStatus } from '@/backend/admin/return-editor'
import { enqueueReturnStatusCustomerEmail } from '@/backend/email/outbox'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession()
    const { id } = await params

    const request = await db.returnRequest.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            items: {
              select: {
                id: true,
                productName: true,
                quantity: true,
                total: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    })

    if (!request) {
      return NextResponse.json({ error: 'Return request not found' }, { status: 404 })
    }

    return NextResponse.json({ request })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not load return request')
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    const session = await requireAdminSession()
    const { id } = await params
    const body = await readBoundedJsonBody(req, JSON_BODY_LIMITS.standard)
    if (!body.success) return body.response
    const parsed = parseAdminReturnPayload(body.data)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const payload = parsed.data
    const nextStatus = payload.status

    const existingRequest = await db.returnRequest.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            userId: true,
            user: { select: { email: true, name: true } },
          },
        },
      },
    })

    if (!existingRequest) {
      return NextResponse.json({ error: 'Return request not found' }, { status: 404 })
    }

    const nextOrderStatus = resolveReturnOrderStatus(nextStatus, existingRequest.order.status)

    const requestRecord = await db.$transaction(async (tx) => {
      const updated = await tx.returnRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: nextStatus,
          refundAmount: payload.refundAmount,
          notes: payload.notes,
          resolvedAt: nextStatus === 'REQUESTED' ? null : new Date(),
          resolvedBy: nextStatus === 'REQUESTED' ? null : session.user.id,
        },
      })

      await tx.order.update({
        where: { id: existingRequest.order.id },
        data: {
          status: nextOrderStatus,
          paymentStatus: nextStatus === 'REFUNDED' ? 'REFUNDED' : existingRequest.order.paymentStatus,
          statusHistory: {
            create: {
              status: nextOrderStatus,
              note: payload.notes || `Return request moved to ${nextStatus.toLowerCase()} by admin`,
            },
          },
        },
      })

      // Customer notification commits with the return decision. Reapplying
      // the same return status is skipped and database-deduplicated; refund
      // wording is only possible because this transaction records it.
      if (nextStatus !== existingRequest.status) {
        await enqueueReturnStatusCustomerEmail(tx, {
          orderId: existingRequest.order.id,
          orderNumber: existingRequest.order.orderNumber,
          returnStatus: nextStatus,
          refundRecorded: nextStatus === 'REFUNDED',
          customerEmail: existingRequest.order.user.email,
          customerName: existingRequest.order.user.name,
        })
      }

      return updated
    })

    await db.notification.create({
      data: {
        userId: existingRequest.order.userId,
        type: 'ORDER',
        title: `Return request updated for ${existingRequest.order.orderNumber}`,
        message: `Your return request is now ${nextStatus.toLowerCase().replace('_', ' ')}`,
        link: `/account/orders/${existingRequest.order.id}`,
      },
    }).catch(() => {})

    await logAdminAudit({
      userId: session.user.id,
      action: 'return.updated',
      entity: 'return_request',
      entityId: existingRequest.id,
      oldValues: {
        status: existingRequest.status,
        refundAmount: existingRequest.refundAmount,
      },
      newValues: {
        status: requestRecord.status,
        refundAmount: requestRecord.refundAmount,
        notesChanged: existingRequest.notes !== requestRecord.notes,
      },
    })

    revalidatePath('/admin/returns')
    revalidatePath(`/admin/returns/${existingRequest.id}`)
    revalidatePath(`/admin/orders/${existingRequest.order.id}`)
    revalidatePath(`/account/orders/${existingRequest.order.id}`)

    return NextResponse.json({ request: requestRecord })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not update return request')
    return NextResponse.json({ error: message }, { status })
  }
}
