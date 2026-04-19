import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'

function req(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const t = value.trim()
  if (!t || t.length > max) return null
  return t
}

function opt(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const t = value.trim()
  if (!t) return null
  return t.slice(0, max)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const existing = await db.address.findFirst({ where: { id, userId: session.user.id } })
    if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 })

    const body = await request.json()
    const fullName = req(body.fullName, 120)
    const phone = req(body.phone, 20)
    const addressLine1 = req(body.addressLine1, 200)
    const city = req(body.city, 80)
    const district = req(body.district, 80)
    const division = req(body.division, 80)

    if (!fullName || !phone || !addressLine1 || !city || !district || !division) {
      return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 })
    }
    if (!/^[0-9+\-()\s]+$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    if (body.isDefault) {
      await db.address.updateMany({ where: { userId: session.user.id, id: { not: id } }, data: { isDefault: false } })
    }

    const address = await db.address.update({
      where: { id },
      data: {
        fullName,
        phone,
        addressLine1,
        addressLine2: opt(body.addressLine2, 200),
        city,
        district,
        division,
        postalCode: opt(body.postalCode, 20),
        isDefault: Boolean(body.isDefault),
      },
    })

    return NextResponse.json({ address })
  } catch {
    return NextResponse.json({ error: 'Could not update address' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const existing = await db.address.findFirst({ where: { id, userId: session.user.id } })
    if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 })

    await db.address.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Could not delete address' }, { status: 500 })
  }
}
