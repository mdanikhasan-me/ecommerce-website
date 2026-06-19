import Link from 'next/link'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generateCategoryListJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { db } from '@/backend/database'
import { productCardSelect } from '@/backend/catalog/product-card-select'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { STOREFRONT_CACHE_TAGS } from '@/backend/catalog/storefront-revalidation'
import { ProductGrid } from '@/frontend/components/home/ProductGrid'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { ariaCurrentPage } from '@/frontend/components/ui/aria'
import { NAV_CATEGORIES, getViewAllCategoryLabel } from '@/frontend/components/layout/header-navigation-data'
import { getSubcategoryIconPath } from '@/shared/category-media'
import type { StorefrontIconName } from '@/shared/storefront-icons'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Categories',
  'Browse Boilabin shopping categories and subcategories for products available across Bangladesh.',
  '/category',
)

export const revalidate = 300

const ALL_PRODUCTS_LIMIT = 24

type CategoriesPageProps = {
  searchParams?: Promise<{ department?: string }>
}

const getCategories = unstable_cache(
  async () => db.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  }),
  ['category-index-tree-v1'],
  { revalidate: 300, tags: [STOREFRONT_CACHE_TAGS.categories] },
)

const getAllProductsPreview = unstable_cache(async () => {
  const [products, total] = await Promise.all([
    db.product.findMany({
      where: getBuyerVisibleProductWhere(),
      orderBy: { soldCount: 'desc' },
      take: ALL_PRODUCTS_LIMIT,
      select: productCardSelect,
    }),
    db.product.count({ where: getBuyerVisibleProductWhere() }),
  ])

  return { products, total }
}, ['category-index-products-preview-v1'], {
  revalidate: 300,
  tags: [STOREFRONT_CACHE_TAGS.products, STOREFRONT_CACHE_TAGS.categories],
})

type CategoryItem = Awaited<ReturnType<typeof getCategories>>[number]
type SubcategoryItem = CategoryItem['children'][number]

const CATEGORY_ICON_NAMES = {
  electronics: 'category-electronics',
  fashion: 'category-fashion',
  'home-appliances': 'category-home-appliances',
  'beauty-health': 'category-beauty-health',
  'sports-fitness': 'category-sports-fitness',
  'books-stationery': 'category-books-stationery',
  gaming: 'category-gaming',
  'toys-collectibles': 'category-toys-collectibles',
  'baby-kids': 'category-toys-collectibles',
} as const satisfies Record<string, StorefrontIconName>

const SUBCATEGORY_ICON_NAMES = Object.fromEntries(
  NAV_CATEGORIES.flatMap((category) => category.sub.map((sub) => [sub.slug, sub.icon])),
) as Partial<Record<string, StorefrontIconName>>

function getCategoryIconName(slug: string): StorefrontIconName {
  return CATEGORY_ICON_NAMES[slug as keyof typeof CATEGORY_ICON_NAMES] ?? 'category-view-all'
}

function getSubcategoryIconName(categorySlug: string, childSlug: string): StorefrontIconName {
  return SUBCATEGORY_ICON_NAMES[childSlug] ?? getCategoryIconName(categorySlug)
}

