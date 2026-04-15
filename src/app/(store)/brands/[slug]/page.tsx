import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await db.brand.findUnique({ where: { slug } })
  if (!brand) return { title: 'Brand Not Found' }
  return { title: `Boilabin ${brand.name}`, description: brand.description ?? `Shop ${brand.name} products` }
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params
  const filters = await searchParams
  const brand = await db.brand.findFirst({ where: { slug, isActive: true } })
  if (!brand) notFound()

  const page = Math.max(1, parseInt(filters.page ?? '1'))
  const limit = 24
  const skip = (page - 1) * limit

  let orderBy: any = { soldCount: 'desc' }
  if (filters.sort === 'newest') orderBy = { createdAt: 'desc' }
  else if (filters.sort === 'price_asc') orderBy = { basePrice: 'asc' }
  else if (filters.sort === 'price_desc') orderBy = { basePrice: 'desc' }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where: { brandId: brand.id, isActive: true },
      orderBy, skip, take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    db.product.count({ where: { brandId: brand.id, isActive: true } }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container-site py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/">Home</Link><span>/</span>
        <Link href="/brands">Brands</Link><span>/</span>
        <span className="text-foreground">{brand.name}</span>
      </nav>

      <div className="flex items-center gap-5 mb-8 p-6 bg-card border border-border rounded-2xl">
        <div className="h-16 w-32 flex-shrink-0 flex items-center justify-center">
          <span className="font-display font-bold text-2xl">{brand.name}</span>
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">{brand.name}</h1>
          {brand.description && <p className="text-sm text-muted-foreground mt-1 max-w-lg">{brand.description}</p>}
          <p className="text-sm font-medium mt-2">{total} products available</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No products found for this brand.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a key={p} href={`/brands/${slug}?page=${p}`}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${p === page ? 'bg-primary text-white' : 'border border-border hover:bg-secondary'}`}>{p}</a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
