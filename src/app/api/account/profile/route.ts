import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const rawName = typeof body.name === 'string' ? body.name.trim() : ''
    const rawPhone = typeof body.phone === 'string' ? body.phone.trim() : ''

    if (!rawName || rawName.length > 120) {
      return NextResponse.json({ error: 'Name must be between 1 and 120 characters' }, { status: 400 })
    }
    if (rawPhone && (rawPhone.length > 20 || !/^[0-9+\-()\s]+$/.test(rawPhone))) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: { name: rawName, phone: rawPhone || null },
      select: { id: true, name: true, phone: true },
    })

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: 'Could not update profile' }, { status: 500 })
  }
}
