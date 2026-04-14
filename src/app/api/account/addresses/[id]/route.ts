import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const existing = await db.address.findUnique({ where: { id: params.id, userId: session.user.id } })
    if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 })

    const body = await req.json()

    if (body.isDefault) {
      await db.address.updateMany({ where: { userId: session.user.id, id: { not: params.id } }, data: { isDefault: false } })
    }

    const address = await db.address.update({
      where: { id: params.id },
      data: {
        fullName: body.fullName,
        phone: body.phone,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2 || null,
        city: body.city,
        area: body.area,
        postalCode: body.postalCode || null,
        isDefault: body.isDefault ?? false,
      },
    })

    return NextResponse.json({ address })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const existing = await db.address.findUnique({ where: { id: params.id, userId: session.user.id } })
    if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 })

    await db.address.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
