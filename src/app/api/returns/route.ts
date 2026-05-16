import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'

const RETURN_WINDOW_DAYS = 7

const returnRequestSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
})

function getReturnDeadline(deliveredAt: Date) {
  return new Date(deliveredAt.getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please sign in to request a return' }, { status: 401 })
    }

    const parsed = returnRequestSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid return request' }, { status: 400 })
    }

    const order = await db.order.findFirst({
      where: { id: parsed.data.orderId, userId: session.user.id },
      include: {
        returnRequest: true,
        statusHistory: {
          where: { status: 'DELIVERED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.returnRequest) {
      return NextResponse.json({ error: 'A return request already exists for this order' }, { status: 409 })
    }

    const deliveredAt = order.deliveredAt ?? order.statusHistory[0]?.createdAt
    if (order.status !== 'DELIVERED' || !deliveredAt) {
      return NextResponse.json({ error: 'Returns are available only after delivery' }, { status: 403 })
    }

    if (Date.now() > getReturnDeadline(deliveredAt).getTime()) {
      return NextResponse.json({ error: 'The 7 day return window has closed' }, { status: 403 })
    }

    const request = await db.returnRequest.create({
      data: {
        orderId: order.id,
        userId: session.user.id,
        reason: parsed.data.reason,
        description: parsed.data.description || null,
        images: [],
      },
    })

    await db.order.update({
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

    revalidatePath(`/account/orders/${order.id}`)
    revalidatePath('/account/orders')
    revalidatePath('/admin/returns')
    revalidatePath('/admin/orders')

    return NextResponse.json({ request }, { status: 201 })
  } catch (error) {
    console.error('Return request error:', error)
    return NextResponse.json({ error: 'Could not create return request' }, { status: 500 })
  }
}
