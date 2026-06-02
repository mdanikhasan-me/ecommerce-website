import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminHomepageSectionPayload } from '@/backend/admin/homepage-section-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const { id } = await params

    const existingSection = await db.homepageSection.findUnique({ where: { id } })
    if (!existingSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    const parsed = parseAdminHomepageSectionPayload(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const payload = parsed.data

    const section = await db.homepageSection.update({
      where: { id: existingSection.id },
      data: {
        type: payload.type,
        title: payload.title,
        subtitle: payload.subtitle,
        config: payload.config,
        isActive: payload.isActive,
        sortOrder: payload.sortOrder,
      },
    })

    return NextResponse.json({ section })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to update section')
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    await requireAdminSession()
    const { id } = await params

    const existingSection = await db.homepageSection.findUnique({ where: { id } })
    if (!existingSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    await db.homepageSection.delete({ where: { id: existingSection.id } })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Unable to delete section')
    return NextResponse.json({ error: message }, { status })
  }
}
