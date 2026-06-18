import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { db } from '@/backend/database'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { STOREFRONT_CACHE_TAGS } from '@/backend/catalog/storefront-revalidation'
import { getPublicSearchWords, parsePublicSearchQuery } from '@/backend/api/public-input'
import { rateLimit } from '@/backend/security/rate-limit'

const getCachedSuggestions = unstable_cache(async (q: string) => {
  const words = getPublicSearchWords(q)

  const nameOR = [
    { name: { contains: q, mode: 'insensitive' as const } },
    ...words.map((w) => ({ name: { contains: w, mode: 'insensitive' as const } })),
  ]

  const matchedCategories = await db.category.findMany({
    where: { isActive: true, OR: nameOR },
    select: { id: true },
  })

  const categoryIds = matchedCategories.map((c) => c.id)

  const productOR: Prisma.ProductWhereInput[] = []
  if (categoryIds.length > 0) productOR.push({ categoryId: { in: categoryIds } })
  productOR.push({ name: { contains: q, mode: 'insensitive' } })
  for (const w of words) productOR.push({ name: { contains: w, mode: 'insensitive' } })
  if (words.length > 0) productOR.push({ tags: { hasSome: words } })

  const products = await db.product.findMany({
    where: getBuyerVisibleProductWhere({ OR: productOR }),
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

  return productSuggestions
}, ['search-suggestions-v1'], {
  revalidate: 60,
  tags: [STOREFRONT_CACHE_TAGS.products, STOREFRONT_CACHE_TAGS.categories],
})

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, { key: 'search:suggestions', limit: 60, windowMs: 60_000 })
  if (limited) return limited

  const q = parsePublicSearchQuery(req.nextUrl.searchParams.get('q'))
  if (!q || q.length < 2) return NextResponse.json({ suggestions: [] })

  const suggestions = await getCachedSuggestions(q)

  return NextResponse.json(
    { suggestions },
    { headers: { 'cache-control': 'public, max-age=30, stale-while-revalidate=300' } },
  )
}
