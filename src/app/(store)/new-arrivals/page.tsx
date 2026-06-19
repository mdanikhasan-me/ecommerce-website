import { db } from '@/backend/database'
import { unstable_cache } from 'next/cache'
import { productCardSelect } from '@/backend/catalog/product-card-select'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import { STOREFRONT_CACHE_TAGS } from '@/backend/catalog/storefront-revalidation'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generateItemListJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { logSecurityEvent } from '@/backend/security/security-log'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin New Arrivals',
  'Explore the newest products added to Boilabin, with clear prices and delivery across Bangladesh.',
  '/new-arrivals',
)
export const revalidate = 300
const NEW_ARRIVAL_IMAGE_SIZES = '(max-width: 699px) 50vw, (max-width: 1279px) 33vw, 25vw'

const getNewArrivalProducts = unstable_cache(async () => db.product.findMany({
    where: getBuyerVisibleProductWhere({ isNew: true }),
    orderBy: { createdAt: 'desc' },
    take: 32,
    select: productCardSelect,
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
  }), ['storefront-new-arrivals-v1'], {
    revalidate: 300,
    tags: [STOREFRONT_CACHE_TAGS.products],
  })

export default async function NewArrivalsPage() {
  const products = await getNewArrivalProducts()
  const pageJsonLd = generateWebPageJsonLd({
    type: 'CollectionPage',
    name: 'Boilabin New Arrivals',
    description: 'Explore the newest products added to Boilabin, with clear prices and delivery across Bangladesh.',
    path: '/new-arrivals',
  })
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'New Arrivals', url: '/new-arrivals' },
  ])
  const itemListJsonLd = generateItemListJsonLd(
    'Boilabin new arrivals',
    products.map((product, index) => ({
      name: product.name,
      slug: product.slug,
      basePrice: product.basePrice,
      salePrice: product.salePrice,
      image: product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url,
      position: index + 1,
    })),
  )

  return (
    <div className="container-site py-8">
      <JsonLd data={[pageJsonLd, breadcrumbJsonLd, itemListJsonLd]} />
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-green-100">
          <LocalIcon name="sparkles" className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">New Arrivals</h1>
          <p className="text-muted-foreground text-sm">Fresh products, just landed</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No new arrivals yet. Check back soon!</div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 min-[700px]:grid-cols-3 min-[700px]:gap-x-5 min-[700px]:gap-y-8 xl:grid-cols-4 xl:gap-x-8 xl:gap-y-10">
          {products.map((p, index) => (
            <ProductCard
              key={p.id}
              product={p}
              priority={index === 0}
              imageSizes={NEW_ARRIVAL_IMAGE_SIZES}
            />
          ))}
        </div>
      )}
    </div>
  )
}
