import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense, cache } from 'react'

import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import {
  getBuyerVisibleProductWhere,
  getPublicProductDetailWhere,
} from '@/backend/catalog/product-visibility'
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

export const revalidate = 60

const getProduct = cache(async (slug: string) => {
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
})

const getApprovedReviews = cache(async (productId: string) => {
  return db.review.findMany({
    where: { productId, status: 'APPROVED' },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
})

const getReviewDistribution = cache(async (productId: string) => {
  const grouped = await db.review.groupBy({
    by: ['rating'],
    where: { productId, status: 'APPROVED' },
    _count: { _all: true },
  })

  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: grouped.find((entry) => entry.rating === star)?._count._all ?? 0,
  }))
})

const getRelatedProducts = cache(async (categoryId: string, productId: string) => {
  return db.product.findMany({
    where: getBuyerVisibleProductWhere({
      categoryId,
      id: { not: productId },
    }),
    take: 4,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true, slug: true } },
    },
  })
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
  })
}

function ReviewsFallback() {
  return (
    <section className="mt-12 overflow-hidden rounded-2xl border border-border">
      <div className="border-b border-border bg-secondary px-6 py-4">
        <div className="skeleton h-6 w-44 rounded" />
      </div>
      <div className="space-y-5 p-6">
        <div className="skeleton h-28 w-full rounded-2xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
      </div>
    </section>
  )
}

function RelatedProductsFallback() {
  return (
    <section className="mt-14">
      <div className="skeleton mb-6 h-8 w-52 rounded" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-border">
            <div className="skeleton aspect-square w-full" />
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
  const session = await auth()

  const [reviews, distribution, reviewAccessData] = await Promise.all([
    getApprovedReviews(productId),
    getReviewDistribution(productId),
    session?.user
      ? Promise.all([
          db.order.findFirst({
            where: {
              userId: session.user.id,
              status: 'DELIVERED',
              items: { some: { productId } },
            },
            select: { id: true },
          }),
          db.review.findUnique({
            where: { productId_userId: { productId, userId: session.user.id } },
            select: { status: true },
          }),
        ]).then(([deliveredOrder, existingReview]) => ({ deliveredOrder, existingReview }))
      : Promise.resolve(null),
  ])

  const reviewAccess: ReviewAccessState = reviewAccessData
    ? {
        canReview: Boolean(reviewAccessData.deliveredOrder && !reviewAccessData.existingReview),
        hasDeliveredPurchase: Boolean(reviewAccessData.deliveredOrder),
        existingReviewStatus: reviewAccessData.existingReview?.status ?? null,
      }
    : {
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
    <section className="mt-14">
      <h2 className="section-title mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {related.map((relatedProduct) => (
          <ProductCard key={relatedProduct.id} product={relatedProduct} />
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
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: product.category.name, url: `/category/${product.category.slug}` },
    { name: product.name, url: `/products/${product.slug}` },
  ])

  return (
    <div className="container-site py-8">
      <JsonLd data={[productJsonLd, breadcrumbJsonLd]} />

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href={`/category/${product.category.slug}`} className="capitalize transition-colors hover:text-foreground">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="max-w-[200px] truncate text-foreground">{product.name}</span>
      </nav>

      <ProductDetailClient product={product} />

      {product.specifications.length > 0 ? (
        <div className="mt-12 overflow-hidden rounded-2xl border border-border">
          <div className="border-b border-border bg-secondary px-6 py-4">
            <h3 className="font-display text-lg font-semibold">Specifications</h3>
          </div>
          <div className="divide-y divide-border">
            {product.specifications.map((specification, index) => (
              <div key={index} className="grid grid-cols-2 px-6 py-3 text-sm">
                <span className="font-medium text-muted-foreground">{specification.name}</span>
                <span>{specification.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
