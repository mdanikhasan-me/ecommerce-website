import { Suspense } from 'react'
import { db } from '@/backend/database'
import { ProductCard, ProductCardSkeleton } from '@/frontend/components/product/ProductCard'
import { SearchFiltersPanel } from '@/frontend/components/product/SearchFiltersPanel'
import type { Metadata } from 'next'
import { Prisma } from '@prisma/client'

interface Props {
  searchParams: {
    q?: string; category?: string; brand?: string; minPrice?: string; maxPrice?: string;
    rating?: string; inStock?: string; sort?: string; page?: string; featured?: string;
  }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = searchParams.q
  return {
    title: q ? `Search: "${q}"` : 'All Products',
    description: q ? `Search results for "${q}"` : 'Browse all products',
  }
}

async function getSearchResults(params: Props['searchParams']) {
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 24
  const skip = (page - 1) * limit

  const where: Prisma.ProductWhereInput = { isActive: true }

  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: 'insensitive' } },
      { description: { contains: params.q, mode: 'insensitive' } },
      { tags: { has: params.q.toLowerCase() } },
      { brand: { name: { contains: params.q, mode: 'insensitive' } } },
    ]
  }
  if (params.category) where.category = { slug: params.category }
  if (params.brand) where.brand = { slug: params.brand }
  if (params.minPrice || params.maxPrice) {
    where.OR = undefined
    where.AND = [
      params.q ? {
        OR: [
          { name: { contains: params.q, mode: 'insensitive' } },
          { tags: { has: params.q.toLowerCase() } },
        ]
      } : {},
      { basePrice: { gte: params.minPrice ? parseFloat(params.minPrice) : undefined } },
      { basePrice: { lte: params.maxPrice ? parseFloat(params.maxPrice) : undefined } },
    ].filter(Boolean)
  }
  if (params.inStock === 'true') where.stockQuantity = { gt: 0 }
  if (params.rating) where.rating = { gte: parseFloat(params.rating) }
  if (params.featured === 'true') where.isFeatured = true

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

  return { products, total, brands, categories, page, limit, totalPages: Math.ceil(total / limit) }
}

export default async function SearchPage({ searchParams }: Props) {
  const { products, total, brands, categories, page, totalPages } = await getSearchResults(searchParams)

  const SORT_OPTIONS = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ]

  return (
    <div className="container-site py-8">
      {/* Header */}
      <div className="mb-6">
        {searchParams.q ? (
          <h1 className="font-display text-2xl font-bold">
            Search results for <span className="text-primary">"{searchParams.q}"</span>
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
        {/* Filters Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <SearchFiltersPanel brands={brands} categories={categories} searchParams={searchParams} />
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <p className="text-sm text-muted-foreground">{total} results</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <a
                href="#"
                className="text-sm text-muted-foreground"
              >
                {/* sort select — client component */}
              </a>
              <SortSelect current={searchParams.sort ?? 'popular'} options={SORT_OPTIONS} />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <h2 className="font-display text-xl font-semibold">No products found</h2>
              <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <PaginationLink href={buildPageUrl(searchParams, page - 1)}>Prev</PaginationLink>
                  )}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i))
                    return (
                      <PaginationLink key={p} href={buildPageUrl(searchParams, p)} active={p === page}>
                        {p}
                      </PaginationLink>
                    )
                  })}
                  {page < totalPages && (
                    <PaginationLink href={buildPageUrl(searchParams, page + 1)}>Next</PaginationLink>
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

function SortSelect({ current, options }: { current: string; options: { value: string; label: string }[] }) {
  return (
    <form>
      <select
        name="sort"
        defaultValue={current}
        onChange={(e) => {
          const url = new URL(window.location.href)
          url.searchParams.set('sort', e.target.value)
          window.location.href = url.toString()
        }}
        className="text-sm border border-input rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </form>
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
