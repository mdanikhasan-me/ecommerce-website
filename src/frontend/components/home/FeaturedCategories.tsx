import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { CATEGORY_PRESENTATION, DEFAULT_CATEGORY_PRESENTATION } from '@/backend/category-presentation'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string | null
  image?: string | null
  children: { id: string; name: string; slug: string }[]
}

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Shop by Category</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Browse every department at a glance
          </p>
        </div>
        <Link
          href="/category"
          className="flex items-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all"
        >
          All Categories <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}

function CategoryCard({ category }: { category: Category }) {
  const theme = CATEGORY_PRESENTATION[category.slug] ?? DEFAULT_CATEGORY_PRESENTATION

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group overflow-hidden rounded-[28px] border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className={`h-1.5 bg-gradient-to-r ${theme.band}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Category
            </p>
            <h3 className="mt-3 font-display text-[1.65rem] font-bold leading-tight text-foreground">
              {category.name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {category.children.length > 0
                ? `${category.children.length} subcategories ready to explore`
                : 'Browse this department'}
            </p>
          </div>

          <div className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border ${theme.panel}`}>
            <Image
              src={theme.asset}
              alt=""
              width={72}
              height={72}
              className="h-auto w-[72px]"
            />
          </div>
        </div>

        <div className="mt-5 flex min-h-[52px] flex-wrap gap-2">
          {category.children.length > 0 ? (
            category.children.slice(0, 3).map((child) => (
              <span
                key={child.id}
                className={`rounded-full px-3 py-1 text-xs font-medium ${theme.chip}`}
              >
                {child.name}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              Explore products
            </span>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
          <span className="text-muted-foreground">
            {category.children.length > 0 ? 'View department' : 'Open category'}
          </span>
          <span className={`font-semibold transition-transform group-hover:translate-x-1 ${theme.accent}`}>
            Shop Now
          </span>
        </div>
      </div>
    </Link>
  )
}
