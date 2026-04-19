import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE } from '@/shared/contact'

/**
 * Site Configuration
 *
 * Centralized constants for the Boilabin marketplace.
 * Update these values to rebrand or reconfigure the platform.
 */

export const siteConfig = {
  name: 'Boilabin',
  description: "Bangladesh's premium online marketplace",
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  locale: 'en-BD',
  currency: 'BDT',
  currencySymbol: 'Tk',

  contact: {
    email: CONTACT_EMAIL,
    support: CONTACT_EMAIL,
    phone: CONTACT_PHONE,
    address: CONTACT_ADDRESS,
  },

  social: {
    facebook: '#',
    instagram: '#',
    twitter: '#',
    youtube: '#',
  },

  shipping: {
    freeShippingMin: 2000,   // Tk 2,000 for free shipping
    baseFee: 60,             // Tk 60 base shipping fee
  },

  limits: {
    maxCompareItems: 4,
    maxCartQuantity: 10,
    reviewsPerPage: 10,
    productsPerPage: 24,
  },
} as const
