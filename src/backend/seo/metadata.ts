/**
 * Metadata Generators
 *
 * Next.js Metadata API helpers for every page type.
 */

import type { Metadata } from 'next'
import { SEO } from './constants'
import { canonicalUrl, toAbsoluteUrl } from './urls'
import { noIndexFollowRobots } from './robots'
import { buildProductSearchCopy } from './product-copy'

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
  sku?: string | null
}

export function generateProductMetadata(product: ProductMeta): Metadata {
  const price = product.salePrice ?? product.basePrice
  const primaryImage = toAbsoluteUrl(
    product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url,
  )
  const url = canonicalUrl(`/products/${product.slug}`)

  const generated = buildProductSearchCopy({
    name: product.name,
    price,
    categoryName: product.category.name,
    sku: product.sku,
    shortDescription: product.shortDescription,
    description: product.description,
    tags: product.tags,
  })
  const desc = product.shortDescription?.trim() || product.description?.trim() || generated.description
  const seoTitle = product.metaTitle?.trim() || generated.title
  const seoDescription = product.metaDescription?.trim() || generated.description

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: generated.searchTerms,
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
    `Browse ${category.name} products on Boilabin. ${category.productCount ? `${category.productCount}+ visible products` : 'Review current listings'} with prices, images, availability, and category details.`

  return {
    title: `${category.name} Products in Bangladesh`,
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
      title: `${category.name} Products in Bangladesh, ${SEO.siteName}`,
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
