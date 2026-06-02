import { db } from '@/backend/database'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { generatePageMetadata } from '@/backend/seo'
import { logSecurityEvent } from '@/backend/security/security-log'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { Sparkles } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin New Arrivals',
  'Explore the newest products added to Boilabin, with clear prices and delivery across Bangladesh.',
  '/new-arrivals',
)
export const revalidate = 300

export default async function NewArrivalsPage() {
  const products = await db.product.findMany({
    where: getBuyerVisibleProductWhere({ isNew: true }),
    orderBy: { createdAt: 'desc' },
    take: 32,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  }).catch(() => {
    logSecurityEvent({
      type: 'server_page_data_load_failed',
      severity: 'error',
      route: '/new-arrivals',
      statusCode: 200,
      errorCode: 'new_arrivals_page_data_load_failed',
      metadata: {
        feature: 'new_arrivals',
        fallback: 'empty_products',
      },
    })
    return []
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
