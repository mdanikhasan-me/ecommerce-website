import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'

export async function GET() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const settingsList = await db.setting.findMany()
  const settings = Object.fromEntries(settingsList.map((s) => [s.key, s.value]))

  return NextResponse.json({ settings })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { settings } = await req.json()

  await Promise.all(
    Object.entries(settings as Record<string, string>).map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value, group: 'general' },
      })
    )
  )

  return NextResponse.json({ success: true })
}
