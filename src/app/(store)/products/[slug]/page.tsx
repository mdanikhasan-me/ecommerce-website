import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { ProductDetailClient } from '@/frontend/components/product/ProductDetailClient'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { ReviewSection } from '@/frontend/components/product/ReviewSection'
import { generateProductMetadata, generateProductJsonLd, generateBreadcrumbJsonLd, JsonLd, SEO } from '@/backend/seo'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
      seller: { select: { storeName: true, storeSlug: true, isFirstParty: true, rating: true } },
      variants: { include: { options: true }, orderBy: { sortOrder: 'asc' } },
      attributes: { orderBy: { sortOrder: 'asc' } },
      specifications: { orderBy: { sortOrder: 'asc' } },
      reviews: {
        where: { status: 'APPROVED' },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
}

// ─── SEO: Dynamic Metadata (title, description, OG, Twitter, keywords) ──────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Product Not Found' }

  return generateProductMetadata({
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    basePrice: product.basePrice,
    salePrice: product.salePrice,
    images: product.images.map((i) => ({ url: i.url, isPrimary: i.isPrimary })),
    category: product.category,
    brand: product.brand,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stockQuantity: product.stockQuantity,
    tags: product.tags,
  })
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  // Update view count (fire and forget)
  db.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } }).catch(() => {})

  // Related products
  const related = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    },
  })

  // ─── SEO: JSON-LD Structured Data ──────────────────────────────────────
  const productJsonLd = generateProductJsonLd({
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: product.basePrice,
    salePrice: product.salePrice,
    images: product.images.map((i) => ({ url: i.url })),
    category: product.category,
    brand: product.brand,
    sku: product.sku,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stockQuantity: product.stockQuantity,
    reviews: product.reviews.map((r) => ({
      rating: r.rating,
      body: r.body,
      user: r.user,
      createdAt: r.createdAt,
    })),
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: product.category.name, url: `/category/${product.category.slug}` },
    { name: product.name, url: `/products/${product.slug}` },
  ])

  return (
    <div className="container-site py-8">
      {/* SEO: Structured Data */}
      <JsonLd data={[productJsonLd, breadcrumbJsonLd]} />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/category/${product.category.slug}`} className="hover:text-foreground transition-colors capitalize">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product */}
      <ProductDetailClient product={product} />

      {/* Specifications */}
      {product.specifications.length > 0 && (
        <div className="mt-12 border border-border rounded-2xl overflow-hidden">
          <div className="bg-secondary px-6 py-4 border-b border-border">
            <h3 className="font-display font-semibold text-lg">Specifications</h3>
          </div>
          <div className="divide-y divide-border">
            {product.specifications.map((spec, i) => (
              <div key={i} className="grid grid-cols-2 px-6 py-3 text-sm">
                <span className="font-medium text-muted-foreground">{spec.name}</span>
                <span>{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <ReviewSection product={product} reviews={product.reviews} />

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
