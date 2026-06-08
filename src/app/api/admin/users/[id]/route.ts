import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/backend/database'
import { isSuperAdminRole, logAdminAudit, requireAdminSession } from '@/backend/admin/admin-utils'
import { ADMIN_USER_DETAIL_SELECT, parseAdminUserPayload } from '@/backend/admin/user-editor'
import { toSafeClientError } from '@/backend/security/client-error'
import { protectMutationRequest } from '@/backend/security/request-guard'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession()
    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
      select: ADMIN_USER_DETAIL_SELECT,
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not load user')
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    const session = await requireAdminSession()
    const { id } = await params
    const parsed = parseAdminUserPayload(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const payload = parsed.data

    const existingUser = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const nextRole = payload.role ?? existingUser.role
    const nextActive = payload.isActive ?? existingUser.isActive
    const actorIsSuperAdmin = isSuperAdminRole(session.user.role)

    if (!actorIsSuperAdmin && (isSuperAdminRole(existingUser.role) || isSuperAdminRole(nextRole))) {
      return NextResponse.json(
        { error: 'Only a super admin can manage super admin access' },
        { status: 403 }
      )
    }

    if (session.user.id === existingUser.id && !nextActive) {
      return NextResponse.json({ error: 'You cannot deactivate your own account' }, { status: 400 })
    }

    if (session.user.id === existingUser.id && !['ADMIN', 'SUPER_ADMIN'].includes(nextRole)) {
      return NextResponse.json({ error: 'You cannot remove your own admin access' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: existingUser.id },
      data: {
        name: payload.name,
        phone: payload.phone,
        role: nextRole,
        isActive: nextActive,
      },
      select: ADMIN_USER_DETAIL_SELECT,
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
  } catch (error: unknown) {
    const { message, status } = toSafeClientError(error, 'Could not update user')
    return NextResponse.json({ error: message }, { status })
  }
}
