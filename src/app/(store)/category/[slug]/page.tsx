import Link from 'next/link'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { db } from '@/backend/database'
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
import { parseCategorySearchParams, type RawSearchParams } from '@/backend/catalog/search-params'
import { STOREFRONT_CACHE_TAGS } from '@/backend/catalog/storefront-revalidation'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generateCategoryMetadata,
  generateItemListJsonLd,
  hasFacetedCategoryParams,
} from '@/backend/seo'
import type { Metadata } from 'next'
import { Prisma } from '@prisma/client'

interface Props {
  params: Promise<{ slug: string }>
  searchParams?: Promise<RawSearchParams>
}

export const revalidate = 300

export async function generateStaticParams() {
  return []
}

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
]
const CATEGORY_PRODUCT_IMAGE_SIZES = '(max-width: 699px) 50vw, (max-width: 1499px) 33vw, 25vw'

const getCategoryMetadataData = unstable_cache(
  async (slug: string) => {
    const category = await db.category.findUnique({
      where: { slug, isActive: true },
      select: { id: true, name: true, slug: true, description: true },
    })
    if (!category) return null

    const productCount = await db.product.count({
      where: getBuyerVisibleProductWhere({ categoryId: category.id }),
    })

    return { category, productCount }
  },
  ['storefront-category-metadata-v1'],
  {
    revalidate: 300,
    tags: [STOREFRONT_CACHE_TAGS.categories, STOREFRONT_CACHE_TAGS.products],
  },
)

function getCategorySearchCacheKey(rawSearchParams: RawSearchParams) {
  return JSON.stringify(parseCategorySearchParams(rawSearchParams).queryParams)
}

