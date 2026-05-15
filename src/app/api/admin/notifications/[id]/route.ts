import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminNotificationReadPayload } from '@/backend/admin/notification-editor'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession()
    const { id } = await params
    const parsed = parseAdminNotificationReadPayload(await req.json())
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
    const message = error instanceof Error ? error.message : 'Could not update notification'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession()
    const { id } = await params

    await db.notification.delete({ where: { id } })

    revalidatePath('/admin/notifications')
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not delete notification'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
