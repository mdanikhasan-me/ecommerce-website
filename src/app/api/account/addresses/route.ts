import { NextRequest, NextResponse } from 'next/server'
import { getActiveUserSession } from '@/backend/auth/active-user'
import { db } from '@/backend/database'
import { parseAddressPayload } from '@/backend/account/address'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'

export async function GET() {
  try {
    const session = await getActiveUserSession()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const addresses = await db.address.findMany({
      where: { userId: session.user.id, isSaved: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        fullName: true,
        phone: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        district: true,
        division: true,
        postalCode: true,
        isDefault: true,
      },
    })

    return NextResponse.json({ addresses })
  } catch {
    return NextResponse.json({ error: 'Could not load addresses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const blocked = protectMutationRequest(request)
    if (blocked) return blocked

    const session = await getActiveUserSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await readBoundedJsonBody(request, JSON_BODY_LIMITS.standard)
    if (!body.success) return body.response
    const parsed = parseAddressPayload(body.data)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const address = await db.$transaction(async (tx) => {
      if (parsed.data.isDefault) {
        await tx.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } })
      }

      return tx.address.create({
        data: {
          userId: session.user.id,
          isSaved: true,
          ...parsed.data,
        },
      })
    })

    return NextResponse.json({ address }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Could not save address' }, { status: 500 })
  }
}
