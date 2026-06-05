import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { generatePageMetadata } from '@/backend/seo'
import { db } from '@/backend/database'
import { getCategoryConfig } from '@/frontend/components/category/category-config'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
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
    <div className="bg-[#fdfbf7]">
      <div className="container-site py-8 sm:py-10 lg:py-12">
        <header className="mb-7 max-w-[52rem] sm:mb-9 lg:mb-10">
          <h1 className="font-display text-[2.45rem] font-semibold leading-[0.98] tracking-normal text-[#070707] sm:text-[4rem] lg:text-[4.4rem]">
            All Categories
          </h1>
          <p className="mt-4 max-w-[42rem] text-base leading-7 text-[#4b5563] sm:text-xl sm:leading-8">
            Browse departments and subcategories, then explore our latest products.
          </p>
        </header>

        {selectedCategory ? (
          <>
            <div className="hidden gap-7 lg:grid lg:grid-cols-[minmax(260px,360px)_minmax(0,1fr)] xl:gap-9">
              <CategoryRail categories={categories} selectedSlug={selectedCategory.slug} />
              <CategoryDetailPanel category={selectedCategory} />
            </div>

            <div className="lg:hidden">
              <MobileCategoryAccordion categories={categories} selectedSlug={selectedCategory.slug} />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-black/10 bg-white px-5 py-12 text-center text-sm text-muted-foreground">
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
    <aside className="rounded-[18px] border border-black/10 bg-white p-4 shadow-[0_18px_42px_-38px_rgba(17,24,39,0.2)]">
      <nav aria-label="Category departments" className="space-y-0.5">
        {categories.map((category) => {
          const isSelected = category.slug === selectedSlug
          const iconName = getCategoryIconName(category.slug)

          return (
            <Link
              key={category.id}
              href={`/category?department=${category.slug}`}
              aria-current={isSelected ? 'page' : undefined}
              className={`group relative flex min-h-[70px] items-center gap-4 rounded-lg px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111827] ${
                isSelected ? 'bg-[#f5f1ec] text-[#080808]' : 'text-[#171717] hover:bg-[#faf8f5]'
              }`}
            >
              {isSelected && <span className="absolute -left-4 top-2.5 h-[50px] w-0.5 rounded-r-full bg-[#050505]" />}
              <LocalIcon name={iconName} className="h-7 w-7 shrink-0" />
              <span className="min-w-0 flex-1 text-[0.98rem] font-medium leading-5">{category.name}</span>
              <LocalIcon name="chevron-right" className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
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
      className="rounded-[18px] border border-black/10 bg-white px-8 py-7 shadow-[0_18px_42px_-38px_rgba(17,24,39,0.2)] xl:px-9"
    >
      <div className="flex items-center gap-6 border-b border-black/10 pb-6">
        <span className="inline-flex h-[96px] w-[96px] shrink-0 items-center justify-center rounded-full bg-[#f4f1ed] text-[#080808]">
          <LocalIcon name={iconName} className="h-11 w-11" />
        </span>
        <div className="min-w-0">
          <h2 id={`category-panel-${category.slug}`} className="font-display text-[2.15rem] font-semibold leading-tight tracking-normal text-[#080808]">
            {category.name}
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#4b5563]">{summary}</p>
        </div>
      </div>

      {category.children.length > 0 && (
        <div className="pt-7">
          <h3 className="text-[1.2rem] font-semibold tracking-normal text-[#090909]">Shop by subcategory</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
  const iconName = getCategoryIconName(category.slug)

  return (
    <Link
      href={`/category/${child.slug}`}
      className="group overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_14px_30px_-32px_rgba(17,24,39,0.18)] transition-colors hover:border-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111827]"
    >
      <div className="relative aspect-[1.42] bg-[#f4f1ed]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={child.name}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 25vw, 260px"
            quality={84}
          />
        ) : (
          <EmptyMediaPlaceholder iconName={iconName} label={child.name} />
        )}
      </div>
      <div className="flex min-h-[108px] items-start gap-4 p-4">
        <div className="min-w-0 flex-1">
          <h4 className="text-[1.03rem] font-semibold leading-6 text-[#090909]">{child.name}</h4>
          <p className="mt-1.5 text-[0.9rem] leading-6 text-[#4b5563]">
            {child.description?.trim() || `Explore ${child.name} in ${category.name}.`}
          </p>
        </div>
        <span className="mt-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#f8f5f1] text-[#080808] transition-transform group-hover:translate-x-0.5">
          <LocalIcon name="arrow-right" className="h-5 w-5" />
        </span>
      </div>
    </Link>
  )
}

function EmptyMediaPlaceholder({
  iconName,
  label,
}: {
  iconName: StorefrontIconName
  label: string
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.82)_0%,rgba(244,241,237,0.92)_58%,rgba(236,231,224,0.9)_100%)]">
      <span className="sr-only">{label} image placeholder</span>
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white/62 text-[#111111]/65 shadow-[0_10px_24px_-22px_rgba(17,24,39,0.25)]">
        <LocalIcon name={iconName} className="h-7 w-7" />
      </span>
    </div>
  )
}

function ViewAllCategoryLink({ category }: { category: CategoryItem }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group mt-7 flex min-h-[78px] items-center gap-5 rounded-lg border border-black/10 bg-[#fbf8f4] px-6 py-4 transition-colors hover:border-black/20 hover:bg-[#f7f2eb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111827]"
    >
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-[#090909]">
        <LocalIcon name="category-view-all" className="h-8 w-8" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold leading-5 text-[#090909]">View All {category.name}</span>
        <span className="mt-1 block text-sm leading-5 text-[#4b5563]">
          Explore all {category.name.toLowerCase()} products and accessories.
        </span>
      </span>
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[#080808] transition-transform group-hover:translate-x-0.5">
        <LocalIcon name="arrow-right" className="h-5 w-5" />
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
    <section className="overflow-hidden rounded-[18px] border border-black/10 bg-white shadow-[0_20px_48px_-42px_rgba(17,24,39,0.24)]">
      {categories.map((category) => {
        const config = getCategoryConfig(category.slug)
        const iconName = getCategoryIconName(category.slug)
        const summary = category.description?.trim() || config.summary
        const isOpen = category.slug === selectedSlug

        return (
          <details key={category.id} className="group border-b border-black/10 last:border-b-0" open={isOpen}>
            <summary className="cursor-pointer list-none marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#111827]">
              <div className="flex min-h-[82px] items-center gap-4 px-5 py-4">
                <span className="inline-flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-[#f4f1ed] text-[#080808]">
                  <LocalIcon name={iconName} className="h-8 w-8" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[1.25rem] font-semibold leading-7 text-[#080808]">{category.name}</span>
                  {isOpen && (
                    <span className="mt-2 block text-[0.98rem] leading-7 text-[#4b5563]">{summary}</span>
                  )}
                </span>
                <LocalIcon name="chevron-down" className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
              </div>
            </summary>

            <div className="space-y-2 px-5 pb-5">
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
  const iconName = getCategoryIconName(category.slug)

  return (
    <Link
      href={`/category/${child.slug}`}
      className="group flex min-h-[112px] items-center gap-3 rounded-lg border border-black/10 bg-white p-0 transition-colors hover:border-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111827]"
    >
      <span className="relative block h-[112px] w-[104px] shrink-0 overflow-hidden rounded-l-lg bg-[#f4f1ed] sm:w-[132px]">
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
          <EmptyMediaPlaceholder iconName={iconName} label={child.name} />
        )}
      </span>
      <span className="min-w-0 flex-1 py-3 pr-1">
        <span className="block text-[1.02rem] font-semibold leading-6 text-[#090909] sm:text-[1.15rem]">{child.name}</span>
        <span className="mt-1.5 block text-sm leading-6 text-[#4b5563] sm:text-base">
          {child.description?.trim() || `Explore ${child.name} in ${category.name}.`}
        </span>
      </span>
      <span className="mr-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4f1ed] text-[#080808] transition-transform group-hover:translate-x-0.5">
        <LocalIcon name="arrow-right" className="h-5 w-5" />
      </span>
    </Link>
  )
}
