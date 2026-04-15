import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'

const RECIPIENT_TYPES = ['USER', 'CUSTOMERS', 'SELLERS', 'ALL']

export async function GET() {
  try {
    await requireAdminSession()

    const notifications = await db.notification.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ notifications })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Could not load notifications' }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession()
    const payload = await req.json()

    if (!RECIPIENT_TYPES.includes(payload.recipientType)) {
      return NextResponse.json({ error: 'Recipient type is invalid' }, { status: 400 })
    }
    if (!payload.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (!payload.message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    let userIds: string[] = []
    if (payload.recipientType === 'USER') {
      if (!payload.userId) {
        return NextResponse.json({ error: 'Select a user' }, { status: 400 })
      }
      userIds = [payload.userId]
    } else {
      const where: Prisma.UserWhereInput =
        payload.recipientType === 'CUSTOMERS'
          ? { role: 'CUSTOMER', isActive: true }
          : payload.recipientType === 'SELLERS'
            ? { role: 'SELLER', isActive: true }
            : { isActive: true }

      const users = await db.user.findMany({
        where,
        select: { id: true },
      })
      userIds = users.map((user) => user.id)
    }

    if (userIds.length === 0) {
      return NextResponse.json({ error: 'No recipients matched this audience' }, { status: 400 })
    }

    await db.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: payload.type || 'SYSTEM',
        title: payload.title.trim(),
        message: payload.message.trim(),
        link: payload.link?.trim() || null,
      })),
    })

    return NextResponse.json({ success: true, count: userIds.length })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Could not send notifications' }, { status })
  }
}
