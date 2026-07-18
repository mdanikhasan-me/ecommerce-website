/**
 * Metadata Generators
 *
 * Next.js Metadata API helpers for every page type.
 */

import type { Metadata } from 'next'
import { SEO } from './constants'
import { canonicalUrl, toAbsoluteUrl } from './urls'
import { noIndexFollowRobots } from './robots'
import { buildProductSearchCopy, isLegacyGeneratedProductDescription } from './product-copy'
import { buildAutomaticProductTags } from '@/backend/catalog/product-search-tags'

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
  sku?: string | null
  attributes?: { name: string; value: string }[]
  specifications?: { name: string; value: string }[]
  variantOptions?: { name: string; value: string }[]
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
    tags: buildAutomaticProductTags({
      name: product.name,
      sku: product.sku,
      categoryName: product.category.name,
      attributes: product.attributes,
      specifications: product.specifications,
      variantOptions: product.variantOptions,
    }),
    attributes: product.attributes,
    specifications: product.specifications,
    variantOptions: product.variantOptions,
    stockQuantity: product.stockQuantity,
  })
  const seoTitle = product.metaTitle?.trim() || generated.title
  const storedMetaDescription = product.metaDescription?.trim()
  const seoDescription = storedMetaDescription && !isLegacyGeneratedProductDescription(storedMetaDescription, product.name)
    ? storedMetaDescription
    : generated.description

  return {
    title: { absolute: seoTitle },
    description: seoDescription,
    keywords: generated.searchTerms,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
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
      title: seoTitle,
      description: seoDescription,
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
