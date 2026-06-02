import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import { parseAdminReturnStatusFilter } from '@/backend/admin/return-editor'
import { toSafeClientError } from '@/backend/security/client-error'

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession()

    const { searchParams } = new URL(req.url)
    const status = parseAdminReturnStatusFilter(searchParams.get('status')?.trim() ?? null)

    const where = status ? { status } : undefined
    const returns = await db.returnRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ returns })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not load return requests')
    return NextResponse.json({ error: message }, { status })
  }
}
