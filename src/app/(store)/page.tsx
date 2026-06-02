import { Suspense } from 'react'
import { db } from '@/backend/database'
import { HeroBanner } from '@/frontend/components/home/HeroBanner'
import { FeaturedCategories } from '@/frontend/components/home/FeaturedCategories'
import { ProductGrid } from '@/frontend/components/home/ProductGrid'
import { FlashSaleSection } from '@/frontend/components/home/FlashSaleSection'
import { PromoSection } from '@/frontend/components/home/PromoSection'
import { ProductCardSkeleton } from '@/frontend/components/product/ProductCard'
import { generateOrganizationJsonLd, generateWebsiteJsonLd, generateLocalBusinessJsonLd, JsonLd, SEO } from '@/backend/seo'
import { getVisibleCategoryProductCounts } from '@/backend/catalog/category-product-counts'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'
import {
  createHomepageDevFallbackData,
  shouldUseHomepageDevFallbackBeforeDb,
  shouldUseHomepageDevFallback,
  warnHomepageDevFallback,
} from '@/backend/storefront/homepage-dev-fallback'
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

async function getHomeDataFromDb() {
  const now = new Date()
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
  const bestSellersPinnedPromise = db.product.findMany({
    where: getBuyerVisibleProductWhere({ isBestSeller: true, pinnedInBestSeller: true }),
    take: 8,
    orderBy: { updatedAt: 'desc' },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  })
  const flashSalePromise = db.flashSale.findFirst({
    where: { isActive: true, endsAt: { gt: now }, startsAt: { lte: now } },
    include: {
      items: {
        where: {
          product: getBuyerVisibleProductWhere(),
        },
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              category: { select: { name: true, slug: true } },
            },
          },
        },
        take: 8,
      },
    },
  })

  const categoryProductCountsPromise = categoriesPromise.then((categories) => getVisibleCategoryProductCounts(categories))

  const [
    categories,
    banners,
    categoryProductCounts,
    featured,
    bestSellers,
    newArrivals,
    newArrivalsPinned,
    bestSellersPinned,
    flashSale,
  ] = await Promise.all([
    categoriesPromise,
    bannersPromise,
    categoryProductCountsPromise,
    featuredPromise,
    bestSellersPromise,
    newArrivalsPromise,
    newArrivalsPinnedPromise,
    bestSellersPinnedPromise,
    flashSalePromise,
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
    bestSellersPinned,
    flashSale,
  }
}

async function getHomeData() {
  if (await shouldUseHomepageDevFallbackBeforeDb()) {
    warnHomepageDevFallback()
    return createHomepageDevFallbackData()
  }

  try {
    return await getHomeDataFromDb()
  } catch (error) {
    if (shouldUseHomepageDevFallback(error)) {
      warnHomepageDevFallback()
      return createHomepageDevFallbackData()
    }

    throw error
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
    bestSellersPinned,
    flashSale,
  } = await getHomeData()

  const newArrivalRotatorProducts = newArrivalsPinned.length > 0 ? newArrivalsPinned : newArrivals
  const bestSellerRotatorProducts = bestSellersPinned.length > 0 ? bestSellersPinned : bestSellers

  const flashDealPreviewProducts =
    flashSale && flashSale.items.length > 0 ? flashSale.items.map((item) => item.product) : []

  const flashDealEndsAt = flashSale?.endsAt ?? null

  const flashDealMaxDiscount = flashSale && flashSale.items.length > 0
    ? Math.max(
        ...flashSale.items.map((item) =>
          item.discountType === 'PERCENTAGE'
            ? Math.round(item.discountValue)
            : item.product.salePrice && item.product.salePrice < item.product.basePrice
              ? Math.round(((item.product.basePrice - item.product.salePrice) / item.product.basePrice) * 100)
              : 0
        )
      )
    : 0

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

      {flashSale && flashSale.items.length > 0 && (
        <section className="store-band py-10">
          <div className="container-site">
            <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}</div>}>
              <FlashSaleSection flashSale={flashSale} />
            </Suspense>
          </div>
        </section>
      )}

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
          flashDealProducts={flashDealPreviewProducts}
          newArrivalProducts={newArrivals}
          newArrivalRotatorProducts={newArrivalRotatorProducts}
          bestSellerRotatorProducts={bestSellerRotatorProducts}
          flashDealEndsAt={flashDealEndsAt}
          flashDealMaxDiscount={flashDealMaxDiscount}
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
