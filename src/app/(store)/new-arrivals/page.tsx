import { db } from '@/backend/database'
import { unstable_cache } from 'next/cache'
import { productCardSelect } from '@/backend/catalog/product-card-select'
import {
  buildEffectivePriceOrderBy,
  buildEffectivePriceWhere,
  getEffectivePriceSortDirection,
} from '@/backend/catalog/product-price-filter'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { parseSearchParams, type RawSearchParams, type SearchSort } from '@/backend/catalog/search-params'
import { STOREFRONT_CACHE_TAGS } from '@/backend/catalog/storefront-revalidation'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { logSecurityEvent } from '@/backend/security/security-log'
import { MobileSearchFilters } from '@/frontend/components/product/MobileSearchFilters'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { SearchFiltersPanel } from '@/frontend/components/product/SearchFiltersPanel'
import { SortSelect } from '@/frontend/components/search/SortSelect'
import { getPaginationPages } from '@/frontend/components/search/pagination'
import type { Metadata } from 'next'
import { Prisma } from '@prisma/client'

interface Props {
  searchParams?: Promise<RawSearchParams>
}

export const metadata: Metadata = generatePageMetadata(
  'Boilabin New Arrivals',
  'Explore the newest products added to Boilabin, with clear prices and delivery across Bangladesh.',
  '/new-arrivals',
)
export const revalidate = 300
const NEW_ARRIVAL_IMAGE_SIZES = '(max-width: 339px) 100vw, (max-width: 559px) 50vw, (max-width: 1279px) 33vw, (max-width: 1535px) 25vw, 20vw'
const NEW_ARRIVALS_BASE_PATH = '/new-arrivals'
const NEW_ARRIVALS_LIMIT = 24
const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
]

const getNewArrivalFilterCategories = unstable_cache(
  async () => db.category.findMany({
    where: { isActive: true },
    select: { name: true, slug: true },
    orderBy: { name: 'asc' },
  }),
  ['new-arrival-filter-categories-v1'],
  { revalidate: 300, tags: [STOREFRONT_CACHE_TAGS.categories] },
)

function hasExplicitSort(rawParams: RawSearchParams) {
  const rawSort = rawParams.sort
  return Array.isArray(rawSort) ? Boolean(rawSort[0]) : Boolean(rawSort)
}

function getNewArrivalsCacheKey(rawParams: RawSearchParams) {
  const parsedParams = parseSearchParams(rawParams)

  return JSON.stringify({
    queryParams: parsedParams.queryParams,
    sort: hasExplicitSort(rawParams) ? parsedParams.sort : 'newest',
  })
}

const getNewArrivalPageData = unstable_cache(async (cacheKey: string) => {
  const cachedParams = JSON.parse(cacheKey) as {
    queryParams: Record<string, string | undefined>
    sort: SearchSort
  }
  const parsedParams = parseSearchParams(cachedParams.queryParams)
  const sort = cachedParams.sort
  const queryParams = parsedParams.queryParams
  const page = parsedParams.page
  const skip = (page - 1) * NEW_ARRIVALS_LIMIT
  const andClauses: Prisma.ProductWhereInput[] = [getBuyerVisibleProductWhere({ isNew: true })]
  const effectivePriceWhere = buildEffectivePriceWhere(parsedParams.minPrice, parsedParams.maxPrice)

  if (parsedParams.category) andClauses.push({ category: { slug: parsedParams.category } })
  if (effectivePriceWhere) andClauses.push(effectivePriceWhere)
  if (parsedParams.inStock) andClauses.push({ stockQuantity: { gt: 0 } })
  if (parsedParams.rating !== null) andClauses.push({ rating: { gte: parsedParams.rating } })

  const where: Prisma.ProductWhereInput = andClauses.length === 1 ? andClauses[0] : { AND: andClauses }
  const effectivePriceSort = getEffectivePriceSortDirection(sort)
  const effectivePriceOrderBy = buildEffectivePriceOrderBy(effectivePriceSort)
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
  if (sort === 'popular') orderBy = { soldCount: 'desc' }
  else if (sort === 'rating') orderBy = { rating: 'desc' }

  return Promise.all([
    db.product.findMany({
      where,
      orderBy: effectivePriceOrderBy ?? orderBy,
      skip,
      take: NEW_ARRIVALS_LIMIT,
      select: productCardSelect,
    }),
    db.product.count({ where }),
    getNewArrivalFilterCategories(),
  ]).then(([products, total, categories]) => ({
    products,
    total,
    categories,
    page,
    sort,
    totalPages: Math.ceil(total / NEW_ARRIVALS_LIMIT),
    queryParams,
  })).catch(() => {
    logSecurityEvent({
      type: 'server_page_data_load_failed',
      severity: 'error',
      route: '/new-arrivals',
      statusCode: 200,
      errorCode: 'new_arrivals_page_data_load_failed',
      metadata: {
        feature: 'new_arrivals',
        fallback: 'empty_products',
      },
    })
    return {
      products: [],
      total: 0,
      categories: [],
      page: 1,
      sort: 'newest' as SearchSort,
      totalPages: 0,
      queryParams: {},
    }
  })
}, ['storefront-new-arrivals-v2'], {
    revalidate: 300,
    tags: [STOREFRONT_CACHE_TAGS.products, STOREFRONT_CACHE_TAGS.categories],
  })

