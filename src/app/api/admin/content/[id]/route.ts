import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'

interface RouteContext {
  params: Promise<{ id: string }>
}

function parseConfig(
  config: string | null,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (!config) return Prisma.JsonNull

  try {
    return JSON.parse(config) as Prisma.InputJsonValue
  } catch {
    throw new Error('Config must be valid JSON')
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminSession()
    const { id } = await params

    const existingSection = await db.homepageSection.findUnique({ where: { id } })
    if (!existingSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    const payload = await req.json()
    if (!payload.type?.trim()) throw new Error('Section type is required')

    const section = await db.homepageSection.update({
      where: { id: existingSection.id },
      data: {
        type: payload.type.trim(),
        title: payload.title?.trim() || null,
        subtitle: payload.subtitle?.trim() || null,
        config: parseConfig(payload.config || null),
        isActive: payload.isActive ?? true,
        sortOrder: Number(payload.sortOrder ?? 0),
      },
    })

    return NextResponse.json({ section })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to update section' }, { status })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminSession()
    const { id } = await params

    const existingSection = await db.homepageSection.findUnique({ where: { id } })
    if (!existingSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    await db.homepageSection.delete({ where: { id: existingSection.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to delete section' }, { status })
  }
}
