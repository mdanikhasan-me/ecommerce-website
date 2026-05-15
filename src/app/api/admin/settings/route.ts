import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminSettingsPayload } from '@/backend/admin/settings-editor'
import { db } from '@/backend/database'

export async function GET() {
  try {
    await requireAdminSession()

    const settingsList = await db.setting.findMany()
    const settings = Object.fromEntries(settingsList.map((s) => [s.key, s.value]))

    return NextResponse.json({ settings })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not load settings'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminSession()
    const parsed = parseAdminSettingsPayload(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    await Promise.all(
      parsed.data.map(({ key, value, group }) =>
        db.setting.upsert({
          where: { key },
          update: { value, group },
          create: { key, value, group },
        }),
      ),
    )

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not save settings'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
