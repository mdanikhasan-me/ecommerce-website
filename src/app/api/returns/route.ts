import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { rateLimit } from '@/backend/security/rate-limit'
import { logSecurityEvent } from '@/backend/security/security-log'
import { parseBuyerReturnRequestPayload } from '@/backend/orders/buyer-validation'
import { createBuyerReturnRequest, type BuyerReturnDb } from '@/backend/orders/buyer-return-request'

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    const limited = rateLimit(req, { key: 'returns:create', limit: 10, windowMs: 60_000 })
    if (limited) return limited

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please sign in to request a return' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid return request' }, { status: 400 })
    }

    const parsed = parseBuyerReturnRequestPayload(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const result = await createBuyerReturnRequest({
      database: db as unknown as BuyerReturnDb,
      userId: session.user.id,
      payload: parsed.data,
      revalidate: revalidatePath,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json(result.payload, { status: 201 })
  } catch {
    logSecurityEvent({
      type: 'server_error',
      severity: 'error',
      route: req.nextUrl.pathname,
      method: req.method,
      statusCode: 500,
      errorCode: 'return_request_create_failed',
      metadata: {
        feature: 'returns',
      },
    })
    return NextResponse.json({ error: 'Could not create return request' }, { status: 500 })
  }
}
