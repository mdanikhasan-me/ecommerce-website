import { enqueueReturnRequestedAdminEmail, type EmailEnqueueTx } from '@/backend/email/outbox'
import type { ParsedBuyerReturnRequestPayload } from '@/backend/orders/buyer-validation'

const RETURN_WINDOW_DAYS = 7

type ReturnOrderRecord = {
  id: string
  orderNumber: string
  status: string
  deliveredAt: Date | null
  returnRequest: unknown
  statusHistory: { status: string; createdAt: Date }[]
  user: { name: string | null } | null
}

type BuyerReturnTx = {
  order: { update: (args: unknown) => Promise<unknown> }
  returnRequest: { create: (args: unknown) => Promise<unknown> }
} & EmailEnqueueTx

export type BuyerReturnDb = {
  order: {
    findFirst: (args: unknown) => Promise<ReturnOrderRecord | null>
  }
  $transaction: <T>(callback: (tx: BuyerReturnTx) => Promise<T>) => Promise<T>
}

export type BuyerReturnRequestResult =
  | { success: true; payload: { request: unknown } }
  | { success: false; status: number; error: string }

export function getBuyerReturnDeadline(deliveredAt: Date) {
  return new Date(deliveredAt.getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000)
}

export async function createBuyerReturnRequest({
  database,
  userId,
  payload,
  revalidate,
}: {
  database: BuyerReturnDb
  userId: string
  payload: ParsedBuyerReturnRequestPayload
  revalidate: (path: string) => void
}): Promise<BuyerReturnRequestResult> {
  const order = await database.order.findFirst({
    where: { id: payload.orderId, userId },
    include: {
      returnRequest: true,
      statusHistory: {
        where: { status: 'DELIVERED' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      user: { select: { name: true } },
    },
  })

  if (!order) {
    return { success: false, status: 404, error: 'Order not found' }
  }

  if (order.returnRequest) {
    return { success: false, status: 409, error: 'A return request already exists for this order' }
  }

  const deliveredAt = order.deliveredAt ?? order.statusHistory[0]?.createdAt
  if (order.status !== 'DELIVERED' || !deliveredAt) {
    return { success: false, status: 403, error: 'Returns are available only after delivery' }
  }

  if (Date.now() > getBuyerReturnDeadline(deliveredAt).getTime()) {
    return { success: false, status: 403, error: 'The 7 day return window has closed' }
  }

  // One transaction so the return request, the order-status change, and the
  // admin notification event commit (or roll back) together.
  const request = await database.$transaction(async (tx) => {
    const created = await tx.returnRequest.create({
      data: {
        orderId: order.id,
        userId,
        reason: payload.reason,
        description: payload.description,
        images: [],
      },
    })

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'RETURN_REQUESTED',
        statusHistory: {
          create: {
            status: 'RETURN_REQUESTED',
            note: 'Return requested by customer',
          },
        },
      },
    })

    await enqueueReturnRequestedAdminEmail(tx, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.user?.name ?? null,
      reason: payload.reason,
    })

    return created
  })

  revalidate(`/account/orders/${order.id}`)
  revalidate('/account/orders')
  revalidate('/admin/returns')
  revalidate('/admin/orders')

  return { success: true, payload: { request } }
}
