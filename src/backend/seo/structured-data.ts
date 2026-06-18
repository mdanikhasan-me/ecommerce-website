/**
 * JSON-LD Structured Data Generators
 *
 * Schema.org markup for search, product discovery, and AI-readable page facts.
 * Keep every field aligned with visible page content or current product inputs:
 *
 * - Product schema with Offer (price, currency BDT, availability)
 * - AggregateRating only when actual rating inputs exist
 * - BreadcrumbList for navigation breadcrumbs
 * - Organization schema for business identity
 * - WebSite with SearchAction for the public search route
 * - FAQPage for visible FAQ content
 *
 * All prices in BDT, all addresses in Bangladesh format.
 */

import { SEO } from './constants'
import { siteConfig } from '@/backend/config/site'
import { canonicalUrl, toAbsoluteUrl } from './urls'
import {
  getProductAvailabilityForJsonLd,
  type ProductLifecycleState,
} from '@/backend/catalog/product-visibility'

// Product JSON-LD
interface ProductJsonLdInput {
  name: string
  slug: string
  description: string
  basePrice: number
  salePrice?: number | null
  images: { url: string }[]
  category: { name: string; slug: string }
  sku?: string
  rating?: number
  reviewCount?: number
  stockQuantity?: number
  lifecycleState?: ProductLifecycleState
  reviews?: {
    rating: number
    body: string
    user: { name?: string | null }
    createdAt: Date
  }[]
}

export function generateProductJsonLd(product: ProductJsonLdInput) {
  const price = product.salePrice ?? product.basePrice
  const productUrl = canonicalUrl(`/products/${product.slug}`)
  const images = product.images
    .map((image) => toAbsoluteUrl(image.url))
    .filter((url): url is string => Boolean(url))
  const availability = getProductAvailabilityForJsonLd({
    stockQuantity: product.stockQuantity,
    lifecycleState: product.lifecycleState,
  })

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    ...(images.length > 0 ? { image: images } : {}),
    sku: product.sku ?? product.slug,
    url: productUrl,
    category: product.category.name,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'BDT',
      price: price.toFixed(2),
      availability,
      seller: {
        '@type': 'Organization',
        name: SEO.organization.name,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: siteConfig.shipping.baseFee.toString(),
          currency: 'BDT',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'BD',
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'BD',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
      },
    },
  }

  // Aggregate ratings are emitted only when product data supplies real rating inputs.
  if (product.rating && product.reviewCount && product.reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviewCount,
      bestRating: '5',
      worstRating: '1',
    }
  }

  // Individual reviews are emitted only when review inputs are available.
  if (product.reviews && product.reviews.length > 0) {
    jsonLd.review = product.reviews.slice(0, 5).map((r) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating.toString(),
        bestRating: '5',
      },
      author: {
        '@type': 'Person',
        name: r.user.name ?? 'Customer',
      },
      reviewBody: r.body,
      datePublished: new Date(r.createdAt).toISOString().split('T')[0],
    }))
  }

  return jsonLd
}

// Breadcrumb JSON-LD
interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.url),
    })),
  }
}

// Organization JSON-LD
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SEO.organization.name,
    legalName: SEO.organization.legalName,
    url: canonicalUrl('/'),
    logo: toAbsoluteUrl(SEO.organization.logo) ?? SEO.organization.logo,
    email: SEO.organization.email,
    telephone: SEO.organization.phone,
    address: SEO.organization.address,
    sameAs: SEO.organization.sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SEO.organization.phone,
      contactType: 'customer service',
      availableLanguage: ['English', 'Bengali'],
      areaServed: 'BD',
    },
  }
}

// WebSite JSON-LD (with SearchAction for Google Sitelinks Searchbox)
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO.siteName,
    url: canonicalUrl('/'),
    description: SEO.defaultDescription,
    inLanguage: ['en', 'bn'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${canonicalUrl('/search')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// Local Business JSON-LD
export function generateLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: SEO.organization.name,
    url: canonicalUrl('/'),
    logo: toAbsoluteUrl(SEO.organization.logo) ?? SEO.organization.logo,
    image: toAbsoluteUrl(SEO.organization.logo) ?? SEO.organization.logo,
    email: SEO.organization.email,
    telephone: SEO.organization.phone,
    address: SEO.organization.address,
    priceRange: 'Tk',
    currenciesAccepted: 'BDT',
    paymentAccepted: 'Cash on Delivery',
    areaServed: {
      '@type': 'Country',
      name: 'Bangladesh',
    },
  }
}

type WebPageJsonLdType = 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage'

interface WebPageJsonLdInput {
  name: string
  description: string
  path: string
  type?: WebPageJsonLdType
}

export function generateWebPageJsonLd({
  name,
  description,
  path,
  type = 'WebPage',
}: WebPageJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description,
    url: canonicalUrl(path),
    inLanguage: SEO.language,
    isPartOf: {
      '@type': 'WebSite',
      name: SEO.siteName,
      url: canonicalUrl('/'),
    },
    publisher: {
      '@type': 'Organization',
      name: SEO.organization.name,
      url: canonicalUrl('/'),
      logo: toAbsoluteUrl(SEO.organization.logo) ?? SEO.organization.logo,
    },
  }
}

// FAQ JSON-LD
interface FAQItem {
  question: string
  answer: string
}

export function generateFAQJsonLd(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

// Collection / ItemList JSON-LD (for category pages)
interface ItemListProduct {
  name: string
  slug: string
  basePrice: number
  salePrice?: number | null
  image?: string
  position: number
}

export function generateItemListJsonLd(
  listName: string,
  products: ItemListProduct[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.map((p) => ({
      '@type': 'ListItem',
      position: p.position,
      item: {
        '@type': 'Product',
        name: p.name,
        url: canonicalUrl(`/products/${p.slug}`),
        ...(toAbsoluteUrl(p.image) ? { image: toAbsoluteUrl(p.image) } : {}),
        offers: {
          '@type': 'Offer',
          priceCurrency: 'BDT',
          price: (p.salePrice ?? p.basePrice).toFixed(2),
        },
      },
    })),
  }
}

interface CategoryListItem {
  name: string
  slug: string
  description?: string | null
  position: number
}

export function generateCategoryListJsonLd(
  listName: string,
  categories: CategoryListItem[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: categories.length,
    itemListElement: categories.map((category) => ({
      '@type': 'ListItem',
      position: category.position,
      item: {
        '@type': 'CollectionPage',
        name: category.name,
        url: canonicalUrl(`/category/${category.slug}`),
        ...(category.description ? { description: category.description } : {}),
      },
    })),
  }
}
