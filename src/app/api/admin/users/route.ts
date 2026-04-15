import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || '25')))
    const q = searchParams.get('q')?.trim()
    const role = searchParams.get('role')?.trim()

    const where: Record<string, unknown> = {}
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ]
    }
    if (role) {
      where.role = role
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: {
            select: {
              id: true,
              storeName: true,
              storeSlug: true,
              status: true,
            },
          },
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Could not load users' }, { status })
  }
}
