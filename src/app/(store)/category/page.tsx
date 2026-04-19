import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { db } from '@/backend/database'
import { cn } from '@/backend/utils'
import { getCategoryConfig } from '@/frontend/components/category/category-config'
import { getCategoryMediaPath } from '@/shared/category-media'

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

      <section className="rounded-[30px] border border-black/6 bg-[#fbf8f2] px-6 py-7 shadow-[0_20px_48px_-42px_rgba(15,23,42,0.12)] sm:px-8 sm:py-8">
        <h1 className="font-display text-[2.7rem] leading-[0.94] tracking-tight text-[#161616] sm:text-[3.5rem]">
          All Categories
        </h1>
      </section>

      <div className="mt-10 space-y-7">
        {categories.map((category) => (
          <CategorySectionCard
            key={category.id}
            category={category}
          />
        ))}
      </div>
    </div>
  )
}

function CategorySectionCard({ category }: { category: CategoryItem }) {
  const config = getCategoryConfig(category.slug)

  return (
    <section className="rounded-[30px] border border-black/8 bg-card p-4 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.18)] sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(220px,260px)_1fr]">
        <Link
          href={`/category/${category.slug}`}
          className="group relative isolate aspect-[1.02] overflow-hidden rounded-[24px] border border-black/6 bg-slate-100"
        >
          <Image
            src={getCategoryMediaPath(category)}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 1024px) 100vw, 260px"
            quality={84}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0.22)_44%,rgba(15,23,42,0.76)_100%)]" />
          <div className={cn('absolute inset-x-0 top-0 h-24 opacity-60', config.glowClass)} />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <div>
              <h2 className="text-[1.5rem] font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(15,23,42,0.42)]">
                {category.name}
              </h2>
              <p className="mt-1 text-sm text-white/78">{config.eyebrow}</p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-[#161616] shadow-[0_12px_24px_-18px_rgba(15,23,42,0.42)] transition-transform duration-200 group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>

        <div className="flex min-w-0 flex-col justify-between">
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{config.summary}</p>
              <Link
                href={`/category/${category.slug}`}
                className={cn('inline-flex items-center gap-2 text-sm font-semibold', config.linkClass)}
              >
                Open category
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {category.children.length > 0 ? (
              category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/category/${child.slug}`}
                  className="group rounded-[18px] border border-black/8 bg-[#faf7f1] px-4 py-4 transition-colors hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#161616]">{child.name}</p>
                    <ArrowRight className="h-4 w-4 text-[#161616] transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[18px] border border-dashed border-black/10 bg-[#faf7f1] px-4 py-4 text-sm text-muted-foreground">
                Open this department to browse the full collection.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
