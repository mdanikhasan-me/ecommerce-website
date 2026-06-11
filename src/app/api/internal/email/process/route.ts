import { createHash, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getEmailProcessorSecret } from '@/backend/email/config'
import { processDueEmails } from '@/backend/email/processor'
import { logSecurityEvent } from '@/backend/security/security-log'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest): boolean {
  const expected = getEmailProcessorSecret()
  if (!expected) return false

  const provided = req.headers.get('x-email-processor-secret') ?? ''
  if (!provided) return false

  // Hash both sides so timingSafeEqual gets equal-length buffers.
  const expectedDigest = createHash('sha256').update(expected).digest()
  const providedDigest = createHash('sha256').update(provided).digest()
  return timingSafeEqual(expectedDigest, providedDigest)
}

/**
 * Protected outbox processor. Called by the deployment's cron job; never
 * linked from any UI and never authenticated by browser cookies. Returns only
 * aggregate counts — no recipients, order details, or provider errors.
 */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    logSecurityEvent({
      type: 'email_processor_unauthorized',
      severity: 'warn',
      route: req.nextUrl.pathname,
      method: req.method,
      statusCode: 401,
      errorCode: 'unauthorized',
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const summary = await processDueEmails()
    return NextResponse.json(summary)
  } catch {
    logSecurityEvent({
      type: 'email_processor_failed',
      severity: 'error',
      route: req.nextUrl.pathname,
      method: req.method,
      statusCode: 500,
      errorCode: 'email_processor_failed',
    })
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
