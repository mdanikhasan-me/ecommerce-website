import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'
import { rateLimit } from '@/backend/security/rate-limit'
import { protectMutationRequest } from '@/backend/security/request-guard'

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    const limited = rateLimit(req, { key: 'newsletter:create', limit: 8, windowMs: 60_000 })
    if (limited) return limited

    const body = await req.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const source = typeof body.source === 'string' ? body.source.trim().slice(0, 60) : null

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    await db.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email, source },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Could not subscribe' }, { status: 500 })
  }
}
