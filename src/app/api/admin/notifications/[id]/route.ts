import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminNotificationReadPayload } from '@/backend/admin/notification-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const { id } = await params
    const body = await readBoundedJsonBody(req, JSON_BODY_LIMITS.tiny)
    if (!body.success) return body.response
    const parsed = parseAdminNotificationReadPayload(body.data)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const notification = await db.notification.update({
      where: { id },
      data: { isRead: parsed.data.isRead },
    })

    revalidatePath('/admin/notifications')
    return NextResponse.json({ notification })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not update notification')
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const { id } = await params

    await db.notification.delete({ where: { id } })

    revalidatePath('/admin/notifications')
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not delete notification')
    return NextResponse.json({ error: message }, { status })
  }
}
