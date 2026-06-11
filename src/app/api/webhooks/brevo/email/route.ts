import { createHash, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getEmailWebhookCredentials } from '@/backend/email/config'
import { db } from '@/backend/database'
import { logSecurityEvent } from '@/backend/security/security-log'

export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 64 * 1024
const MAX_FIELD_LENGTH = 200

// Official transactional events we track for delivery visibility:
// https://developers.brevo.com/docs/transactional-webhooks
const ALLOWED_EVENTS = new Set([
  'request',
  'sent',
  'delivered',
  'deferred',
  'soft_bounce',
  'softBounce',
  'hard_bounce',
  'hardBounce',
  'blocked',
  'invalid',
  'invalid_email',
  'spam',
  'complaint',
  'error',
])

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest()
}

/**
 * Brevo authenticates webhook calls with Basic credentials embedded in the
 * notify URL (officially supported "secure webhook calls" mechanism). The
 * route is disabled (404) until both credentials are configured.
 */
function isAuthorized(req: NextRequest): boolean {
  const credentials = getEmailWebhookCredentials()
  if (!credentials) return false

  const header = req.headers.get('authorization') ?? ''
  if (!header.startsWith('Basic ')) return false

  let decoded = ''
  try {
    decoded = Buffer.from(header.slice(6).trim(), 'base64').toString('utf8')
  } catch {
    return false
  }

  const separator = decoded.indexOf(':')
  if (separator < 0) return false

  const username = decoded.slice(0, separator)
  const password = decoded.slice(separator + 1)

  const usernameMatches = timingSafeEqual(digest(username), digest(credentials.username))
  const passwordMatches = timingSafeEqual(digest(password), digest(credentials.password))
  return usernameMatches && passwordMatches
}

function readField(payload: Record<string, unknown>, key: string): string | null {
  const value = payload[key]
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_FIELD_LENGTH) return null
  return trimmed
}

/**
 * Updates delivery metadata on the matching outbox record. Never updates
 * order status from a delivery webhook, and never trusts the payload beyond
 * the authenticated provider-message-id lookup.
 */
export async function POST(req: NextRequest) {
  const credentials = getEmailWebhookCredentials()
  if (!credentials) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (!isAuthorized(req)) {
    logSecurityEvent({
      type: 'email_webhook_unauthorized',
      severity: 'warn',
      route: req.nextUrl.pathname,
      method: req.method,
      statusCode: 401,
      errorCode: 'unauthorized',
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bodyText = await req.text()
  if (new TextEncoder().encode(bodyText).byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  let payload: Record<string, unknown>
  try {
    const parsed = JSON.parse(bodyText) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    payload = parsed as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const event = readField(payload, 'event')
  const providerMessageId = readField(payload, 'message-id')

  if (!event || !ALLOWED_EVENTS.has(event)) {
    // Unknown event types are acknowledged without processing.
    return NextResponse.json({ received: true, processed: false })
  }
  if (!providerMessageId) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Idempotent by construction: the same (message-id, event) writes the same
  // delivery state; replays cannot duplicate emails or change orders.
  const updated = await db.emailOutbox.updateMany({
    where: { providerMessageId },
    data: {
      lastDeliveryEvent: event,
      lastDeliveryEventAt: new Date(),
    },
  })

  return NextResponse.json({ received: true, processed: updated.count > 0 })
}
