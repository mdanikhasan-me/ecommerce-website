/**
 * Metadata Generators
 *
 * Next.js Metadata API helpers for every page type.
 */

import type { Metadata } from 'next'
import { SEO } from './constants'

function formatBdt(value: number) {
  return new Intl.NumberFormat('en-BD').format(value)
}

interface ProductMeta {
  name: string
  slug: string
  description?: string | null
  shortDescription?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  basePrice: number
  salePrice?: number | null
  images: { url: string; isPrimary: boolean }[]
  category: { name: string; slug: string }
  brand?: { name: string; slug: string } | null
  rating?: number
  reviewCount?: number
  stockQuantity?: number
  tags?: string[]
}

export function generateProductMetadata(product: ProductMeta): Metadata {
  const price = product.salePrice ?? product.basePrice
  const primaryImage = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url
  const url = `${SEO.siteUrl}/products/${product.slug}`

  const desc =
    product.shortDescription ??
    product.description?.slice(0, 155) ??
    `Buy ${product.name} at ৳${price.toLocaleString('en-IN')} in Bangladesh. ${product.brand?.name ? `Original ${product.brand.name}. ` : ''}Free delivery on orders over ৳2,000. Cash on delivery available.`

  const keywords = [
    product.name,
    `${product.name} price in bd`,
    `${product.name} price bangladesh`,
    `buy ${product.name} online`,
    product.category.name,
    `${product.category.name} price bd`,
    ...(product.brand ? [product.brand.name, `${product.brand.name} ${product.category.name}`] : []),
    ...(product.tags ?? []),
    'boilabin',
    'online shopping bangladesh',
  ]

  const seoTitle = product.metaTitle?.trim() || `${product.name} price in Bangladesh`
  const seoDescription =
    product.metaDescription?.trim() ||
    `Buy ${product.name} in Bangladesh at BDT ${formatBdt(price)}. ${product.brand?.name ? `Original ${product.brand.name} product. ` : ''}Fast delivery, secure checkout, and cash on delivery from Boilabin.`

  return {
    title: seoTitle,
    description: seoDescription,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${product.name}, ৳${price.toLocaleString('en-IN')}, ${SEO.siteName}`,
      description: desc,
      url,
      siteName: SEO.siteName,
      locale: SEO.locale,
      type: 'website',
      images: primaryImage
        ? [
            {
              url: primaryImage,
              width: 800,
              height: 800,
              alt: product.name,
            },
          ]
        : [...SEO.og.images],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name}, ৳${price.toLocaleString('en-IN')}`,
      description: desc,
      images: primaryImage ? [primaryImage] : undefined,
    },
    robots: SEO.robots,
  }
}

interface CategoryMeta {
  name: string
  slug: string
  description?: string | null
  productCount?: number
}

export function generateCategoryMetadata(category: CategoryMeta): Metadata {
  const url = `${SEO.siteUrl}/category/${category.slug}`
  const desc =
    category.description ??
    `Shop ${category.name} at the best prices in Bangladesh. ${category.productCount ? `${category.productCount}+ products` : 'Wide selection'} with free delivery on orders over ৳2,000.`

  return {
    title: `${category.name}, Best Prices in Bangladesh`,
    description: desc,
    keywords: [
      category.name,
      `${category.name} price bd`,
      `${category.name} bangladesh`,
      `buy ${category.name} online bd`,
      ...SEO.baseKeywords,
    ],
    alternates: { canonical: url },
    openGraph: {
      title: `${category.name}, Best Prices in Bangladesh, ${SEO.siteName}`,
      description: desc,
      url,
      siteName: SEO.siteName,
      locale: SEO.locale,
      type: 'website',
    },
    robots: SEO.robots,
  }
}

interface BrandMeta {
  name: string
  slug: string
  description?: string | null
}

export function generateBrandMetadata(brand: BrandMeta): Metadata {
  const url = `${SEO.siteUrl}/brands/${brand.slug}`
  const desc =
    brand.description ??
    `Shop original ${brand.name} products at the best prices in Bangladesh. Genuine products with warranty. Free delivery on orders over ৳2,000.`

  return {
    title: `${brand.name} Products, Boilabin Bangladesh`,
    description: desc,
    keywords: [
      brand.name,
      `${brand.name} price bd`,
      `${brand.name} bangladesh`,
      `original ${brand.name} bd`,
      ...SEO.baseKeywords,
    ],
    alternates: { canonical: url },
    openGraph: {
      title: `${brand.name} Products, ${SEO.siteName}`,
      description: desc,
      url,
      siteName: SEO.siteName,
      locale: SEO.locale,
      type: 'website',
    },
    robots: SEO.robots,
  }
}

export function generatePageMetadata(
  title: string,
  description: string,
  path: string = ''
): Metadata {
  const url = `${SEO.siteUrl}${path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title}, ${SEO.siteName}`,
      description,
      url,
      siteName: SEO.siteName,
      locale: SEO.locale,
      type: 'website',
    },
    robots: SEO.robots,
  }
}
