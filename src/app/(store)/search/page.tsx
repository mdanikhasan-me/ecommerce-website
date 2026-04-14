import { db } from '@/backend/database'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { SearchFiltersPanel } from '@/frontend/components/product/SearchFiltersPanel'
import { SortSelect } from '@/frontend/components/search/SortSelect'
import type { Metadata } from 'next'
import { Prisma } from '@prisma/client'

type SearchParams = {
  q?: string; category?: string; brand?: string; minPrice?: string; maxPrice?: string;
  rating?: string; inStock?: string; sort?: string; page?: string; featured?: string;
}

interface Props {
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const q = params.q
  return {
    title: q ? `Search: "${q}"` : 'All Products',
    description: q ? `Search results for "${q}"` : 'Browse all products',
  }
}

/**
 * Resolve a free-text query into a set of Prisma WHERE conditions.
 *
 * Strategy: pre-fetch brand IDs and category IDs whose names match any word
 * in the query, then filter products using direct foreign-key `in` lookups.
 * This avoids Prisma's nested-relation OR filter, which can silently generate
 * bad SQL depending on the adapter version.
 */
async function resolveTextWhere(q: string): Promise<Prisma.ProductWhereInput> {
  const normalized = q.trim()
  if (!normalized) return {}

  // All unique words >= 2 chars that we want to match
  const words = Array.from(
    new Set(normalized.toLowerCase().split(/\s+/).filter((w) => w.length >= 2))
  )

  // Build OR for brand names: match full phrase OR any individual word
  const brandNameOR = [
    { name: { contains: normalized, mode: 'insensitive' as const } },
    ...words.map((w) => ({ name: { contains: w, mode: 'insensitive' as const } })),
  ]

  // Build OR for category names: same approach
  const catNameOR = [
    { name: { contains: normalized, mode: 'insensitive' as const } },
    ...words.map((w) => ({ name: { contains: w, mode: 'insensitive' as const } })),
  ]

  // Resolve brand and category IDs concurrently — simple indexed lookups
  const [matchedBrands, matchedCategories] = await Promise.all([
    db.brand.findMany({
      where: { OR: brandNameOR },
      select: { id: true },
    }),
    db.category.findMany({
      where: { OR: catNameOR },
      select: { id: true },
    }),
  ])

  const brandIds = matchedBrands.map((b) => b.id)
  const categoryIds = matchedCategories.map((c) => c.id)

  // Build the final OR conditions for products
  // Relevance priority:
  //   1. Brand / category match  (pre-fetched IDs — no false positives)
  //   2. Product name — full phrase, then individual words
  //   3. Tags — exact word match
  //   4. Short description / description — FULL PHRASE ONLY
  //      (individual-word description search is too noisy:
  //       a "USB-C phone charger" description would surface chargers for
  //       every "phone" or "laptop" search)
  const productOR: Prisma.ProductWhereInput[] = []

  // Brand / category via direct FK IN — most precise
  if (brandIds.length > 0) productOR.push({ brandId: { in: brandIds } })
  if (categoryIds.length > 0) productOR.push({ categoryId: { in: categoryIds } })

  // Name — full phrase first, then each word
  productOR.push({ name: { contains: normalized, mode: 'insensitive' } })
  for (const w of words) {
    productOR.push({ name: { contains: w, mode: 'insensitive' } } satisfies Prisma.ProductWhereInput)
  }

  // Tags — exact word set match
  if (words.length > 0) productOR.push({ tags: { hasSome: words } })

  // Description fields — full phrase only, never individual words
  productOR.push({ shortDescription: { contains: normalized, mode: 'insensitive' } })
  productOR.push({ description: { contains: normalized, mode: 'insensitive' } })

  return { OR: productOR }
}

async function getSearchResults(params: SearchParams) {
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 24
  const skip = (page - 1) * limit

  const andClauses: Prisma.ProductWhereInput[] = [{ isActive: true }]

  // Text search — resolved to direct ID lookups
  if (params.q?.trim()) {
    const textWhere = await resolveTextWhere(params.q.trim())
    andClauses.push(textWhere)
  }

  // Hard filters applied as additional AND clauses
  if (params.category) andClauses.push({ category: { slug: params.category } })
  if (params.brand) andClauses.push({ brand: { slug: params.brand } })
  if (params.minPrice) andClauses.push({ basePrice: { gte: parseFloat(params.minPrice) } })
  if (params.maxPrice) andClauses.push({ basePrice: { lte: parseFloat(params.maxPrice) } })
  if (params.inStock === 'true') andClauses.push({ stockQuantity: { gt: 0 } })
  if (params.rating) andClauses.push({ rating: { gte: parseFloat(params.rating) } })
  if (params.featured === 'true') andClauses.push({ isFeatured: true })

  const where: Prisma.ProductWhereInput = andClauses.length === 1 ? andClauses[0] : { AND: andClauses }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { soldCount: 'desc' }
  if (params.sort === 'newest') orderBy = { createdAt: 'desc' }
  else if (params.sort === 'price_asc') orderBy = { basePrice: 'asc' }
  else if (params.sort === 'price_desc') orderBy = { basePrice: 'desc' }
  else if (params.sort === 'rating') orderBy = { rating: 'desc' }

  const [products, total, brands, categories] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    db.product.count({ where }),
    db.brand.findMany({ where: { isActive: true }, select: { name: true, slug: true }, orderBy: { name: 'asc' }, take: 30 }),
    db.category.findMany({ where: { isActive: true }, select: { name: true, slug: true }, orderBy: { name: 'asc' } }),
  ])

  return { products, total, brands, categories, page, totalPages: Math.ceil(total / limit) }
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  const { products, total, brands, categories, page, totalPages } = await getSearchResults(params)

  const SORT_OPTIONS = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ]

  return (
    <div className="container-site py-8">
      <div className="mb-6">
        {params.q ? (
          <h1 className="font-display text-2xl font-bold">
            Results for <span className="text-primary">&quot;{params.q}&quot;</span>
            <span className="text-base font-normal text-muted-foreground ml-2">({total} products)</span>
          </h1>
        ) : (
          <h1 className="font-display text-2xl font-bold">
            All Products
            <span className="text-base font-normal text-muted-foreground ml-2">({total} products)</span>
          </h1>
        )}
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <SearchFiltersPanel brands={brands} categories={categories} searchParams={params} />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <p className="text-sm text-muted-foreground">{total} results</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <SortSelect current={params.sort ?? 'popular'} options={SORT_OPTIONS} />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <h2 className="font-display text-xl font-semibold">No products found</h2>
              <p className="text-muted-foreground mt-2">Try a different search term or remove some filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <PaginationLink href={buildPageUrl(params, page - 1)}>Prev</PaginationLink>
                  )}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i))
                    return (
                      <PaginationLink key={p} href={buildPageUrl(params, p)} active={p === page}>
                        {p}
                      </PaginationLink>
                    )
                  })}
                  {page < totalPages && (
                    <PaginationLink href={buildPageUrl(params, page + 1)}>Next</PaginationLink>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}


function PaginationLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
        active ? 'bg-primary text-white' : 'border border-border hover:bg-secondary'
      }`}
    >
      {children}
    </a>
  )
}

function buildPageUrl(params: Record<string, string | undefined>, page: number): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v)
  }
  sp.set('page', String(page))
  return `/search?${sp.toString()}`
}
