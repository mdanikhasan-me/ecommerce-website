import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { requireAdminSession } from '@/backend/admin/admin-utils'
import {
  ADMIN_USER_LIST_SELECT,
  buildAdminUserWhere,
  parseAdminUserListFilters,
} from '@/backend/admin/user-editor'
import { toSafeClientError } from '@/backend/security/client-error'

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession()

    const { searchParams } = new URL(req.url)
    const filters = parseAdminUserListFilters(searchParams)
    const where = buildAdminUserWhere(filters)

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
        select: ADMIN_USER_LIST_SELECT,
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / filters.limit)),
      },
    })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not load users')
    return NextResponse.json({ error: message }, { status })
  }
}
