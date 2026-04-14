import { db } from '@/backend/database'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Boilabin Brands' }

export default async function BrandsPage() {
  const brands = await db.brand.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  })

  const featured = brands.filter((b) => b.isFeatured)
  const others = brands.filter((b) => !b.isFeatured)

  return (
    <div className="container-site py-8">
      <h1 className="font-display text-2xl font-bold mb-2">Top Brands</h1>
      <p className="text-muted-foreground mb-8">Shop authentic products from world-class brands</p>

      {featured.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Featured Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featured.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-primary/40 hover:shadow-md transition-all"
              >
                {brand.logo ? (
                  <div className="relative h-12 w-full">
                    <Image src={brand.logo} alt={brand.name} fill className="object-contain group-hover:scale-105 transition-transform" sizes="140px" />
                  </div>
                ) : (
                  <span className="font-display font-bold text-lg">{brand.name}</span>
                )}
                <span className="text-xs text-muted-foreground">{brand._count.products} products</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">All Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {others.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="flex items-center justify-center p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-secondary transition-all text-sm font-medium"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
