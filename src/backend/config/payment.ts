/**
 * Payment Gateway Configuration
 *
 * Available payment methods for the Boilabin marketplace.
 */

import type { PaymentGateway } from '@/backend/types/payment'
import { PAYMENT_ASSETS } from '@/shared/assets'

const BANGLADESH_ONLINE_GATEWAY_READY =
  process.env.NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS === 'true'

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
    isAvailable: BANGLADESH_ONLINE_GATEWAY_READY,
    description: BANGLADESH_ONLINE_GATEWAY_READY
      ? 'Pay via bKash mobile banking'
      : 'Online checkout popup will be enabled after gateway setup',
    disabledReason: BANGLADESH_ONLINE_GATEWAY_READY
      ? undefined
      : 'bKash checkout is not configured yet',
    badge: BANGLADESH_ONLINE_GATEWAY_READY ? undefined : 'Coming soon',
  },
  {
    id: 'NAGAD',
    name: 'Nagad',
    logo: PAYMENT_ASSETS.NAGAD.src,
    isAvailable: BANGLADESH_ONLINE_GATEWAY_READY,
    description: BANGLADESH_ONLINE_GATEWAY_READY
      ? 'Pay via Nagad mobile banking'
      : 'Online checkout popup will be enabled after gateway setup',
    disabledReason: BANGLADESH_ONLINE_GATEWAY_READY
      ? undefined
      : 'Nagad checkout is not configured yet',
    badge: BANGLADESH_ONLINE_GATEWAY_READY ? undefined : 'Coming soon',
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
