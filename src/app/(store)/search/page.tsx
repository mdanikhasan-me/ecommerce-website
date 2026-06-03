import { db } from '@/backend/database'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { MobileSearchFilters } from '@/frontend/components/product/MobileSearchFilters'
import { SearchFiltersPanel } from '@/frontend/components/product/SearchFiltersPanel'
import { SortSelect } from '@/frontend/components/search/SortSelect'
import {
  buildEffectivePriceWhere,
  getEffectivePriceSortDirection,
  orderProductsById,
  selectEffectivePricePage,
} from '@/backend/catalog/product-price-filter'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { parseSearchParams, type RawSearchParams } from '@/backend/catalog/search-params'
import { generateSearchMetadata } from '@/backend/seo'
import type { Metadata } from 'next'
import { Prisma } from '@prisma/client'

interface Props {
  searchParams: Promise<RawSearchParams>
}

const SEARCH_PRODUCT_IMAGE_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 26vw, 20vw'

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = parseSearchParams(await searchParams)
  return generateSearchMetadata(params.queryParams)
}

/**
 * Resolve a free-text query into a set of Prisma WHERE conditions.
 *
 * Strategy: pre-fetch category IDs whose names match any word
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

  // Build OR for category names: same approach
  const catNameOR = [
    { name: { contains: normalized, mode: 'insensitive' as const } },
    ...words.map((w) => ({ name: { contains: w, mode: 'insensitive' as const } })),
  ]

  const matchedCategories = await db.category.findMany({
    where: { isActive: true, OR: catNameOR },
    select: { id: true },
  })
  const categoryIds = matchedCategories.map((c) => c.id)

  // Build the final OR conditions for products
  // Relevance priority:
  //   1. Category match  (pre-fetched IDs, no false positives)
  //   2. Product name; full phrase, then individual words
  //   3. Tags; exact word match
  //   4. Short description and description; FULL PHRASE ONLY
  //      (individual-word description search is too noisy:
  //       a "USB-C phone charger" description would surface chargers for
  //       every "phone" or "laptop" search)
  const productOR: Prisma.ProductWhereInput[] = []

  if (categoryIds.length > 0) productOR.push({ categoryId: { in: categoryIds } })

  // Name; full phrase first, then each word
  productOR.push({ name: { contains: normalized, mode: 'insensitive' } })
  for (const w of words) {
    productOR.push({ name: { contains: w, mode: 'insensitive' } } satisfies Prisma.ProductWhereInput)
  }

  // Tags; exact word set match
  if (words.length > 0) productOR.push({ tags: { hasSome: words } })

  // Description fields; full phrase only, never individual words
  productOR.push({ shortDescription: { contains: normalized, mode: 'insensitive' } })
  productOR.push({ description: { contains: normalized, mode: 'insensitive' } })

  return { OR: productOR }
}

async function getSearchResults(rawParams: RawSearchParams) {
  const params = parseSearchParams(rawParams)
  const page = params.page
  const limit = 24
  const skip = (page - 1) * limit

  const andClauses: Prisma.ProductWhereInput[] = [getBuyerVisibleProductWhere()]

  // Text search; resolved to direct ID lookups
  if (params.q) {
    const textWhere = await resolveTextWhere(params.q)
    andClauses.push(textWhere)
  }

  // Hard filters applied as additional AND clauses
  if (params.category) andClauses.push({ category: { slug: params.category } })
  const effectivePriceWhere = buildEffectivePriceWhere(
    params.minPrice,
    params.maxPrice,
  )
  if (effectivePriceWhere) andClauses.push(effectivePriceWhere)
  if (params.inStock) andClauses.push({ stockQuantity: { gt: 0 } })
  if (params.rating !== null) andClauses.push({ rating: { gte: params.rating } })
  if (params.featured) andClauses.push({ isFeatured: true })

  const where: Prisma.ProductWhereInput = andClauses.length === 1 ? andClauses[0] : { AND: andClauses }
  const effectivePriceSort = getEffectivePriceSortDirection(params.sort)

  let orderBy: Prisma.ProductOrderByWithRelationInput = { soldCount: 'desc' }
  if (params.sort === 'newest') orderBy = { createdAt: 'desc' }
  else if (params.sort === 'rating') orderBy = { rating: 'desc' }

  const productInclude = {
    images: { where: { isPrimary: true }, take: 1 },
    category: { select: { name: true, slug: true } },
  } satisfies Prisma.ProductInclude

  const [products, total, categories] = await Promise.all([
    effectivePriceSort
      ? db.product.findMany({
          where,
          orderBy: { id: 'asc' },
          select: { id: true, basePrice: true, salePrice: true },
        }).then(async (items) => {
          const pageIds = selectEffectivePricePage(items, effectivePriceSort, skip, limit).map((item) => item.id)
          if (pageIds.length === 0) return []

          const pageProducts = await db.product.findMany({
            where: getBuyerVisibleProductWhere({ id: { in: pageIds } }),
            include: productInclude,
          })

          return orderProductsById(pageProducts, pageIds)
        })
      : db.product.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: productInclude,
        }),
    db.product.count({ where }),
    db.category.findMany({ where: { isActive: true }, select: { name: true, slug: true }, orderBy: { name: 'asc' } }),
  ])

  return { products, total, categories, page, totalPages: Math.ceil(total / limit), params }
}

export default async function SearchPage({ searchParams }: Props) {
  const rawParams = await searchParams
  const { products, total, categories, page, totalPages, params } = await getSearchResults(rawParams)

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
          <SearchFiltersPanel categories={categories} searchParams={params.queryParams} />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{total} results</p>
            <div className="flex items-center gap-2">
              <MobileSearchFilters categories={categories} searchParams={params.queryParams} />
              <span className="text-sm font-medium">Sort by:</span>
              <SortSelect current={params.sort} options={SORT_OPTIONS} />
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
                {products.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index === 0}
                    imageSizes={SEARCH_PRODUCT_IMAGE_SIZES}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <PaginationLink href={buildPageUrl(params.queryParams, page - 1)}>Prev</PaginationLink>
                  )}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i))
                    return (
                      <PaginationLink key={p} href={buildPageUrl(params.queryParams, p)} active={p === page}>
                        {p}
                      </PaginationLink>
                    )
                  })}
                  {page < totalPages && (
                    <PaginationLink href={buildPageUrl(params.queryParams, page + 1)}>Next</PaginationLink>
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
