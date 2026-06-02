import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { parseAddressPayload } from '@/backend/account/address'
import { protectMutationRequest } from '@/backend/security/request-guard'

export async function POST(request: NextRequest) {
  try {
    const blocked = protectMutationRequest(request)
    if (blocked) return blocked

    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = parseAddressPayload(await request.json())
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
          ...parsed.data,
        },
      })
    })

    return NextResponse.json({ address }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Could not save address' }, { status: 500 })
  }
}
