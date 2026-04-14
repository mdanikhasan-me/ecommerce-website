import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { formatPrice, formatDate } from '@/backend/utils'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { Store, Star, Calendar, MapPin, Package } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const seller = await db.seller.findUnique({ where: { slug: params.slug }, select: { storeName: true, description: true } })
  if (!seller) return {}
  return {
    title: `Boilabin ${seller.storeName}`,
    description: seller.description ?? `Shop from ${seller.storeName} on Boilabin`,
  }
}

export default async function StorePage({ params }: { params: { slug: string } }) {
  const seller = await db.seller.findUnique({
    where: { slug: params.slug, status: 'APPROVED' },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { soldCount: 'desc' },
        take: 20,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
        },
      },
      _count: { select: { products: true } },
    },
  })

  if (!seller) notFound()

  return (
    <div>
      {/* Store Header */}
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="container-site py-10">
          <div className="flex items-start gap-5">
            <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              {seller.logo ? (
                <img src={seller.logo} alt="" className="size-full rounded-2xl object-cover" />
              ) : (
                <Store className="size-8 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-bold">{seller.storeName}</h1>
              {seller.description && (
                <p className="text-muted-foreground text-sm mt-1.5 max-w-xl">{seller.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 text-amber-400 fill-amber-400" />
                  {seller.rating > 0 ? seller.rating.toFixed(1) : 'New Store'}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="size-3.5" /> {seller._count.products} products
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" /> Joined {formatDate(seller.createdAt)}
                </span>
                {seller.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" /> {seller.address}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container-site py-8">
        <h2 className="font-display text-xl font-semibold mb-5">Products from {seller.storeName}</h2>
        {seller.products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {seller.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
