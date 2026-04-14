import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ suggestions: [] })

  const products = await db.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { name: { contains: q, mode: 'insensitive' } } },
        { tags: { has: q.toLowerCase() } },
      ],
    },
    select: { name: true, slug: true },
    take: 8,
    orderBy: { soldCount: 'desc' },
  })

  return NextResponse.json({ suggestions: products })
}
