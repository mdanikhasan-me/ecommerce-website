import Link from 'next/link'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { db } from '@/backend/database'
import { productCardSelect } from '@/backend/catalog/product-card-select'
import {
  getBuyerVisibleProductWhere,
  getPublicProductDetailWhere,
} from '@/backend/catalog/product-visibility'
import { STOREFRONT_CACHE_TAGS } from '@/backend/catalog/storefront-revalidation'
import { type ReviewAccessState } from '@/backend/reviews'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { ProductDetailClient } from '@/frontend/components/product/ProductDetailClient'
import { ReviewSection } from '@/frontend/components/product/ReviewSection'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generateProductJsonLd,
  generateProductMetadata,
  noIndexNoFollowRobots,
} from '@/backend/seo'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 600

export async function generateStaticParams() {
  return []
}

const getProduct = unstable_cache(async (slug: string) => {
  return db.product.findFirst({
    where: getPublicProductDetailWhere(slug),
    include: {
      images: {
        select: { url: true, alt: true, isPrimary: true, sortOrder: true },
        orderBy: { sortOrder: 'asc' },
      },
      category: { select: { name: true, slug: true } },
      variants: {
        where: { isActive: true },
        include: { options: true },
        orderBy: { sortOrder: 'asc' },
      },
      attributes: {
        select: { id: true, name: true, value: true },
        orderBy: { sortOrder: 'asc' },
      },
      specifications: {
        select: { group: true, name: true, value: true, sortOrder: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
}, ['storefront-product-detail-v1'], {
  revalidate: 600,
  tags: [STOREFRONT_CACHE_TAGS.products],
})

const getApprovedReviews = unstable_cache(async (productId: string) => {
  return db.review.findMany({
    where: { productId, status: 'APPROVED' },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
}, ['storefront-product-reviews-v1'], {
  revalidate: 600,
  tags: [STOREFRONT_CACHE_TAGS.products],
})

const getReviewDistribution = unstable_cache(async (productId: string) => {
  const grouped = await db.review.groupBy({
    by: ['rating'],
    where: { productId, status: 'APPROVED' },
    _count: { _all: true },
  })

  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: grouped.find((entry) => entry.rating === star)?._count._all ?? 0,
  }))
}, ['storefront-product-review-distribution-v1'], {
  revalidate: 600,
  tags: [STOREFRONT_CACHE_TAGS.products],
})

const getRelatedProducts = unstable_cache(async (categoryId: string, productId: string) => {
  return db.product.findMany({
    where: getBuyerVisibleProductWhere({
      categoryId,
      id: { not: productId },
    }),
    take: 4,
    select: productCardSelect,
  })
}, ['storefront-related-products-v1'], {
  revalidate: 600,
  tags: [STOREFRONT_CACHE_TAGS.products],
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) return { title: 'Product Not Found', robots: noIndexNoFollowRobots }

  return generateProductMetadata({
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    basePrice: product.basePrice,
    salePrice: product.salePrice,
    images: product.images.map((image) => ({ url: image.url, isPrimary: image.isPrimary })),
    category: product.category,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stockQuantity: product.stockQuantity,
    tags: product.tags,
    sku: product.sku,
  })
}

function ReviewsFallback() {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-border sm:mt-10">
      <div className="border-b border-border bg-secondary px-4 py-3 sm:px-6 sm:py-4">
        <div className="skeleton h-6 w-44 rounded" />
      </div>
      <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
        <div className="skeleton h-28 w-full rounded-2xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
      </div>
    </section>
  )
}

function RelatedProductsFallback() {
  return (
    <section className="product-list-scope mt-10 sm:mt-12">
      <div className="skeleton mb-4 h-7 w-52 rounded sm:mb-5" />
      <div className="product-list-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-border">
            <div className="skeleton aspect-[4/3] w-full" />
            <div className="space-y-3 p-4">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-4 w-5/6 rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton h-5 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

async function ProductReviewsSection({
  productId,
  productName,
  rating,
  reviewCount,
}: {
  productId: string
  productName: string
  rating: number
  reviewCount: number
}) {
  const [reviews, distribution] = await Promise.all([
    getApprovedReviews(productId),
    getReviewDistribution(productId),
  ])

  const reviewAccess: ReviewAccessState = {
    canReview: false,
    hasDeliveredPurchase: false,
    existingReviewStatus: null,
  }

  return (
    <ReviewSection
      product={{ id: productId, name: productName, rating, reviewCount }}
      reviews={reviews}
      distribution={distribution}
      reviewAccess={reviewAccess}
    />
  )
}

async function RelatedProductsSection({
  categoryId,
  productId,
}: {
  categoryId: string
  productId: string
}) {
  const related = await getRelatedProducts(categoryId, productId)

  if (related.length === 0) return null

  return (
    <section className="product-list-scope mt-10 sm:mt-12">
      <h2 className="section-title mb-4 sm:mb-5">You Might Also Like</h2>
      <div className="product-list-grid">
        {related.map((relatedProduct) => (
          <ProductCard
            key={relatedProduct.id}
            product={relatedProduct}
            imageSizes="(max-width: 339px) 100vw, (max-width: 559px) 50vw, (max-width: 1279px) 33vw, (max-width: 1535px) 25vw, 20vw"
          />
        ))}
      </div>
    </section>
  )
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  const productJsonLd = generateProductJsonLd({
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: product.basePrice,
    salePrice: product.salePrice,
    images: product.images.map((image) => ({ url: image.url })),
    category: product.category,
    sku: product.sku,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stockQuantity: product.stockQuantity,
    attributes: product.attributes,
    specifications: product.specifications,
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: product.category.name, url: `/category/${product.category.slug}` },
    { name: product.name, url: `/products/${product.slug}` },
  ])

  return (
    <div className="container-site py-5 sm:py-6 lg:py-8">
      <JsonLd data={[productJsonLd, breadcrumbJsonLd]} />

      <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground sm:mb-5 sm:gap-2 sm:text-sm">
        <Link href="/" className="whitespace-nowrap transition-colors min-[1025px]:hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href={`/category/${product.category.slug}`} className="whitespace-nowrap capitalize transition-colors min-[1025px]:hover:text-foreground">
          {product.category.name}
        </Link>
        <span className="hidden sm:inline">/</span>
        <span className="hidden max-w-[260px] truncate text-foreground sm:inline">{product.name}</span>
      </nav>

      <ProductDetailClient product={product} />

      <Suspense fallback={<ReviewsFallback />}>
        <ProductReviewsSection
          productId={product.id}
          productName={product.name}
          rating={product.rating}
          reviewCount={product.reviewCount}
        />
      </Suspense>

      <Suspense fallback={<RelatedProductsFallback />}>
        <RelatedProductsSection categoryId={product.categoryId} productId={product.id} />
      </Suspense>
    </div>
  )
}
