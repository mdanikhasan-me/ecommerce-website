import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { generatePageMetadata } from '@/backend/seo'
import { db } from '@/backend/database'
import { getCategoryConfig } from '@/frontend/components/category/category-config'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { ariaCurrentPage } from '@/frontend/components/ui/aria'
import { getSubcategoryMediaPath } from '@/shared/category-media'
import type { StorefrontIconName } from '@/shared/storefront-icons'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Categories',
  'Browse Boilabin shopping categories and subcategories for products available across Bangladesh.',
  '/category',
)

export const revalidate = 300

type CategoriesPageProps = {
  searchParams?: Promise<{ department?: string }>
}

async function getCategories() {
  return db.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
}

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

function getCategoryIconName(slug: string): StorefrontIconName {
  return CATEGORY_ICON_NAMES[slug as keyof typeof CATEGORY_ICON_NAMES] ?? 'category-view-all'
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const [categories, resolvedSearchParams] = await Promise.all([
    getCategories(),
    searchParams ?? Promise.resolve({} as { department?: string }),
  ])
  const selectedCategory =
    categories.find((category) => category.slug === resolvedSearchParams.department) ??
    categories.find((category) => category.slug === 'electronics') ??
    categories[0] ??
    null

  return (
    <div className="min-h-screen">
      <div className="container-site py-5 sm:py-7 lg:py-8">
        <header className="mb-4 max-w-[48rem] sm:mb-6">
          <h1 className="font-display text-[1.85rem] font-semibold leading-tight text-foreground sm:text-3xl lg:text-[2.25rem]">
            All Categories
          </h1>
          <p className="mt-2 max-w-[40rem] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Browse departments and subcategories, then explore our latest products.
          </p>
        </header>

        {selectedCategory ? (
          <>
            <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] xl:gap-8">
              <CategoryRail categories={categories} selectedSlug={selectedCategory.slug} />
              <CategoryDetailPanel category={selectedCategory} />
            </div>

            <div className="lg:hidden">
              <MobileCategoryAccordion categories={categories} selectedSlug={selectedCategory.slug} />
            </div>
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
              className={`group relative flex min-h-[54px] items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                isSelected ? 'bg-secondary/75 text-foreground' : 'text-foreground/88 hover:bg-secondary/45'
              }`}
            >
              {isSelected && <span className="absolute left-0 top-3 h-7 w-0.5 rounded-r-full bg-primary/70" />}
              <LocalIcon name={iconName} className="h-5 w-5 shrink-0 text-foreground/88" />
              <span className="min-w-0 flex-1 text-sm font-medium leading-5">{category.name}</span>
              <LocalIcon name="chevron-right" className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

function CategoryDetailPanel({ category }: { category: CategoryItem }) {
  const config = getCategoryConfig(category.slug)
  const iconName = getCategoryIconName(category.slug)
  const summary = category.description?.trim() || config.summary

  return (
    <section
      aria-labelledby={`category-panel-${category.slug}`}
      className="rounded-[1.35rem] border border-border/80 bg-card p-5 shadow-[0_12px_30px_rgba(23,18,15,0.045)] sm:p-6"
    >
      <div className="flex items-center gap-4 border-b border-border/70 pb-5">
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/75 text-foreground">
          <LocalIcon name={iconName} className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <h2 id={`category-panel-${category.slug}`} className="font-display text-[1.55rem] font-semibold leading-tight text-foreground sm:text-[1.85rem]">
            {category.name}
          </h2>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">{summary}</p>
        </div>
      </div>

      {category.children.length > 0 && (
        <div className="pt-5">
          <h3 className="text-sm font-semibold text-foreground">Shop by subcategory</h3>
          <div className="mt-3.5 grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
            {category.children.map((child) => (
              <SubcategoryCard key={child.id} category={category} child={child} />
            ))}
          </div>
        </div>
      )}

      <ViewAllCategoryLink category={category} />
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
  const imageSrc = getSubcategoryMediaPath(child)

  return (
    <Link
      href={`/category/${child.slug}`}
      className="product-card group flex h-full flex-col overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={child.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
            sizes="(max-width: 1024px) 42vw, (max-width: 1280px) 24vw, 260px"
            quality={84}
          />
        ) : (
          <EmptyMediaSurface />
        )}
      </div>
      <div className="flex min-h-[104px] flex-1 items-start gap-3 p-3.5 sm:p-4">
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-2 text-[15px] font-semibold leading-5 text-foreground transition-colors group-hover:text-primary">
            {child.name}
          </h4>
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-muted-foreground sm:text-[13px]">
            {child.description?.trim() || `Explore ${child.name} in ${category.name}.`}
          </p>
        </div>
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-transform group-hover:translate-x-0.5">
          <LocalIcon name="arrow-right" className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function EmptyMediaSurface() {
  return (
    <div
      aria-hidden="true"
      data-empty-media-surface="true"
      className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--muted))_0%,hsl(var(--card))_48%,hsl(var(--secondary))_100%)]"
    >
      <span className="absolute inset-3 rounded-[0.9rem] border border-border/65 bg-card/35 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset]" />
    </div>
  )
}

