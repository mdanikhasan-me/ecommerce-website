import { NextRequest, NextResponse } from 'next/server'
import { getActiveUserSession } from '@/backend/auth/active-user'
import { db } from '@/backend/database'
import { parseProfilePayload } from '@/backend/account/profile'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'

export async function PUT(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    const session = await getActiveUserSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await readBoundedJsonBody(req, JSON_BODY_LIMITS.standard)
    if (!body.success) return body.response
    const parsed = parseProfilePayload(body.data)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: { id: true, name: true, phone: true },
    })

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: 'Could not update profile' }, { status: 500 })
  }
}
