import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import {
  parseAdminNotificationPayload,
  resolveNotificationAudienceWhere,
} from '@/backend/admin/notification-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'

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
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not load notifications')
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const body = await readBoundedJsonBody(req, JSON_BODY_LIMITS.standard)
    if (!body.success) return body.response
    const parsed = parseAdminNotificationPayload(body.data)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const payload = parsed.data
    let userIds: string[] = []
    if (payload.recipientType === 'USER') {
      const user = await db.user.findUnique({
        where: { id: payload.userId ?? '' },
        select: { id: true, isActive: true },
      })
      if (!user?.isActive) {
        return NextResponse.json({ error: 'Select a user' }, { status: 400 })
      }
      userIds = [user.id]
    } else {
      const users = await db.user.findMany({
        where: resolveNotificationAudienceWhere(payload.recipientType),
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
        type: payload.type,
        title: payload.title,
        message: payload.message,
        link: payload.link,
      })),
    })

    return NextResponse.json({ success: true, count: userIds.length })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not send notifications')
    return NextResponse.json({ error: message }, { status })
  }
}
