import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { rateLimit } from '@/backend/security/rate-limit'

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
    const limited = rateLimit(req, { key: 'contact:create', limit: 5, windowMs: 60_000 })
    if (limited) return limited

    const body = await req.json()
    const name = clean(body.name, 120)
    const email = clean(body.email, 254)
    const subject = clean(body.subject, 120)
    const message = clean(body.message, 4000)

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
