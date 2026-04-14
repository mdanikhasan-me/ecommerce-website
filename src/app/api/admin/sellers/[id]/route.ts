import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await req.json()
    const validStatuses = ['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const seller = await db.seller.update({
      where: { id: params.id },
      data: {
        status,
        verifiedAt: status === 'APPROVED' ? new Date() : undefined,
      },
    })

    // Update user role if approved
    if (status === 'APPROVED') {
      await db.user.update({ where: { id: seller.userId }, data: { role: 'SELLER' } })
    }

    return NextResponse.json({ seller })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
