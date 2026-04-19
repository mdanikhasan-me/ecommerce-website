import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'

function clean(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const seller = await db.seller.findUnique({ where: { userId: session.user.id } })
    if (!seller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (seller.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Your seller account is not approved for edits yet' }, { status: 403 })
    }

    const body = await req.json()
    const storeName = clean(body.storeName, 120)
    if (!storeName) {
      return NextResponse.json({ error: 'Store name is required' }, { status: 400 })
    }

    const updated = await db.seller.update({
      where: { id: seller.id },
      data: {
        storeName,
        description: clean(body.description, 2000),
        businessType: clean(body.businessType, 80),
        tradeLicense: clean(body.tradeLicense, 80),
        nidNumber: clean(body.nidNumber, 40),
        bankName: clean(body.bankName, 120),
        bankAccount: clean(body.bankAccount, 40),
        bkashNumber: clean(body.bkashNumber, 20),
      },
    })

    return NextResponse.json({ seller: updated })
  } catch {
    return NextResponse.json({ error: 'Could not update seller settings' }, { status: 500 })
  }
}
