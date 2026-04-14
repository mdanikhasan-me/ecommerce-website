import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const seller = await db.seller.findUnique({ where: { userId: session.user.id } })
    if (!seller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const updated = await db.seller.update({
      where: { id: seller.id },
      data: {
        storeName: body.storeName,
        description: body.description || null,
        phone: body.phone || null,
        address: body.address || null,
        returnPolicy: body.returnPolicy || null,
        shippingPolicy: body.shippingPolicy || null,
      },
    })

    return NextResponse.json({ seller: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
