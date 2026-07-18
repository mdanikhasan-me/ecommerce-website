import { NextRequest, NextResponse } from 'next/server'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminSettingsPayload } from '@/backend/admin/settings-editor'
import { db } from '@/backend/database'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'

export async function GET() {
  try {
    await requireAdminSession()

    const settingsList = await db.setting.findMany()
    const settings = Object.fromEntries(settingsList.map((s) => [s.key, s.value]))

    return NextResponse.json({ settings })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not load settings')
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const body = await readBoundedJsonBody(req, JSON_BODY_LIMITS.standard)
    if (!body.success) return body.response
    const parsed = parseAdminSettingsPayload(body.data)
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
    const { message, status } = toSafeClientError(error, 'Could not save settings')
    return NextResponse.json({ error: message }, { status })
  }
}
