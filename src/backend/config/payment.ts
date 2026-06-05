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
    logos: [PAYMENT_ASSETS.CASH_ON_DELIVERY],
    isAvailable: true,
    description: 'Pay when your order arrives',
  },
  {
    id: 'BKASH',
    name: 'bKash',
    logos: [PAYMENT_ASSETS.BKASH],
    isAvailable: BANGLADESH_ONLINE_GATEWAY_READY,
    description: BANGLADESH_ONLINE_GATEWAY_READY
      ? 'Pay via bKash mobile banking'
      : 'This option is not available for the current checkout',
    disabledReason: BANGLADESH_ONLINE_GATEWAY_READY
      ? undefined
      : 'bKash checkout is unavailable',
    badge: BANGLADESH_ONLINE_GATEWAY_READY ? undefined : 'Unavailable',
  },
  {
    id: 'NAGAD',
    name: 'Nagad',
    logos: [PAYMENT_ASSETS.NAGAD],
    isAvailable: BANGLADESH_ONLINE_GATEWAY_READY,
    description: BANGLADESH_ONLINE_GATEWAY_READY
      ? 'Pay via Nagad mobile banking'
      : 'This option is not available for the current checkout',
    disabledReason: BANGLADESH_ONLINE_GATEWAY_READY
      ? undefined
      : 'Nagad checkout is unavailable',
    badge: BANGLADESH_ONLINE_GATEWAY_READY ? undefined : 'Unavailable',
  },
  {
    id: 'STRIPE',
    name: 'International Card',
    logos: [PAYMENT_ASSETS.VISA, PAYMENT_ASSETS.MASTERCARD],
    isAvailable: false,
    description: 'Visa, Mastercard, and international cards',
    badge: 'Unavailable',
  },
]
