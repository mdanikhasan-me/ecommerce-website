import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { logAdminAudit, requireAdminSession } from '@/backend/admin/admin-utils'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession()
    const { id } = await params
    const { status } = await req.json()
    const validStatuses = ['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING']

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const existingSeller = await db.seller.findUnique({
      where: { id },
      include: { user: { select: { id: true, role: true } } },
    })

    if (!existingSeller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const seller = await db.seller.update({
      where: { id },
      data: {
        status,
        verifiedAt: status === 'APPROVED' ? new Date() : status === 'PENDING' ? null : existingSeller.verifiedAt,
      },
    })

    if (status === 'APPROVED') {
      await db.user.update({ where: { id: seller.userId }, data: { role: 'SELLER' } })
    }

    await logAdminAudit({
      userId: session.user.id,
      action: 'seller.status.updated',
      entity: 'seller',
      entityId: seller.id,
      oldValues: { status: existingSeller.status, verifiedAt: existingSeller.verifiedAt },
      newValues: { status: seller.status, verifiedAt: seller.verifiedAt },
    })

    revalidatePath('/admin/sellers')
    revalidatePath(`/admin/sellers/${seller.id}`)

    return NextResponse.json({ seller })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: error.message || 'Internal error' }, { status })
  }
}
