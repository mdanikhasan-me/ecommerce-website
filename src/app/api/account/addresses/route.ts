import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // If setting as default, unset others
    if (body.isDefault) {
      await db.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } })
    }

    const address = await db.address.create({
      data: {
        userId: session.user.id,
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

    return NextResponse.json({ address }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
