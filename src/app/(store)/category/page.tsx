import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { generatePageMetadata } from '@/backend/seo'
import { db } from '@/backend/database'
import { getCategoryConfig } from '@/frontend/components/category/category-config'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Categories',
  'Browse Boilabin shopping categories and subcategories for products available across Bangladesh.',
  '/category',
)

export const revalidate = 300

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

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container-site py-5 sm:py-8 lg:py-10">
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground sm:mb-6 sm:text-sm">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">All Categories</span>
      </nav>

      <header className="mb-5 max-w-[48rem] sm:mb-7">
        <h1 className="font-display text-[1.95rem] leading-[0.98] tracking-tight text-[#161616] sm:text-[3.2rem]">
          All Categories
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          Browse departments and subcategories, then open a category to see current listings.
        </p>
      </header>

      <section className="overflow-hidden rounded-[18px] border border-black/8 bg-card shadow-[0_16px_36px_-34px_rgba(15,23,42,0.12)] sm:rounded-[24px]">
        {categories.map((category) => (
          <CategoryAccordionRow
            key={category.id}
            category={category}
          />
        ))}
      </section>
    </div>
  )
}

function CategoryAccordionRow({ category }: { category: CategoryItem }) {
  const config = getCategoryConfig(category.slug)
  const hasChildren = category.children.length > 0
  const summary = category.description?.trim() || config.summary

  if (!hasChildren) {
    return (
      <Link
        href={`/category/${category.slug}`}
        className="group flex items-start justify-between gap-3 border-b border-black/6 px-3.5 py-3.5 transition-colors last:border-b-0 hover:bg-[#faf6ef] sm:gap-4 sm:px-7 sm:py-6"
      >
        <div className="min-w-0">
          <h2 className="text-[1rem] font-semibold tracking-tight text-[#161616] sm:text-[1.2rem]">{category.name}</h2>
          <p className="mt-1.5 max-w-3xl text-[13px] leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-6">{summary}</p>
        </div>
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#161616] transition-transform duration-200 group-hover:translate-x-0.5">
          <ChevronRight className="h-4 w-4" />
        </span>
      </Link>
    )
  }

  return (
    <details className="group border-b border-black/6 last:border-b-0">
      <summary className="cursor-pointer list-none px-3.5 py-3.5 marker:content-none sm:px-7 sm:py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[1rem] font-semibold tracking-tight text-[#161616] sm:text-[1.2rem]">{category.name}</h2>
            <p className="mt-1.5 max-w-3xl text-[13px] leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-6">{summary}</p>
          </div>
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#161616] transition-transform duration-200 group-open:rotate-180">
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
      </summary>

      <div className="border-t border-black/6 px-4 py-2 sm:px-7">
        <div className="grid gap-0">
          <Link
            href={`/category/${category.slug}`}
            className="group flex items-center justify-between border-b border-black/6 py-3.5 text-sm font-medium text-[#161616] transition-colors hover:text-black"
          >
            <span>All {category.name}</span>
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/category/${child.slug}`}
              className="group flex items-center justify-between border-b border-black/6 py-3.5 text-sm font-medium text-[#161616] transition-colors last:border-b-0 hover:text-black"
            >
              <span>{child.name}</span>
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </details>
  )
}
