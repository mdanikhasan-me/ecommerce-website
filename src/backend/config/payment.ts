/**
 * Payment Gateway Configuration
 *
 * Available payment methods for the BoilaBin marketplace.
 */

import type { PaymentGateway } from '@/backend/types/payment'

export const PAYMENT_GATEWAYS: PaymentGateway[] = [
  { id: 'CASH_ON_DELIVERY', name: 'Cash on Delivery', logo: '/icons/cod.svg', isAvailable: true, description: 'Pay when your order arrives' },
  { id: 'BKASH', name: 'bKash', logo: '/icons/bkash.svg', isAvailable: true, description: 'Pay via bKash mobile banking' },
  { id: 'NAGAD', name: 'Nagad', logo: '/icons/nagad.svg', isAvailable: true, description: 'Pay via Nagad mobile banking' },
  { id: 'SSLCOMMERZ', name: 'Card / Online Banking', logo: '/icons/sslcommerz.svg', isAvailable: true, description: 'Visa, Mastercard, internet banking' },
  { id: 'STRIPE', name: 'International Card', logo: '/icons/stripe.svg', isAvailable: false, description: 'Coming soon' },
]
