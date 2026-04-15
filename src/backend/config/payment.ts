/**
 * Payment Gateway Configuration
 *
 * Available payment methods for the BoilaBin marketplace.
 */

import type { PaymentGateway } from '@/backend/types/payment'
import { PAYMENT_ASSETS } from '@/shared/assets'

export const PAYMENT_GATEWAYS: PaymentGateway[] = [
  {
    id: 'CASH_ON_DELIVERY',
    name: 'Cash on Delivery',
    logo: PAYMENT_ASSETS.CASH_ON_DELIVERY.src,
    isAvailable: true,
    description: 'Pay when your order arrives',
  },
  {
    id: 'BKASH',
    name: 'bKash',
    logo: PAYMENT_ASSETS.BKASH.src,
    isAvailable: true,
    description: 'Pay via bKash mobile banking',
  },
  {
    id: 'NAGAD',
    name: 'Nagad',
    logo: PAYMENT_ASSETS.NAGAD.src,
    isAvailable: true,
    description: 'Pay via Nagad mobile banking',
  },
  {
    id: 'SSLCOMMERZ',
    name: 'Card / Online Banking',
    logo: PAYMENT_ASSETS.SSLCOMMERZ.src,
    isAvailable: false,
    description: 'Visa, Mastercard, internet banking',
  },
  {
    id: 'STRIPE',
    name: 'International Card',
    logo: PAYMENT_ASSETS.STRIPE.src,
    isAvailable: false,
    description: 'Coming soon',
  },
]
