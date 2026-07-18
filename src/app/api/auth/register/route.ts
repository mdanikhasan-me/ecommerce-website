import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/backend/database'
import { z } from 'zod'
import { rateLimit } from '@/backend/security/rate-limit'
import { protectMutationRequest } from '@/backend/security/request-guard'
import { JSON_BODY_LIMITS, readBoundedJsonBody } from '@/backend/security/request-body'

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(72),
  phone: z.string().trim().max(20).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    const limited = rateLimit(req, { key: 'auth:register', limit: 5, windowMs: 60_000 })
    if (limited) return limited

    const body = await readBoundedJsonBody(req, JSON_BODY_LIMITS.standard)
    if (!body.success) return body.response
    const { name, email, password, phone } = registerSchema.parse(body.data)

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'CUSTOMER',
        cart: { create: {} },
        wishlist: { create: {} },
      },
      select: { id: true },
    })

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
