import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getActiveUserSession } from '@/backend/auth/active-user'
import { db } from '@/backend/database'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { rateLimit } from '@/backend/security/rate-limit'
import { logSecurityEvent } from '@/backend/security/security-log'
import { parseBuyerReturnRequestPayload } from '@/backend/orders/buyer-validation'
import { createBuyerReturnRequest, type BuyerReturnDb } from '@/backend/orders/buyer-return-request'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    const limited = rateLimit(req, { key: 'returns:create', limit: 10, windowMs: 60_000 })
    if (limited) return limited

    const session = await getActiveUserSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please sign in to request a return' }, { status: 401 })
    }

    const body = await readBoundedJsonBody(req, JSON_BODY_LIMITS.standard)
    if (!body.success) return body.response
    const parsed = parseBuyerReturnRequestPayload(body.data)
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
