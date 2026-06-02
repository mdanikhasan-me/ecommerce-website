import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { parseAddressPayload } from '@/backend/account/address'
import { protectMutationRequest } from '@/backend/security/request-guard'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const blocked = protectMutationRequest(request)
    if (blocked) return blocked

    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const existing = await db.address.findFirst({ where: { id, userId: session.user.id } })
    if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 })

    const parsed = parseAddressPayload(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const address = await db.$transaction(async (tx) => {
      if (parsed.data.isDefault) {
        await tx.address.updateMany({ where: { userId: session.user.id, id: { not: id } }, data: { isDefault: false } })
      }

      return tx.address.update({
        where: { id },
        data: parsed.data,
      })
    })

    return NextResponse.json({ address })
  } catch {
    return NextResponse.json({ error: 'Could not update address' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const blocked = protectMutationRequest(request)
    if (blocked) return blocked

    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const existing = await db.address.findFirst({ where: { id, userId: session.user.id } })
    if (!existing) return NextResponse.json({ error: 'Address not found' }, { status: 404 })

    await db.address.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Could not delete address' }, { status: 500 })
  }
}
