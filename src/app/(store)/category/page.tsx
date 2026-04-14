import Link from 'next/link'
import type { Metadata } from 'next'
import { db } from '@/backend/database'
import Image from 'next/image'
import { CATEGORY_PRESENTATION, DEFAULT_CATEGORY_PRESENTATION } from '@/backend/category-presentation'

export const metadata: Metadata = {
  title: 'All Categories',
  description: 'Browse all shopping categories on Boilabin.',
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
        take: 6,
      },
    },
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container-site py-8">
      <div className="mb-8">
        <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="text-foreground">All Categories</span>
        </nav>
        <h1 className="font-display text-3xl font-bold">All Categories</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse every department and jump into the right subcategory without hunting around.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {categories.map((category) => (
          <CategoryCollectionCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}

function CategoryCollectionCard({
  category,
}: {
  category: Awaited<ReturnType<typeof getCategories>>[number]
}) {
  const theme = CATEGORY_PRESENTATION[category.slug] ?? DEFAULT_CATEGORY_PRESENTATION

  return (
    <article className="overflow-hidden rounded-[30px] border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className={`h-1.5 bg-gradient-to-r ${theme.band}`} />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Department
            </p>
            <Link href={`/category/${category.slug}`} className="transition-colors hover:text-primary">
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight">{category.name}</h2>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              {category.description ??
                (category.children.length > 0
                  ? `${category.children.length} linked subcategories`
                  : 'Explore products from this department')}
            </p>
          </div>

          <div className={`flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-3xl border ${theme.panel}`}>
            <Image src={theme.asset} alt="" width={88} height={88} className="h-auto w-[88px]" />
          </div>
        </div>

        {category.children.length > 0 ? (
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/category/${child.slug}`}
                className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <span>{child.name}</span>
                <span className={`text-xs ${theme.accent}`}>Open</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-secondary/50 px-4 py-4 text-sm text-muted-foreground">
            No subcategories yet. Use the main category page to browse products.
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">
            {category.children.length > 0 ? 'Browse all subcategories' : 'Browse this department'}
          </span>
          <Link href={`/category/${category.slug}`} className={`text-sm font-semibold ${theme.accent}`}>
            View Category
          </Link>
        </div>
      </div>
    </article>
  )
}
