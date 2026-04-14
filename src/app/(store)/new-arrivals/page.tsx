import { db } from '@/backend/database'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { Sparkles } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Boilabin New Arrivals' }

export default async function NewArrivalsPage() {
  const products = await db.product.findMany({
    where: { isActive: true, isNew: true },
    orderBy: { createdAt: 'desc' },
    take: 32,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    },
  })

  return (
    <div className="container-site py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-green-100">
          <Sparkles className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">New Arrivals</h1>
          <p className="text-muted-foreground text-sm">Fresh products, just landed</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No new arrivals yet. Check back soon!</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
