import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { rateLimit } from '@/backend/security/rate-limit'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'

const SUBJECTS = new Set([
  'Order Issue',
  'Return Request',
  'Product Query',
  'Payment Issue',
  'Other',
])

function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    const limited = rateLimit(req, { key: 'contact:create', limit: 5, windowMs: 60_000 })
    if (limited) return limited

    const body = await readBoundedJsonBody(req, JSON_BODY_LIMITS.standard)
    if (!body.success) return body.response
    const input = body.data as Record<string, unknown>
    const name = clean(input?.name, 120)
    const email = clean(input?.email, 254)
    const subject = clean(input?.subject, 120)
    const message = clean(input?.message, 4000)

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!SUBJECTS.has(subject)) {
      return NextResponse.json({ error: 'Invalid subject' }, { status: 400 })
    }

    await db.contactMessage.create({
      data: { name, email, subject, message },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Could not send message' }, { status: 500 })
  }
}
