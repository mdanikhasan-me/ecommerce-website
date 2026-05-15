import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminHomepageSectionPayload } from '@/backend/admin/homepage-section-editor'

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession()

    const parsed = parseAdminHomepageSectionPayload(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const payload = parsed.data

    const section = await db.homepageSection.create({
      data: {
        type: payload.type,
        title: payload.title,
        subtitle: payload.subtitle,
        config: payload.config,
        isActive: payload.isActive,
        sortOrder: payload.sortOrder,
      },
    })

    return NextResponse.json({ section }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to create section'
    const status = message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
