import { Suspense } from 'react'
import { db } from '@/backend/database'
import { HeroBanner } from '@/frontend/components/home/HeroBanner'
import { FeaturedCategories } from '@/frontend/components/home/FeaturedCategories'
import { ProductGrid } from '@/frontend/components/home/ProductGrid'
import { FlashSaleSection } from '@/frontend/components/home/FlashSaleSection'
import { PromoSection } from '@/frontend/components/home/PromoSection'
import { NewsletterSection } from '@/frontend/components/home/NewsletterSection'
import { ProductCardSkeleton } from '@/frontend/components/product/ProductCard'
import { generateOrganizationJsonLd, generateWebsiteJsonLd, generateLocalBusinessJsonLd, JsonLd, SEO } from '@/backend/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: SEO.defaultTitle,
  description: SEO.defaultDescription,
  keywords: SEO.baseKeywords,
  alternates: { canonical: SEO.siteUrl },
  openGraph: {
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
    url: SEO.siteUrl,
    siteName: SEO.siteName,
    locale: SEO.locale,
    type: 'website',
    images: SEO.og.images,
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
  },
}

export const revalidate = 300

async function getHomeData() {
  const [banners, categories, featured, bestSellers, newArrivals, flashSale] =
    await Promise.all([
      db.banner.findMany({ where: { isActive: true, position: 'hero' }, orderBy: { sortOrder: 'asc' } }),
      db.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: 'asc' },
        take: 10,
        include: { children: { where: { isActive: true }, take: 5, orderBy: { sortOrder: 'asc' } } },
      }),
      db.product.findMany({
        where: { isActive: true, isFeatured: true },
        take: 8,
        orderBy: { soldCount: 'desc' },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
        },
      }),
      db.product.findMany({
        where: { isActive: true, isBestSeller: true },
        take: 8,
        orderBy: { soldCount: 'desc' },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
        },
      }),
      db.product.findMany({
        where: { isActive: true, isNew: true },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
        },
      }),
      db.flashSale.findFirst({
        where: { isActive: true, endsAt: { gt: new Date() }, startsAt: { lte: new Date() } },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                  brand: { select: { name: true, slug: true } },
                  category: { select: { name: true, slug: true } },
                },
              },
            },
            take: 8,
          },
        },
      }),
    ])

  return { banners, categories, featured, bestSellers, newArrivals, flashSale }
}

export default async function HomePage() {
  const { banners, categories, featured, bestSellers, newArrivals, flashSale } =
    await getHomeData()

  return (
    <div className="min-h-screen">
      <JsonLd data={[
        generateOrganizationJsonLd(),
        generateWebsiteJsonLd(),
        generateLocalBusinessJsonLd(),
      ]} />

      <HeroBanner banners={banners} />

      <section className="container-site py-10">
        <FeaturedCategories categories={categories} />
      </section>

      {flashSale && flashSale.items.length > 0 && (
        <section className="bg-accent/5 border-y border-border py-10">
          <div className="container-site">
            <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}</div>}>
              <FlashSaleSection flashSale={flashSale} />
            </Suspense>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="container-site py-10">
          <ProductGrid
            title="Featured Products"
            subtitle="Handpicked products, premium quality"
            products={featured}
            viewAllHref="/search?featured=true"
          />
        </section>
      )}

      <section className="container-site py-4">
        <PromoSection />
      </section>

      {bestSellers.length > 0 && (
        <section className="container-site py-10">
          <ProductGrid
            title="Best Sellers"
            subtitle="Loved by thousands of customers"
            products={bestSellers}
            viewAllHref="/search?sort=popular"
          />
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="container-site py-10">
          <ProductGrid
            title="New Arrivals"
            subtitle="Fresh finds, just landed"
            products={newArrivals}
            viewAllHref="/new-arrivals"
          />
        </section>
      )}

      <NewsletterSection />
    </div>
  )
}