function ViewAllCategoryLink({ category }: { category: CategoryItem }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group mt-5 flex min-h-[72px] items-center gap-3 rounded-[1.05rem] border border-border/80 bg-card/90 px-4 py-3.5 transition-colors hover:border-primary/20 hover:bg-secondary/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-5"
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
        <LocalIcon name="category-view-all" className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-5 text-foreground">View All {category.name}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground sm:text-sm">
          Explore all {category.name.toLowerCase()} products and accessories.
        </span>
      </span>
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-transform group-hover:translate-x-0.5">
        <LocalIcon name="arrow-right" className="h-4 w-4" />
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
        const config = getCategoryConfig(category.slug)
        const iconName = getCategoryIconName(category.slug)
        const summary = category.description?.trim() || config.summary
        const isOpen = category.slug === selectedSlug

        return (
          <details key={category.id} className="group border-b border-black/10 last:border-b-0" open={isOpen}>
            <summary className="cursor-pointer list-none marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring">
              <div className="flex min-h-[68px] items-center gap-3 px-4 py-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/75 text-foreground">
                  <LocalIcon name={iconName} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold leading-6 text-foreground">{category.name}</span>
                  {isOpen && (
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{summary}</span>
                  )}
                </span>
                <LocalIcon name="chevron-down" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </div>
            </summary>

            <div className="space-y-2 px-4 pb-4">
              {category.children.map((child) => (
                <MobileSubcategoryRow key={child.id} category={category} child={child} />
              ))}
              <ViewAllCategoryLink category={category} />
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
  const imageSrc = getSubcategoryMediaPath(child)

  return (
    <Link
      href={`/category/${child.slug}`}
      className="product-card group flex min-h-[104px] items-stretch gap-3 p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="relative block min-h-[104px] w-[96px] shrink-0 overflow-hidden rounded-l-[1.05rem] bg-muted min-[390px]:w-[104px] sm:w-[112px]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={child.name}
            fill
            className="object-cover"
            sizes="150px"
            quality={82}
          />
        ) : (
          <EmptyMediaSurface />
        )}
      </span>
      <span className="min-w-0 flex-1 self-center py-3 pr-1">
        <span className="block line-clamp-2 text-[15px] font-semibold leading-5 text-foreground transition-colors group-hover:text-primary">{child.name}</span>
        <span className="mt-1 block line-clamp-2 text-[12px] leading-5 text-muted-foreground sm:text-sm">
          {child.description?.trim() || `Explore ${child.name} in ${category.name}.`}
        </span>
      </span>
      <span className="mr-3 self-center inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-transform group-hover:translate-x-0.5">
        <LocalIcon name="arrow-right" className="h-4 w-4" />
      </span>
    </Link>
  )
}
