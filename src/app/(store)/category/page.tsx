import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { db } from '@/backend/database'
import { cn } from '@/backend/utils'
import { getCategoryConfig } from '@/frontend/components/category/category-config'

export const metadata: Metadata = {
  title: 'Boilabin Categories',
  description: 'Browse every shopping category on Boilabin.',
}

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
    <div className="container-site py-10">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">All Categories</span>
      </nav>

      <section className="rounded-[30px] border border-black/8 bg-[#fbf8f2] px-6 py-7 shadow-[0_20px_48px_-42px_rgba(15,23,42,0.12)] sm:px-8 sm:py-8">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#7b7367]">
          Browse by department
        </p>
        <h1 className="mt-3 font-display text-[2.7rem] leading-[0.94] tracking-tight text-[#161616] sm:text-[3.5rem]">
          All Categories
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#6c655c] sm:text-[0.95rem]">
          Choose a department first, then open it to reveal the matching subcategories. The layout stays deliberately
          quiet so the structure is easier to understand at a glance.
        </p>
      </section>

      <section className="mt-10 overflow-hidden rounded-[30px] border border-black/8 bg-card shadow-[0_18px_42px_-36px_rgba(15,23,42,0.18)]">
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

  if (!hasChildren) {
    return (
      <Link
        href={`/category/${category.slug}`}
        className="group flex flex-col gap-4 border-b border-black/6 px-5 py-5 transition-colors last:border-b-0 hover:bg-[#f7f2e7] sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[1.12rem] font-semibold tracking-tight text-[#161616] sm:text-[1.2rem]">{category.name}</h2>
            <span className="rounded-full border border-black/8 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#7b7367]">
              Department
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{config.summary}</p>
        </div>
        <span className="inline-flex items-center text-sm font-semibold text-[#161616] transition-transform duration-200 group-hover:translate-x-0.5">
          Open
          <ChevronRight className="ml-1.5 h-4 w-4" />
        </span>
      </Link>
    )
  }

  return (
    <details className="group border-b border-black/6 last:border-b-0">
      <summary className="cursor-pointer list-none px-5 py-5 marker:content-none sm:px-7 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[1.12rem] font-semibold tracking-tight text-[#161616] sm:text-[1.2rem]">{category.name}</h2>
              <span className="rounded-full border border-black/8 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#7b7367]">
                {category.children.length} subcategories
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{config.summary}</p>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-[#161616]">
            <span className={cn('transition-colors', config.linkClass)}>Expand</span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/8 bg-[#faf7f1] transition-transform duration-200 group-open:rotate-180">
              <ChevronDown className="h-4 w-4" />
            </span>
          </div>
        </div>
      </summary>

      <div className="px-5 pb-5 sm:px-7 sm:pb-6">
        <div className="rounded-[24px] border border-black/6 bg-[#faf7f1] p-4 sm:p-5">
          <div className="flex flex-col gap-3 border-b border-black/6 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#7b7367]">{config.eyebrow}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Open a subcategory for a narrower collection, or enter the full department if you want to browse
                everything in one place.
              </p>
            </div>
            <Link
              href={`/category/${category.slug}`}
              className={cn('inline-flex items-center text-sm font-semibold transition-colors hover:opacity-80', config.linkClass)}
            >
              View all {category.name}
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 grid gap-2">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/category/${child.slug}`}
                className="group flex items-center justify-between rounded-[18px] border border-black/8 bg-white/72 px-4 py-3.5 text-sm font-medium text-[#161616] transition-colors hover:bg-white"
              >
                <span>{child.name}</span>
                <ChevronRight className="h-4 w-4 text-[#4b463f] transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </details>
  )
}
