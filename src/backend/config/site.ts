/**
 * Site Configuration
 *
 * Centralized constants for the BoilaBin marketplace.
 * Update these values to rebrand or reconfigure the platform.
 */

export const siteConfig = {
  name: 'BoilaBin',
  description: "Bangladesh's premium online marketplace",
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  locale: 'en-BD',
  currency: 'BDT',
  currencySymbol: '৳',

  contact: {
    email: 'hello@boilabin.com',
    support: 'support@boilabin.com',
    phone: '+880 1700-000000',
    address: 'Dhaka, Bangladesh',
  },

  social: {
    facebook: '#',
    instagram: '#',
    twitter: '#',
    youtube: '#',
  },

  shipping: {
    freeShippingMin: 2000,   // ৳2,000 for free shipping
    baseFee: 60,             // ৳60 base shipping fee
  },

  limits: {
    maxCompareItems: 4,
    maxCartQuantity: 10,
    reviewsPerPage: 10,
    productsPerPage: 24,
  },
} as const
