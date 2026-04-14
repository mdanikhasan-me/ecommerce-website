import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, phone } = await req.json()

    const user = await db.user.update({
      where: { id: session.user.id },
      data: { name, phone: phone || null },
      select: { id: true, name: true, phone: true },
    })

    return NextResponse.json({ user })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
