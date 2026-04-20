import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { recordProductView } from '@/backend/commerce-stats'

const VIEWER_COOKIE = 'boilabin_viewer'
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const product = await db.product.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  })

  if (!product?.isActive) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const session = await auth()
  const cookieViewerId = req.cookies.get(VIEWER_COOKIE)?.value
  const generatedViewerId = cookieViewerId || crypto.randomUUID()
  const viewerKey = session?.user?.id ? `user:${session.user.id}` : `guest:${generatedViewerId}`

  const counted = await recordProductView({
    productId: product.id,
    viewerKey,
    userId: session?.user?.id ?? null,
  })

  const response = NextResponse.json({ success: true, counted })

  if (!session?.user && !cookieViewerId) {
    response.cookies.set({
      name: VIEWER_COOKIE,
      value: generatedViewerId,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ONE_YEAR_IN_SECONDS,
    })
  }

  return response
}