// Renders an admin-uploaded subcategory SVG icon when present, else the built-in icon.
function SubcategoryGlyph({
  svgIcon,
  fallbackIcon,
  alt,
  className,
}: {
  svgIcon: string | null
  fallbackIcon: StorefrontIconName
  alt: string
  className: string
}) {
  if (svgIcon) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={svgIcon} alt={alt} className={className} loading="lazy" decoding="async" />
  }
  return <LocalIcon name={fallbackIcon} className={className} />
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const [categories, allProductsPreview, resolvedSearchParams] = await Promise.all([
    getCategories(),
    getAllProductsPreview(),
    searchParams ?? Promise.resolve({} as { department?: string }),
  ])
  const selectedCategory =
    categories.find((category) => category.slug === resolvedSearchParams.department) ??
    categories.find((category) => category.slug === 'electronics') ??
    categories[0] ??
    null
  const pageDescription = 'Browse Boilabin shopping categories and subcategories for products available across Bangladesh.'
  const pageJsonLd = generateWebPageJsonLd({
    type: 'CollectionPage',
    name: 'Boilabin Categories',
    description: pageDescription,
    path: '/category',
  })
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/category' },
  ])
  const categoryListJsonLd = generateCategoryListJsonLd(
    'Boilabin shopping categories',
    categories.map((category, index) => ({
      name: category.name,
      slug: category.slug,
      description: category.description,
      position: index + 1,
    })),
  )

  return (
    <div className="min-h-screen">
      <JsonLd data={[pageJsonLd, breadcrumbJsonLd, categoryListJsonLd]} />
      <div className="container-site py-5 sm:py-7 lg:py-8">
        <header className="mb-4 max-w-[48rem] sm:mb-6">
          <h1 className="font-display text-[1.85rem] font-semibold leading-tight text-foreground sm:text-3xl lg:text-[2.25rem]">
            All Categories
          </h1>
        </header>

        {selectedCategory ? (
          <>
            <div className="hidden gap-5 lg:grid lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] xl:gap-6 2xl:gap-8">
              <CategoryRail categories={categories} selectedSlug={selectedCategory.slug} />
              <CategoryDetailPanel category={selectedCategory} />
            </div>

            <div className="lg:hidden">
              <MobileCategoryAccordion categories={categories} selectedSlug={selectedCategory.slug} />
            </div>

            {allProductsPreview.products.length > 0 && (
              <section className="mt-8 sm:mt-10 lg:mt-12">
                <ProductGrid
                  eyebrow="Catalog"
                  title="All Products"
                  subtitle={`Showing ${allProductsPreview.products.length} of ${allProductsPreview.total} public products.`}
                  products={allProductsPreview.products}
                  viewAllHref="/search"
                  gridClassName="sm:grid-cols-3 md:grid-cols-4 min-[1120px]:grid-cols-5 2xl:grid-cols-6"
                />
              </section>
            )}
          </>
        ) : (
          <div className="rounded-[1.25rem] border border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
            Categories are not available right now.
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryRail({
  categories,
  selectedSlug,
}: {
  categories: CategoryItem[]
  selectedSlug: string
}) {
  return (
    <aside className="rounded-[1.15rem] border border-border/80 bg-card p-2.5 shadow-[0_12px_30px_rgba(23,18,15,0.045)]">
      <nav aria-label="Category departments" className="space-y-1">
        {categories.map((category) => {
          const isSelected = category.slug === selectedSlug
          const iconName = getCategoryIconName(category.slug)

          return (
            <Link
              key={category.id}
              href={`/category?department=${category.slug}`}
              {...ariaCurrentPage(isSelected)}
              className={`group relative flex min-h-[54px] items-center gap-3 rounded-xl px-3 py-2 text-left sm:transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                isSelected ? 'bg-secondary/75 text-foreground' : 'text-foreground/88 md:hover:bg-secondary/45'
              }`}
            >
              {isSelected && <span className="absolute left-0 top-3 h-7 w-0.5 rounded-r-full bg-primary/70" />}
              <LocalIcon name={iconName} className="h-5 w-5 shrink-0 text-foreground/88" />
              <span className="min-w-0 flex-1 text-sm font-medium leading-5">{category.name}</span>
              <LocalIcon name="chevron-right" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

function CategoryDetailPanel({ category }: { category: CategoryItem }) {
  const iconName = getCategoryIconName(category.slug)

  return (
    <section
      aria-labelledby={`category-panel-${category.slug}`}
      className="flex flex-col rounded-[1.35rem] border border-border/80 bg-card p-4 shadow-[0_12px_30px_rgba(23,18,15,0.045)] sm:p-5 2xl:p-6"
    >
      <div className="flex items-center gap-4 border-b border-border/70 pb-5">
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/75 text-foreground">
          <LocalIcon name={iconName} className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <h2 id={`category-panel-${category.slug}`} className="font-display text-[1.55rem] font-semibold leading-tight text-foreground sm:text-[1.85rem]">
            {category.name}
          </h2>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center py-5">
        <div className="flex flex-wrap justify-center gap-4">
          {category.children.map((child) => (
            <SubcategoryCard key={child.id} category={category} child={child} />
          ))}
          <ViewAllCategoryTile category={category} />
        </div>
      </div>
    </section>
  )
}

function SubcategoryCard({
  category,
  child,
}: {
  category: CategoryItem
  child: SubcategoryItem
}) {
  const iconName = getSubcategoryIconName(category.slug, child.slug)
  const customSvgIcon = SUBCATEGORY_ICON_NAMES[child.slug] ? null : getSubcategoryIconPath(child)

  return (
    <Link
      href={`/category/${child.slug}`}
      className="group flex aspect-square w-[7.25rem] flex-col items-center justify-center gap-3 rounded-lg border border-black/10 bg-card px-3 py-4 text-center text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <SubcategoryGlyph svgIcon={customSvgIcon} fallbackIcon={iconName} alt={child.name} className="h-8 w-8 text-foreground" />
      <span className="line-clamp-2 text-[13px] font-normal leading-5 text-foreground md:font-medium md:transition-colors md:group-hover:text-primary">
        {child.name}
      </span>
    </Link>
  )
}

function ViewAllCategoryTile({ category }: { category: CategoryItem }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      aria-label={getViewAllCategoryLabel(category)}
      className="group flex aspect-square w-[7.25rem] flex-col items-center justify-center gap-3 rounded-lg border border-black/10 bg-card px-3 py-4 text-center text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <LocalIcon name="subcategory-grid" className="h-8 w-8 text-foreground" />
      <span className="line-clamp-2 text-[13px] font-normal leading-5 text-foreground md:font-medium md:transition-colors md:group-hover:text-primary">
        {getViewAllCategoryLabel(category)}
      </span>
    </Link>
  )
}

function MobileCategoryAccordion({
  categories,
  selectedSlug,
}: {
  categories: CategoryItem[]
  selectedSlug: string
}) {
  return (
    <section className="overflow-hidden rounded-[1.15rem] border border-border/80 bg-card shadow-[0_12px_30px_rgba(23,18,15,0.045)]">
      {categories.map((category) => {
        const iconName = getCategoryIconName(category.slug)
        const isOpen = category.slug === selectedSlug

        return (
          <details key={category.id} className="group border-b border-black/10 last:border-b-0" open={isOpen}>
            <summary className="cursor-pointer list-none marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring">
              <div className="flex min-h-[68px] items-center gap-3 px-4 py-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-foreground/88">
                  <LocalIcon name={iconName} className="h-[1.35rem] w-[1.35rem]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-normal leading-6 text-foreground">{category.name}</span>
                </span>
                <LocalIcon name="chevron-down" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </div>
            </summary>

            <div className="mx-auto flex max-w-[14.75rem] flex-wrap justify-center gap-3 pb-4 sm:max-w-none sm:px-4">
              {category.children.map((child) => (
                <MobileSubcategoryRow key={child.id} category={category} child={child} />
              ))}
              <ViewAllCategoryTile category={category} />
            </div>
          </details>
        )
      })}
    </section>
  )
}

function MobileSubcategoryRow({
  category,
  child,
}: {
  category: CategoryItem
  child: SubcategoryItem
}) {
  const iconName = getSubcategoryIconName(category.slug, child.slug)
  const customSvgIcon = SUBCATEGORY_ICON_NAMES[child.slug] ? null : getSubcategoryIconPath(child)

  return (
    <Link
      href={`/category/${child.slug}`}
      className="flex aspect-square w-[7rem] flex-col items-center justify-center gap-2.5 rounded-lg border border-black/10 bg-card px-2.5 py-3 text-center text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <SubcategoryGlyph svgIcon={customSvgIcon} fallbackIcon={iconName} alt={child.name} className="h-7 w-7 text-foreground" />
      <span className="line-clamp-2 text-[13px] font-normal leading-5 text-foreground">
        {child.name}
      </span>
    </Link>
  )
}
