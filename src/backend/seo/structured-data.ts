/**
 * JSON-LD Structured Data Generators
 *
 * Schema.org markup for Google Rich Results, Shopping panels, and AI citations.
 * Based on research from Amazon, Daraz, and Google's product schema documentation:
 *
 * - Product schema with Offer (price, currency BDT, availability)
 * - AggregateRating for star ratings in SERPs (20-30% CTR increase)
 * - BreadcrumbList for navigation breadcrumbs in search results
 * - Organization schema for business identity and trust signals
 * - WebSite with SearchAction for Google sitelinks searchbox
 * - FAQPage for FAQ rich snippets
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
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'BD',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
      },
    },
  }

  // AggregateRating (huge CTR boost; shows stars in SERPs)
  if (product.rating && product.reviewCount && product.reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviewCount,
      bestRating: '5',
      worstRating: '1',
    }
  }

  // Individual reviews (Google prefers max 5)
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
