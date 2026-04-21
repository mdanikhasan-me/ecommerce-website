import { db } from '@/backend/database'
import { FlashSaleSection } from '@/frontend/components/home/FlashSaleSection'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { Zap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Boilabin Flash Deals', description: 'Best deals and flash sales on Boilabin' }
export const revalidate = 60

export default async function DealsPage() {
  const [flashSale, saleProducts] = await Promise.all([
    db.flashSale.findFirst({
      where: { isActive: true, endsAt: { gt: new Date() }, startsAt: { lte: new Date() } },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
                category: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
    }),
    db.product.findMany({
      where: { isActive: true, salePrice: { not: null } },
      orderBy: { soldCount: 'desc' },
      take: 16,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
    }),
  ])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-primary text-white py-12">
        <div className="container-site text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="h-6 w-6" />
            <span className="font-semibold uppercase tracking-widest text-sm">Limited Time</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold">Flash Deals</h1>
          <p className="mt-2 text-white/80">Incredible prices on top products, while stocks last</p>
        </div>
      </div>

      <div className="container-site py-10 space-y-12">
        {flashSale && flashSale.items.length > 0 && (
          <section className="bg-accent/5 rounded-2xl border border-border p-6">
            <FlashSaleSection flashSale={flashSale} />
          </section>
        )}

        {saleProducts.length > 0 && (
          <section>
            <h2 className="section-title mb-6">On Sale Now</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {saleProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
