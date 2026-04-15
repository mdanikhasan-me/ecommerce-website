import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE } from '@/shared/contact'

/**
 * SEO Constants
 *
 * Centralized SEO configuration values used across all metadata generators.
 * Optimized for Bangladesh e-commerce with bilingual (English + Bangla) support.
 */

export const SEO = {
  siteName: 'BoilaBin',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://boilabin.com',
  locale: 'en_BD',
  alternateLocale: 'bn_BD',
  currency: 'BDT',
  country: 'BD',
  language: 'en',

  // Default meta
  defaultTitle: 'BoilaBin | Shop Quality Products Online in Bangladesh',
  titleTemplate: '%s | BoilaBin',
  defaultDescription:
    'Shop electronics, fashion, home appliances & more at the best prices in Bangladesh. Free delivery on orders over ৳2,000. Cash on delivery, bKash & Nagad accepted.',

  // Bangladesh-specific keywords (bilingual, what people actually search)
  baseKeywords: [
    'online shopping bangladesh',
    'buy online bd',
    'best price bangladesh',
    'price in bd',
    'boilabin',
    'online shop dhaka',
    'free delivery bangladesh',
    'cash on delivery bd',
    'bkash payment online shopping',
    'অনলাইন শপিং বাংলাদেশ',
    'কিনুন অনলাইনে',
    'সেরা দাম বাংলাদেশ',
  ],

  // Organization info for Schema.org
  organization: {
    name: 'BoilaBin',
    legalName: 'BoilaBin',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://boilabin.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://boilabin.com'}/logo.png`,
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

  // Open Graph defaults
  og: {
    type: 'website' as const,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://boilabin.com'}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'BoilaBin | Shop Quality Products Online in Bangladesh',
      },
    ],
  },

  // Twitter defaults
  twitter: {
    card: 'summary_large_image' as const,
    site: '@boilabin',
    creator: '@boilabin',
  },

  // Robots defaults
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
} as const
