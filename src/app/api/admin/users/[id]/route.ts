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
    const isSelf = session.user.id === existingUser.id
    const roleChanged = nextRole !== existingUser.role
    const activeChanged = nextActive !== existingUser.isActive

    if (isSelf && roleChanged) {
      return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 })
    }

    if (isSelf && activeChanged) {
      return NextResponse.json({ error: 'You cannot change your own account status' }, { status: 400 })
    }

    if (!actorIsSuperAdmin && roleChanged) {
      return NextResponse.json(
        { error: 'Only a super admin can change account roles' },
        { status: 403 }
      )
    }

    if (!actorIsSuperAdmin && activeChanged) {
      return NextResponse.json(
        { error: 'Only a super admin can change account status' },
        { status: 403 }
      )
    }

    if (!actorIsSuperAdmin && existingUser.role !== 'CUSTOMER' && !isSelf) {
      return NextResponse.json(
        { error: 'Only a super admin can manage administrator accounts' },
        { status: 403 }
      )
    }

    if (
      existingUser.role === 'SUPER_ADMIN' &&
      existingUser.isActive &&
      (nextRole !== 'SUPER_ADMIN' || !nextActive)
    ) {
      const activeSuperAdminCount = await db.user.count({
        where: { role: 'SUPER_ADMIN', isActive: true },
      })
      if (activeSuperAdminCount <= 1) {
        return NextResponse.json(
          { error: 'The last active super admin cannot be removed or deactivated' },
          { status: 409 }
        )
      }
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
