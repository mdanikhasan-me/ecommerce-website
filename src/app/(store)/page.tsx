import { db } from '@/backend/database'
import { HeroBanner } from '@/frontend/components/home/HeroBanner'
import { FeaturedCategories } from '@/frontend/components/home/FeaturedCategories'
import { ProductGrid } from '@/frontend/components/home/ProductGrid'
import { PromoSection } from '@/frontend/components/home/PromoSection'
import { generateOrganizationJsonLd, generateWebsiteJsonLd, generateLocalBusinessJsonLd, JsonLd, SEO } from '@/backend/seo'
import { getVisibleCategoryProductCounts } from '@/backend/catalog/category-product-counts'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: SEO.defaultTitle,
  description: SEO.defaultDescription,
  keywords: [...SEO.baseKeywords],
  alternates: { canonical: SEO.siteUrl },
  openGraph: {
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
    url: SEO.siteUrl,
    siteName: SEO.siteName,
    locale: SEO.locale,
    type: 'website',
    images: [...SEO.og.images],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
  },
}

export const revalidate = 300

async function getHomeData() {
  const categoriesPromise = db.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    take: 10,
    include: { children: { where: { isActive: true }, take: 5, orderBy: { sortOrder: 'asc' } } },
  })

  const bannersPromise = db.banner.findMany({ where: { isActive: true, position: 'hero' }, orderBy: { sortOrder: 'asc' } })
  const featuredPromise = db.product.findMany({
    where: getBuyerVisibleProductWhere({ isFeatured: true }),
    take: 8,
    orderBy: { soldCount: 'desc' },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  })
  const bestSellersPromise = db.product.findMany({
    where: getBuyerVisibleProductWhere({ isBestSeller: true }),
    take: 8,
    orderBy: { soldCount: 'desc' },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  })
  const newArrivalsPromise = db.product.findMany({
    where: getBuyerVisibleProductWhere({ isNew: true }),
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  })
  const newArrivalsPinnedPromise = db.product.findMany({
    where: getBuyerVisibleProductWhere({ isNew: true, pinnedInNew: true }),
    take: 8,
    orderBy: { updatedAt: 'desc' },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  })
  const categories = await categoriesPromise
  const categoryProductCountsPromise = getVisibleCategoryProductCounts(categories)

  const [
    banners,
    categoryProductCounts,
    featured,
    bestSellers,
    newArrivals,
    newArrivalsPinned,
  ] = await Promise.all([
    bannersPromise,
    categoryProductCountsPromise,
    featuredPromise,
    bestSellersPromise,
    newArrivalsPromise,
    newArrivalsPinnedPromise,
  ])

  return {
    banners,
    categories: categories.map((category) => ({
      ...category,
      productCount: categoryProductCounts.get(category.id) ?? 0,
    })),
    featured,
    bestSellers,
    newArrivals,
    newArrivalsPinned,
  }
}

export default async function HomePage() {
  const {
    banners,
    categories,
    featured,
    bestSellers,
    newArrivals,
    newArrivalsPinned,
  } = await getHomeData()

  const newArrivalRotatorProducts = newArrivalsPinned.length > 0 ? newArrivalsPinned : newArrivals

  return (
    <div className="min-h-screen">
      <JsonLd data={[
        generateOrganizationJsonLd(),
        generateWebsiteJsonLd(),
        generateLocalBusinessJsonLd(),
      ]} />

      <HeroBanner banners={banners} />

      <section className="container-site py-8 sm:py-10">
        <FeaturedCategories categories={categories} />
      </section>

      {featured.length > 0 && (
        <section className="container-site py-12">
          <ProductGrid
            title="Featured Products"
            subtitle="Handpicked products, premium quality"
            products={featured}
            viewAllHref="/search?featured=true"
          />
        </section>
      )}

      <section className="w-full py-4 sm:py-6">
        <PromoSection
          newArrivalProducts={newArrivals}
          newArrivalRotatorProducts={newArrivalRotatorProducts}
        />
      </section>

      {bestSellers.length > 0 && (
        <section className="container-site py-12">
          <ProductGrid
            title="Best Sellers"
            subtitle="Loved by thousands of customers"
            products={bestSellers}
            viewAllHref="/search?sort=popular"
          />
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="container-site py-12">
          <ProductGrid
            title="New Arrivals"
            subtitle="Fresh finds, just landed"
            products={newArrivals}
            viewAllHref="/new-arrivals"
          />
        </section>
      )}
    </div>
  )
}
