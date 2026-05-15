import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { parseProfilePayload } from '@/backend/account/profile'

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = parseProfilePayload(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: { id: true, name: true, phone: true },
    })

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: 'Could not update profile' }, { status: 500 })
  }
}
