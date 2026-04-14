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

  // Pre-fetch brand IDs and category IDs whose names match
  const [matchedBrands, matchedCategories] = await Promise.all([
    db.brand.findMany({ where: { OR: nameOR }, select: { id: true, name: true, slug: true } }),
    db.category.findMany({ where: { OR: nameOR }, select: { id: true } }),
  ])

  const brandIds = matchedBrands.map((b) => b.id)
  const categoryIds = matchedCategories.map((c) => c.id)

  // Build product OR — brand/category by ID, name by word, no description (too noisy for suggestions)
  const productOR: object[] = []
  if (brandIds.length > 0) productOR.push({ brandId: { in: brandIds } })
  if (categoryIds.length > 0) productOR.push({ categoryId: { in: categoryIds } })
  productOR.push({ name: { contains: q, mode: 'insensitive' } })
  for (const w of words) productOR.push({ name: { contains: w, mode: 'insensitive' } })
  if (words.length > 0) productOR.push({ tags: { hasSome: words } })

  const products = await db.product.findMany({
    where: { isActive: true, OR: productOR },
    select: { name: true, slug: true, brand: { select: { name: true } } },
    take: 6,
    orderBy: { soldCount: 'desc' },
  })

  const brandSuggestions = matchedBrands.slice(0, 3).map((b) => ({
    type: 'brand' as const,
    name: b.name,
    slug: b.slug,
    href: `/search?brand=${b.slug}`,
  }))

  const productSuggestions = products.map((p) => ({
    type: 'product' as const,
    name: p.name,
    slug: p.slug,
    href: `/products/${p.slug}`,
    brandName: p.brand?.name ?? null,
  }))

  return NextResponse.json({ suggestions: [...brandSuggestions, ...productSuggestions] })
}
