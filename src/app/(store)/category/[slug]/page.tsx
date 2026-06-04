import Link from 'next/link'
import { notFound } from 'next/navigation'
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
import { parseCategorySearchParams, type RawSearchParams } from '@/backend/catalog/search-params'
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

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
]
const CATEGORY_PRODUCT_IMAGE_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 26vw, 20vw'

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const rawSearchParams = (await searchParams) ?? {}
  const category = await db.category.findUnique({
    where: { slug, isActive: true },
    select: { id: true, name: true, slug: true, description: true },
  })
  if (!category) return { title: 'Category Not Found', robots: { index: false, follow: false } }

  const productCount = await db.product.count({
    where: getBuyerVisibleProductWhere({ categoryId: category.id }),
  })

  return generateCategoryMetadata({
    name: category.name,
    slug: category.slug,
    description: category.description,
    productCount,
    indexable: !hasFacetedCategoryParams(rawSearchParams),
  })
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const resolvedSearchParams = parseCategorySearchParams((await searchParams) ?? {})
  const category = await db.category.findUnique({
    where: { slug, isActive: true },
    include: { children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
  })

  if (!category) notFound()

  const page = resolvedSearchParams.page
  const limit = 24
  const skip = (page - 1) * limit

  const selectedChild = resolvedSearchParams.category
    ? category.children.find((child) => child.slug === resolvedSearchParams.category)
    : null

  // Include all direct child categories unless a child category filter is selected.
  const categoryIds = selectedChild ? [selectedChild.id] : [category.id, ...category.children.map((c) => c.id)]

  const andClauses: Prisma.ProductWhereInput[] = [
    getBuyerVisibleProductWhere({ categoryId: { in: categoryIds } }),
  ]
  const minPrice = resolvedSearchParams.minPrice
  const maxPrice = resolvedSearchParams.maxPrice
  const rating = resolvedSearchParams.rating
  const effectivePriceWhere = buildEffectivePriceWhere(minPrice, maxPrice)

  if (effectivePriceWhere) andClauses.push(effectivePriceWhere)
  if (resolvedSearchParams.inStock) andClauses.push({ stockQuantity: { gt: 0 } })
  if (rating !== null) andClauses.push({ rating: { gte: rating } })
  const where: Prisma.ProductWhereInput = andClauses.length === 1 ? andClauses[0] : { AND: andClauses }
  const effectivePriceSort = getEffectivePriceSortDirection(resolvedSearchParams.sort)

  let orderBy: Prisma.ProductOrderByWithRelationInput = { soldCount: 'desc' }
  if (resolvedSearchParams.sort === 'newest') orderBy = { createdAt: 'desc' }
  else if (resolvedSearchParams.sort === 'rating') orderBy = { rating: 'desc' }

  const productInclude = {
    images: { where: { isPrimary: true }, take: 1 },
    category: { select: { name: true, slug: true } },
  } satisfies Prisma.ProductInclude

  const [products, total] = effectivePriceSort
    ? await Promise.all([
        db.product.findMany({
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
        }),
        db.product.count({ where }),
      ])
    : await Promise.all([
        db.product.findMany({
          where, orderBy, skip, take: limit,
          include: productInclude,
        }),
        db.product.count({ where }),
      ])

  const totalPages = Math.ceil(total / limit)
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

      <div className="mb-4 flex flex-col gap-2.5 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-[48rem]">
          <h1 className="font-display text-[1.85rem] font-bold leading-tight sm:text-3xl">{category.name}</h1>
          {category.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{category.description}</p>}
        </div>
        <span className="w-fit shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground sm:px-3 sm:py-1.5 sm:text-sm">
          {total} products
        </span>
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
              className="snap-start flex-shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium transition-colors hover:border-primary hover:text-primary sm:px-4 sm:py-2 sm:text-sm"
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
          <div className="mb-4 flex flex-col gap-2 rounded-[1rem] border border-border/80 bg-card/95 p-2.5 shadow-[0_10px_24px_rgba(23,18,15,0.035)] sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-3.5">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">{total} results</p>
            <div className="flex w-full flex-wrap items-center gap-1.5 sm:w-auto sm:justify-end sm:gap-2">
              <MobileSearchFilters
                categories={filterCategories}
                searchParams={resolvedSearchParams.queryParams}
                basePath={categoryPath}
                preserveOnClear={[]}
                label="Category"
              />
              <span className="ml-auto text-xs font-medium sm:ml-0 sm:text-sm">Sort:</span>
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
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3.5 md:grid-cols-3 lg:gap-4 xl:grid-cols-4">
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={buildPageUrl(categoryPath, resolvedSearchParams.queryParams, p)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-primary text-white' : 'border border-border hover:bg-secondary'}`}
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
