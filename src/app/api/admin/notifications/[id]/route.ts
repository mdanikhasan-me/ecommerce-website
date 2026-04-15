import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession()
    const { id } = await params
    const payload = await req.json()

    if (typeof payload.isRead !== 'boolean') {
      return NextResponse.json({ error: 'isRead is required' }, { status: 400 })
    }

    const notification = await db.notification.update({
      where: { id },
      data: { isRead: payload.isRead },
    })

    revalidatePath('/admin/notifications')
    return NextResponse.json({ notification })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Could not update notification' }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession()
    const { id } = await params

    await db.notification.delete({ where: { id } })

    revalidatePath('/admin/notifications')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Could not delete notification' }, { status })
  }
}
