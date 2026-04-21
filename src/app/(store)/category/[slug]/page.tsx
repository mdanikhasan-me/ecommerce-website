import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { SearchFiltersPanel } from '@/frontend/components/product/SearchFiltersPanel'
import type { Metadata } from 'next'

type CategorySearchParams = {
  sort?: string
  minPrice?: string
  maxPrice?: string
  page?: string
}

interface Props {
  params: Promise<{ slug: string }>
  searchParams?: Promise<CategorySearchParams>
}

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await db.category.findUnique({ where: { slug } })
  if (!category) return { title: 'Category Not Found' }
  return { title: `Boilabin ${category.name}`, description: category.description ?? `Shop ${category.name} products` }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const resolvedSearchParams = (await searchParams) ?? {}
  const category = await db.category.findUnique({
    where: { slug, isActive: true },
    include: { children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
  })

  if (!category) notFound()

  const page = Math.max(1, parseInt(resolvedSearchParams.page ?? '1'))
  const limit = 24
  const skip = (page - 1) * limit

  // Include all descendant categories
  const categoryIds = [category.id, ...category.children.map((c) => c.id)]

  const where: any = { isActive: true, categoryId: { in: categoryIds } }
  if (resolvedSearchParams.minPrice) where.basePrice = { ...where.basePrice, gte: parseFloat(resolvedSearchParams.minPrice) }
  if (resolvedSearchParams.maxPrice) where.basePrice = { ...where.basePrice, lte: parseFloat(resolvedSearchParams.maxPrice) }

  let orderBy: any = { soldCount: 'desc' }
  if (resolvedSearchParams.sort === 'newest') orderBy = { createdAt: 'desc' }
  else if (resolvedSearchParams.sort === 'price_asc') orderBy = { basePrice: 'asc' }
  else if (resolvedSearchParams.sort === 'price_desc') orderBy = { basePrice: 'desc' }
  else if (resolvedSearchParams.sort === 'rating') orderBy = { rating: 'desc' }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where, orderBy, skip, take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
    }),
    db.product.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container-site py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/">Home</Link>
        <span>/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">{category.name}</h1>
          {category.description && <p className="text-muted-foreground text-sm mt-1">{category.description}</p>}
        </div>
        <span className="text-sm text-muted-foreground">{total} products</span>
      </div>

      {/* Sub-categories */}
      {category.children.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          <a
            href={`/category/${slug}`}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium"
          >
            All
          </a>
          {category.children.map((sub) => (
            <a
              key={sub.slug}
              href={`/category/${sub.slug}`}
              className="flex-shrink-0 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:border-primary hover:text-primary transition-colors"
            >
              {sub.name}
            </a>
          ))}
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <SearchFiltersPanel categories={[]} searchParams={resolvedSearchParams as Record<string, string>} />
        </aside>

        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">Empty shelf</p>
              <h2 className="font-display text-xl font-semibold">No products found</h2>
              <p className="text-muted-foreground mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`/category/${slug}?page=${p}`}
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
