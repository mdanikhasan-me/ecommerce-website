import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { logAdminAudit, requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminReturnPayload, resolveReturnOrderStatus } from '@/backend/admin/return-editor'

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
    const message = error instanceof Error ? error.message : 'Could not load return request'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession()
    const { id } = await params
    const parsed = parseAdminReturnPayload(await req.json())
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
        notes: existingRequest.notes,
      },
      newValues: {
        status: requestRecord.status,
        refundAmount: requestRecord.refundAmount,
        notes: requestRecord.notes,
      },
    })

    revalidatePath('/admin/returns')
    revalidatePath(`/admin/returns/${existingRequest.id}`)
    revalidatePath(`/admin/orders/${existingRequest.order.id}`)
    revalidatePath(`/account/orders/${existingRequest.order.id}`)

    return NextResponse.json({ request: requestRecord })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not update return request'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
