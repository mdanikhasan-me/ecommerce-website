import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'

function parseConfig(config: string | null): Prisma.InputJsonValue | null {
  if (!config) return null

  try {
    return JSON.parse(config) as Prisma.InputJsonValue
  } catch {
    throw new Error('Config must be valid JSON')
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminSession()

    const payload = await req.json()
    if (!payload.type?.trim()) throw new Error('Section type is required')

    const section = await db.homepageSection.create({
      data: {
        type: payload.type.trim(),
        title: payload.title?.trim() || null,
        subtitle: payload.subtitle?.trim() || null,
        config: parseConfig(payload.config || null),
        isActive: payload.isActive ?? true,
        sortOrder: Number(payload.sortOrder ?? 0),
      },
    })

    return NextResponse.json({ section }, { status: 201 })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Unable to create section' }, { status })
  }
}
