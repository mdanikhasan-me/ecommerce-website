import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { logAdminAudit, requireAdminSession } from '@/backend/admin/admin-utils'

const ROLES = ['CUSTOMER', 'SELLER', 'ADMIN', 'SUPER_ADMIN']

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession()
    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
            addresses: true,
            notifications: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Could not load user' }, { status })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession()
    const { id } = await params
    const payload = await req.json()

    const existingUser = await db.user.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            storeName: true,
            status: true,
          },
        },
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const nextRole = payload.role ?? existingUser.role
    if (!ROLES.includes(nextRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const nextActive = payload.isActive ?? existingUser.isActive

    if (session.user.id === existingUser.id && !nextActive) {
      return NextResponse.json({ error: 'You cannot deactivate your own account' }, { status: 400 })
    }

    if (session.user.id === existingUser.id && !['ADMIN', 'SUPER_ADMIN'].includes(nextRole)) {
      return NextResponse.json({ error: 'You cannot remove your own admin access' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: existingUser.id },
      data: {
        name: payload.name?.trim() || null,
        phone: payload.phone?.trim() || null,
        role: nextRole,
        isActive: Boolean(nextActive),
      },
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
            addresses: true,
            notifications: true,
          },
        },
      },
    })

    await logAdminAudit({
      userId: session.user.id,
      action: 'user.updated',
      entity: 'user',
      entityId: user.id,
      oldValues: {
        name: existingUser.name,
        phone: existingUser.phone,
        role: existingUser.role,
        isActive: existingUser.isActive,
      },
      newValues: {
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
    })

    revalidatePath('/admin/users')
    revalidatePath(`/admin/users/${user.id}`)

    return NextResponse.json({ user })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 400
    return NextResponse.json({ error: error.message || 'Could not update user' }, { status })
  }
}
