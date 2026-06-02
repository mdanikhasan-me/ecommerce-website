import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/backend/database'
import { z } from 'zod'
import { rateLimit } from '@/backend/security/rate-limit'
import { protectMutationRequest } from '@/backend/security/request-guard'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const blocked = protectMutationRequest(req)
    if (blocked) return blocked

    const limited = rateLimit(req, { key: 'auth:register', limit: 5, windowMs: 60_000 })
    if (limited) return limited

    const body = await req.json()
    const { name, email, password, phone } = registerSchema.parse(body)

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: { name, email, password: hashedPassword, phone, role: 'CUSTOMER' },
    })

    // Create cart and wishlist
    await Promise.all([
      db.cart.create({ data: { userId: user.id } }),
      db.wishlist.create({ data: { userId: user.id } }),
    ])

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
