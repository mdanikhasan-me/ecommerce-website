import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE } from '@/shared/contact'
import { BRAND_ASSETS } from '@/shared/assets'
import { getSiteUrl, toAbsoluteUrl } from '@/backend/seo/urls'
import { indexableRobots } from '@/backend/seo/robots'

/**
 * SEO Constants
 *
 * Centralized SEO configuration values used across all metadata generators.
 * Optimized for Bangladesh e-commerce with bilingual support.
 */

const siteUrl = getSiteUrl()

export const SEO = {
  siteName: 'Boilabin',
  siteUrl,
  locale: 'en_BD',
  alternateLocale: 'bn_BD',
  currency: 'BDT',
  country: 'BD',
  language: 'en',

  defaultTitle: 'Boilabin, Online Shopping in Bangladesh',
  titleTemplate: '%s, Boilabin',
  defaultDescription:
    'Browse electronics, fashion, home appliances, and everyday products in Bangladesh. Orders over Tk 2,000 qualify for free delivery, and cash on delivery is available.',

  baseKeywords: [
    'online shopping bangladesh',
    'buy online bd',
    'product price bangladesh',
    'price in bd',
    'boilabin',
    'online shop dhaka',
    'free delivery bangladesh',
    'cash on delivery bd',
    'bangladesh ecommerce payment options',
  ],

  organization: {
    name: 'Boilabin',
    legalName: 'Boilabin',
    url: siteUrl,
    logo: toAbsoluteUrl(BRAND_ASSETS.mark, siteUrl) ?? `${siteUrl}/`,
    email: CONTACT_EMAIL,
    phone: CONTACT_PHONE,
    address: {
      '@type': 'PostalAddress' as const,
      streetAddress: CONTACT_ADDRESS,
      addressLocality: 'Dhaka',
      addressRegion: 'Dhaka Division',
      addressCountry: 'BD',
    },
    sameAs: [] as string[],
  },

  og: {
    type: 'website' as const,
    images: [
      {
        url: toAbsoluteUrl('/opengraph-image', siteUrl) ?? `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Boilabin, Online Shopping in Bangladesh',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image' as const,
    site: '@boilabin',
    creator: '@boilabin',
  },

  robots: indexableRobots,
} as const
