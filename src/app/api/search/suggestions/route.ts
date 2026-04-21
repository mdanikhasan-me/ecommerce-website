import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/backend/database'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ suggestions: [] })

  const words = Array.from(
    new Set(q.toLowerCase().split(/\s+/).filter((w) => w.length >= 2))
  )

  const nameOR = [
    { name: { contains: q, mode: 'insensitive' as const } },
    ...words.map((w) => ({ name: { contains: w, mode: 'insensitive' as const } })),
  ]

  const matchedCategories = await db.category.findMany({
    where: { OR: nameOR },
    select: { id: true },
  })

  const categoryIds = matchedCategories.map((c) => c.id)

  const productOR: object[] = []
  if (categoryIds.length > 0) productOR.push({ categoryId: { in: categoryIds } })
  productOR.push({ name: { contains: q, mode: 'insensitive' } })
  for (const w of words) productOR.push({ name: { contains: w, mode: 'insensitive' } })
  if (words.length > 0) productOR.push({ tags: { hasSome: words } })

  const products = await db.product.findMany({
    where: { isActive: true, OR: productOR },
    select: { name: true, slug: true },
    take: 6,
    orderBy: { soldCount: 'desc' },
  })

  const productSuggestions = products.map((p) => ({
    type: 'product' as const,
    name: p.name,
    slug: p.slug,
    href: `/products/${p.slug}`,
  }))

  return NextResponse.json({ suggestions: productSuggestions })
}
