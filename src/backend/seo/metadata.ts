/**
 * Metadata Generators
 *
 * Next.js Metadata API helpers for every page type.
 */

import type { Metadata } from 'next'
import { SEO } from './constants'
import { canonicalUrl, toAbsoluteUrl } from './urls'
import { noIndexFollowRobots } from './robots'

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
  rating?: number
  reviewCount?: number
  stockQuantity?: number
  tags?: string[]
}

export function generateProductMetadata(product: ProductMeta): Metadata {
  const price = product.salePrice ?? product.basePrice
  const primaryImage = toAbsoluteUrl(
    product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url,
  )
  const url = canonicalUrl(`/products/${product.slug}`)

  const desc =
    product.shortDescription ??
    product.description?.slice(0, 155) ??
    `Buy ${product.name} at Tk ${price.toLocaleString('en-BD')} in Bangladesh. Free delivery on orders over Tk 2,000. Cash on delivery available.`

  const keywords = [
    product.name,
    `${product.name} price in bd`,
    `${product.name} price bangladesh`,
    `buy ${product.name} online`,
    product.category.name,
    `${product.category.name} price bd`,
    ...(product.tags ?? []),
    'boilabin',
    'online shopping bangladesh',
  ]

  const seoTitle = product.metaTitle?.trim() || `${product.name} price in Bangladesh`
  const seoDescription =
    product.metaDescription?.trim() ||
    `Buy ${product.name} in Bangladesh at BDT ${formatBdt(price)}. Fast delivery, secure checkout, and cash on delivery from Boilabin.`

  return {
    title: seoTitle,
    description: seoDescription,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${product.name}, Tk ${price.toLocaleString('en-BD')}, ${SEO.siteName}`,
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
      title: `${product.name}, Tk ${price.toLocaleString('en-BD')}`,
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
  indexable?: boolean
}

export function generateCategoryMetadata(category: CategoryMeta): Metadata {
  const url = canonicalUrl(`/category/${category.slug}`)
  const desc =
    category.description ??
    `Shop ${category.name} at the best prices in Bangladesh. ${category.productCount ? `${category.productCount}+ products` : 'Wide selection'} with free delivery on orders over Tk 2,000.`

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
    robots: category.indexable === false ? noIndexFollowRobots : SEO.robots,
  }
}

export function generatePageMetadata(
  title: string,
  description: string,
  path: string = '',
  options: { indexable?: boolean } = {},
): Metadata {
  const url = canonicalUrl(path || '/')
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
    robots: options.indexable === false ? noIndexFollowRobots : SEO.robots,
  }
}

export function generateNoIndexPageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return generatePageMetadata(title, description, path, { indexable: false })
}

export function generateSearchMetadata(params: { q?: string | string[] | undefined } = {}): Metadata {
  const q = Array.isArray(params.q) ? params.q[0] : params.q
  const query = q?.trim()
  const title = query ? `Search: "${query}"` : 'Search Products'
  const description = query
    ? `Search results for "${query}" on Boilabin.`
    : 'Search Boilabin products by name, category, and price.'

  return {
    ...generatePageMetadata(title, description, '/search', { indexable: false }),
    alternates: { canonical: canonicalUrl('/search') },
  }
}
