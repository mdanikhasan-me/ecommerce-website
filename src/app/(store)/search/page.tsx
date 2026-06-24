import { db } from '@/backend/database'
import { unstable_cache } from 'next/cache'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { MobileSearchFilters } from '@/frontend/components/product/MobileSearchFilters'
import { SearchFiltersPanel } from '@/frontend/components/product/SearchFiltersPanel'
import { SortSelect } from '@/frontend/components/search/SortSelect'
import { getPaginationPages } from '@/frontend/components/search/pagination'
import {
  buildEffectivePriceOrderBy,
  buildEffectivePriceWhere,
  getEffectivePriceSortDirection,
} from '@/backend/catalog/product-price-filter'
import { productCardSelect } from '@/backend/catalog/product-card-select'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { parseSearchParams, type RawSearchParams } from '@/backend/catalog/search-params'
import { STOREFRONT_CACHE_TAGS } from '@/backend/catalog/storefront-revalidation'
import { generateSearchMetadata } from '@/backend/seo'
import type { Metadata } from 'next'
import { Prisma } from '@prisma/client'

interface Props {
  searchParams: Promise<RawSearchParams>
}

export const revalidate = 120

const SEARCH_PRODUCT_IMAGE_SIZES = '(max-width: 339px) 100vw, (max-width: 559px) 50vw, (max-width: 1279px) 33vw, (max-width: 1535px) 25vw, 20vw'

const getSearchFilterCategories = unstable_cache(
  async () => db.category.findMany({
    where: { isActive: true },
    select: { name: true, slug: true },
    orderBy: { name: 'asc' },
  }),
  ['search-filter-categories-v1'],
  { revalidate: 300, tags: [STOREFRONT_CACHE_TAGS.categories] },
)

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

function getSearchCacheKey(rawParams: RawSearchParams) {
  return JSON.stringify(parseSearchParams(rawParams).queryParams)
}

async function getUncachedSearchResults(rawParams: RawSearchParams) {
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
  if (params.bestSeller) andClauses.push({ isBestSeller: true })

  const where: Prisma.ProductWhereInput = andClauses.length === 1 ? andClauses[0] : { AND: andClauses }
  const effectivePriceSort = getEffectivePriceSortDirection(params.sort)
  const effectivePriceOrderBy = buildEffectivePriceOrderBy(effectivePriceSort)

  let orderBy: Prisma.ProductOrderByWithRelationInput = { soldCount: 'desc' }
  if (params.sort === 'newest') orderBy = { createdAt: 'desc' }
  else if (params.sort === 'rating') orderBy = { rating: 'desc' }

  const [products, total, categories] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: effectivePriceOrderBy ?? orderBy,
      skip,
      take: limit,
      select: productCardSelect,
    }),
    db.product.count({ where }),
    getSearchFilterCategories(),
  ])

  return { products, total, categories, page, totalPages: Math.ceil(total / limit), params }
}

const getCachedSearchResults = unstable_cache(
  async (cacheKey: string) => {
    const rawParams = JSON.parse(cacheKey) as RawSearchParams
    return getUncachedSearchResults(rawParams)
  },
  ['storefront-search-results-v1'],
  {
    revalidate: 120,
    tags: [STOREFRONT_CACHE_TAGS.products, STOREFRONT_CACHE_TAGS.categories],
  },
)

export default async function SearchPage({ searchParams }: Props) {
  const rawParams = await searchParams
  const { products, total, categories, page, totalPages, params } = await getCachedSearchResults(getSearchCacheKey(rawParams))
  const listingTitle = params.bestSeller ? 'Best Sellers' : params.featured ? 'Featured Products' : 'All Products'

  const SORT_OPTIONS = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ]

  return (
    <div className="container-site py-5 sm:py-7 lg:py-8">
      <div className="mb-4 max-w-[48rem] sm:mb-5">
        {params.q ? (
          <h1 className="font-display text-[1.68rem] font-bold leading-[1.08] sm:text-3xl sm:leading-tight">
            <span className="inline-flex flex-wrap items-baseline gap-x-2">
              <span>Results for</span>
              <span className="text-primary">&quot;{params.q}&quot;</span>
            </span>
          </h1>
        ) : (
          <h1 className="font-display text-[1.68rem] font-bold leading-[1.08] sm:text-3xl sm:leading-tight">
            <span>{listingTitle}</span>
          </h1>
        )}
      </div>

      <div className="flex gap-6 xl:gap-8">
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <SearchFiltersPanel categories={categories} searchParams={params.queryParams} />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="mb-4 flex w-full flex-wrap items-center gap-1.5 sm:mb-6 sm:justify-end sm:gap-2">
            <MobileSearchFilters
              categories={categories}
              searchParams={params.queryParams}
            />
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-xs font-medium min-[380px]:inline sm:text-sm">Sort:</span>
              <SortSelect current={params.sort} options={SORT_OPTIONS} />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border bg-card px-5 py-14 text-center shadow-[0_16px_36px_rgba(23,18,15,0.05)] sm:px-8 sm:py-16">
              <p className="section-kicker">No results</p>
              <h2 className="mt-3 font-display text-xl font-semibold">No products found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Try a different search term or remove some filters.</p>
            </div>
          ) : (
            <>
              <div className="product-list-grid">
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
                  {getPaginationPages(page, totalPages).map((p) => (
                    <PaginationLink key={p} href={buildPageUrl(params.queryParams, p)} active={p === page}>
                      {p}
                    </PaginationLink>
                  ))}
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
        active ? 'bg-primary text-white' : 'border border-border min-[1025px]:hover:bg-secondary'
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