const getCategoryPageData = unstable_cache(
  async (slug: string, normalizedSearchParams: string) => {
    const resolvedSearchParams = parseCategorySearchParams(JSON.parse(normalizedSearchParams) as RawSearchParams)
    const category = await db.category.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, slug: true },
        },
      },
    })

    if (!category) return null

    const page = resolvedSearchParams.page
    const limit = 24
    const skip = (page - 1) * limit
    const selectedChild = resolvedSearchParams.category
      ? category.children.find((child) => child.slug === resolvedSearchParams.category)
      : null
    const categoryIds = selectedChild ? [selectedChild.id] : [category.id, ...category.children.map((c) => c.id)]
    const andClauses: Prisma.ProductWhereInput[] = [
      getBuyerVisibleProductWhere({ categoryId: { in: categoryIds } }),
    ]
    const effectivePriceWhere = buildEffectivePriceWhere(
      resolvedSearchParams.minPrice,
      resolvedSearchParams.maxPrice,
    )

    if (effectivePriceWhere) andClauses.push(effectivePriceWhere)
    if (resolvedSearchParams.inStock) andClauses.push({ stockQuantity: { gt: 0 } })
    if (resolvedSearchParams.rating !== null) andClauses.push({ rating: { gte: resolvedSearchParams.rating } })

    const where: Prisma.ProductWhereInput = andClauses.length === 1 ? andClauses[0] : { AND: andClauses }
    const effectivePriceSort = getEffectivePriceSortDirection(resolvedSearchParams.sort)
    const effectivePriceOrderBy = buildEffectivePriceOrderBy(effectivePriceSort)
    let orderBy: Prisma.ProductOrderByWithRelationInput = { soldCount: 'desc' }
    if (resolvedSearchParams.sort === 'newest') orderBy = { createdAt: 'desc' }
    else if (resolvedSearchParams.sort === 'rating') orderBy = { rating: 'desc' }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: effectivePriceOrderBy ?? orderBy,
        skip,
        take: limit,
        select: productCardSelect,
      }),
      db.product.count({ where }),
    ])

    return {
      category,
      products,
      resolvedSearchParams,
      skip,
      totalPages: Math.ceil(total / limit),
    }
  },
  ['storefront-category-page-data-v1'],
  {
    revalidate: 300,
    tags: [STOREFRONT_CACHE_TAGS.categories, STOREFRONT_CACHE_TAGS.products],
  },
)

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const rawSearchParams = (await searchParams) ?? {}
  const data = await getCategoryMetadataData(slug)
  if (!data) return { title: 'Category Not Found', robots: { index: false, follow: false } }

  return generateCategoryMetadata({
    name: data.category.name,
    slug: data.category.slug,
    description: data.category.description,
    productCount: data.productCount,
    indexable: !hasFacetedCategoryParams(rawSearchParams),
  })
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const rawSearchParams = (await searchParams) ?? {}
  const data = await getCategoryPageData(slug, getCategorySearchCacheKey(rawSearchParams))
  if (!data) notFound()

  const { category, products, resolvedSearchParams, skip, totalPages } = data
  const page = resolvedSearchParams.page
  const filterCategories = category.children.map((child) => ({ name: child.name, slug: child.slug }))
  const categoryPath = `/category/${slug}`
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/category' },
    { name: category.name, url: categoryPath },
  ])
  const itemListJsonLd = generateItemListJsonLd(
    `${category.name} products`,
    products.map((product, index) => ({
      name: product.name,
      slug: product.slug,
      basePrice: product.basePrice,
      salePrice: product.salePrice,
      image: product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url,
      position: skip + index + 1,
    })),
  )

  return (
    <div className="container-site py-5 sm:py-7 lg:py-8">
      <JsonLd data={[breadcrumbJsonLd, itemListJsonLd]} />
      {/* Breadcrumb */}
      <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
        <Link href="/">Home</Link>
        <span>/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      <div className="mb-4 max-w-[48rem] sm:mb-5">
        <h1 className="font-display text-[1.85rem] font-bold leading-tight sm:text-3xl">{category.name}</h1>
        {category.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{category.description}</p>}
      </div>

      {/* Sub-categories */}
      {category.children.length > 0 && (
        <div className="mb-4 flex snap-x gap-1.5 overflow-x-auto pb-1.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:mb-6 sm:gap-2 sm:pb-2 [&::-webkit-scrollbar]:hidden">
          <a
            href={`/category/${slug}`}
            className="snap-start flex-shrink-0 rounded-full bg-primary px-3 py-1.5 text-[13px] font-medium text-white sm:px-4 sm:py-2 sm:text-sm"
          >
            All
          </a>
          {category.children.map((sub) => (
            <a
              key={sub.slug}
              href={`/category/${sub.slug}`}
              className="snap-start flex-shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium sm:transition-colors min-[1025px]:hover:border-primary min-[1025px]:hover:text-primary sm:px-4 sm:py-2 sm:text-sm"
            >
              {sub.name}
            </a>
          ))}
        </div>
      )}

      <div className="flex gap-6 xl:gap-8">
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <SearchFiltersPanel
            categories={filterCategories}
            searchParams={resolvedSearchParams.queryParams}
            basePath={categoryPath}
            preserveOnClear={[]}
          />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="mb-4 flex w-full flex-wrap items-center gap-1.5 sm:mb-6 sm:justify-end sm:gap-2">
            <MobileSearchFilters
              categories={filterCategories}
              searchParams={resolvedSearchParams.queryParams}
              basePath={categoryPath}
              preserveOnClear={[]}
              label="Category"
            />
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-xs font-medium min-[380px]:inline sm:text-sm">Sort:</span>
              <SortSelect current={resolvedSearchParams.sort} options={SORT_OPTIONS} />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[1.5rem] border border-border bg-card px-5 py-14 text-center shadow-[0_16px_36px_rgba(23,18,15,0.05)] sm:px-8 sm:py-16">
              <p className="section-kicker">Empty shelf</p>
              <h2 className="mt-3 font-display text-xl font-semibold">No products found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-4 gap-y-7 min-[700px]:grid-cols-[repeat(3,minmax(0,1fr))] min-[700px]:gap-x-5 min-[700px]:gap-y-8 lg:grid-cols-[repeat(3,minmax(0,1fr))] lg:gap-x-6 lg:gap-y-9 min-[1500px]:grid-cols-[repeat(4,minmax(0,1fr))] min-[1500px]:gap-x-8 min-[1500px]:gap-y-10">
                {products.map((p, index) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    priority={index === 0}
                    imageSizes={CATEGORY_PRODUCT_IMAGE_SIZES}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {getPaginationPages(page, totalPages).map((p) => (
                    <a
                      key={p}
                      href={buildPageUrl(categoryPath, resolvedSearchParams.queryParams, p)}
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

function buildPageUrl(basePath: string, params: Record<string, string | undefined>, page: number): string {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value)
  }
  sp.set('page', String(page))
  return `${basePath}?${sp.toString()}`
}
