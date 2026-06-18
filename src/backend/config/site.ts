import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE } from '@/shared/contact'

/**
 * Site Configuration
 *
 * Centralized constants for the Boilabin marketplace.
 * Update these values to rebrand or reconfigure the platform.
 */

export const siteConfig = {
  name: 'Boilabin',
  description: 'Bangladesh-based online marketplace',
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
    freeShippingMin: 2000,   // Free standard delivery on orders over Tk 2,000
    baseFee: 100,            // Standard delivery rate (inside Dhaka) used as the headline figure
    dhakaFee: 100,           // Standard delivery inside Dhaka
    outsideDhakaFee: 150,    // Standard delivery outside Dhaka
  },

  limits: {
    maxCompareItems: 4,
    maxCartQuantity: 10,
    reviewsPerPage: 10,
    productsPerPage: 24,
  },
} as const