export default async function NewArrivalsPage({ searchParams }: Props) {
  const rawSearchParams = (await searchParams) ?? {}
  const { products, categories, page, sort, totalPages, queryParams } = await getNewArrivalPageData(getNewArrivalsCacheKey(rawSearchParams))
  const pageJsonLd = generateWebPageJsonLd({
    type: 'CollectionPage',
    name: 'Boilabin New Arrivals',
    description: 'Explore the newest products added to Boilabin, with clear prices and delivery across Bangladesh.',
    path: '/new-arrivals',
  })
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'New Arrivals', url: '/new-arrivals' },
  ])
  const itemListJsonLd = generateItemListJsonLd(
    'Boilabin new arrivals',
    products.map((product, index) => ({
      name: product.name,
      slug: product.slug,
      basePrice: product.basePrice,
      salePrice: product.salePrice,
      image: product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url,
      position: index + 1,
    })),
  )

  return (
    <div className="container-site py-5 sm:py-7 lg:py-8">
      <JsonLd data={[pageJsonLd, breadcrumbJsonLd, itemListJsonLd]} />
      <div className="mb-4 max-w-[48rem] sm:mb-5">
        <h1 className="font-display text-[1.68rem] font-bold leading-[1.08] sm:text-3xl sm:leading-tight">New Arrivals</h1>
      </div>

      <div className="flex gap-6 xl:gap-8">
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <SearchFiltersPanel
            categories={categories}
            searchParams={queryParams}
            basePath={NEW_ARRIVALS_BASE_PATH}
            preserveOnClear={[]}
          />
        </aside>

        <div className="product-list-scope flex-1 min-w-0">
          <div className="mb-4 flex w-full flex-wrap items-center gap-1.5 sm:mb-6 sm:justify-end sm:gap-2">
            <MobileSearchFilters
              categories={categories}
              searchParams={queryParams}
              basePath={NEW_ARRIVALS_BASE_PATH}
              preserveOnClear={[]}
              label="New arrivals"
            />
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-xs font-medium min-[380px]:inline sm:text-sm">Sort:</span>
              <SortSelect current={sort} options={SORT_OPTIONS} />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-5 py-14 text-center sm:px-8 sm:py-16">
              <h2 className="font-display text-xl font-semibold">No new arrivals found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="product-list-grid">
                {products.map((p, index) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    priority={index === 0}
                    imageSizes={NEW_ARRIVAL_IMAGE_SIZES}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {getPaginationPages(page, totalPages).map((p) => (
                    <a
                      key={p}
                      href={buildPageUrl(queryParams, p)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium sm:transition-colors ${p === page ? 'bg-primary text-white' : 'border border-border min-[1025px]:hover:bg-secondary'}`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function buildPageUrl(params: Record<string, string | undefined>, page: number): string {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value)
  }
  sp.set('page', String(page))
  return `${NEW_ARRIVALS_BASE_PATH}?${sp.toString()}`
}
