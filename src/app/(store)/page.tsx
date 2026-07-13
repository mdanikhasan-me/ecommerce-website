import { db } from '@/backend/database'
import { unstable_cache } from 'next/cache'
import { HeroBanner } from '@/frontend/components/home/HeroBanner'
import { FeaturedCategories } from '@/frontend/components/home/FeaturedCategories'
import { ProductGrid } from '@/frontend/components/home/ProductGrid'
import { generateOrganizationJsonLd, generateWebsiteJsonLd, generateLocalBusinessJsonLd, JsonLd, SEO } from '@/backend/seo'
import { STOREFRONT_CACHE_TAGS } from '@/backend/catalog/storefront-revalidation'
import { productCardSelect } from '@/backend/catalog/product-card-select'
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

const getHomeData = unstable_cache(async () => {
  const now = new Date()
  const categoriesPromise = db.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    take: 10,
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      children: {
        where: { isActive: true },
        take: 5,
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, slug: true },
      },
    },
  })

  const bannersPromise = db.banner.findMany({
    where: {
      isActive: true,
      position: 'hero',
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    take: 6,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      title: true,
      subtitle: true,
      imageUrl: true,
      tabletImageUrl: true,
      mobileImageUrl: true,
      linkUrl: true,
      buttonLabel: true,
      buttonStyle: true,
      textPosition: true,
      textTone: true,
      overlayStrength: true,
      textShadow: true,
    },
  })
  const featuredPromise = db.product.findMany({
    where: getBuyerVisibleProductWhere({ isFeatured: true }),
    take: 8,
    orderBy: { soldCount: 'desc' },
    select: productCardSelect,
  })
  const bestSellersPromise = db.product.findMany({
    where: getBuyerVisibleProductWhere({ isBestSeller: true }),
    take: 8,
    orderBy: { soldCount: 'desc' },
    select: productCardSelect,
  })
  const newArrivalsPromise = db.product.findMany({
    where: getBuyerVisibleProductWhere({ isNew: true }),
    take: 8,
    orderBy: { createdAt: 'desc' },
    select: productCardSelect,
  })

  const [
    categories,
    banners,
    featured,
    bestSellers,
    newArrivals,
  ] = await Promise.all([
    categoriesPromise,
    bannersPromise,
    featuredPromise,
    bestSellersPromise,
    newArrivalsPromise,
  ])

  return {
    banners,
    categories,
    featured,
    bestSellers,
    newArrivals,
  }
}, ['storefront-home-data-v5'], {
  revalidate: 300,
  tags: [
    STOREFRONT_CACHE_TAGS.banners,
    STOREFRONT_CACHE_TAGS.categories,
    STOREFRONT_CACHE_TAGS.products,
  ],
})

export default async function HomePage() {
  const {
    banners,
    categories,
    featured,
    bestSellers,
    newArrivals,
  } = await getHomeData()
  const shouldLeadWithBestSellers = featured.length === 0 && bestSellers.length > 0

  const bestSellersSection = bestSellers.length > 0 ? (
    <section className="storefront-frame">
      <ProductGrid
        title="Best Sellers"
        subtitle="Popular listings from the current catalog"
        products={bestSellers}
        viewAllHref="/search?bestSeller=true"
      />
    </section>
  ) : null

  return (
    <div className="min-h-screen bg-[#fff]">
      <JsonLd data={[
        generateOrganizationJsonLd(),
        generateWebsiteJsonLd(),
        generateLocalBusinessJsonLd(),
      ]} />

      <HeroBanner banners={banners} />

      <div className="storefront-home-stack">
        {featured.length > 0 && (
          <section className="storefront-frame">
            <ProductGrid
              title="Featured Products"
              subtitle="Selected listings from the current catalog"
              products={featured}
              viewAllHref="/search?featured=true"
            />
          </section>
        )}

        {shouldLeadWithBestSellers ? bestSellersSection : null}

        {categories.length > 0 && (
          <FeaturedCategories categories={categories} />
        )}

        {!shouldLeadWithBestSellers ? bestSellersSection : null}

        {newArrivals.length > 0 && (
          <section className="storefront-frame">
            <ProductGrid
              title="New Arrivals"
              subtitle="Fresh finds, just landed"
              products={newArrivals}
              viewAllHref="/new-arrivals"
            />
          </section>
        )}
      </div>
    </div>
  )
}
