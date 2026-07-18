import type { Metadata } from 'next'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { ContentPageShell } from '@/frontend/components/content/ContentPageShell'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Payment Information',
  'Learn how payment works on Boilabin, including cash on delivery, order confirmation, future online payment support, and payment safety.',
  '/payments',
)

export default function PaymentsPage() {
  return (
    <>
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin Payment Information',
            description: 'Learn how payment works on Boilabin, including cash on delivery, order confirmation, future online payment support, and payment safety.',
            path: '/payments',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Payments', url: '/payments' },
          ]),
        ]}
      />
      <ContentPageShell
        title="Simple cash on delivery payment."
        description="Boilabin currently supports cash on delivery. You place the order online, confirm your delivery details, and pay when the order reaches you."
        updatedAt="July 2026"
        highlights={[
          { label: 'Method', value: 'Cash on delivery' },
          { label: 'Online payment', value: 'Not active yet' },
          { label: 'Confirmation', value: 'Order total shown before placing order' },
        ]}
        sections={[
          {
            id: 'cash-on-delivery',
            title: 'Cash on delivery',
            body: (
              <p>
                Cash on delivery means you do not need to pay online before the order is delivered. Complete checkout
                with your delivery address and phone number, then pay the final order amount when the delivery arrives.
              </p>
            ),
          },
          {
            id: 'order-total',
            title: 'Order total and confirmation',
            body: (
              <p>
                Your order total is shown before you place the order. After checkout, Boilabin creates an order
                confirmation with the products, quantity, delivery address, phone number, delivery fee where applicable,
                and total amount.
              </p>
            ),
          },
          {
            id: 'online-payment',
            title: 'Online payment status',
            body: (
              <p>
                Online payment is not active yet. When online payment is ready, it will appear as a checkout option.
                We will add it only when payment verification, order confirmation, refund handling, and support workflows
                are reliable.
              </p>
            ),
          },
          {
            id: 'payment-safety',
            title: 'Payment safety',
            body: (
              <p>
                Always confirm the order total before paying at delivery. If anything looks different from the order
                confirmation, contact Boilabin support with your order number before completing payment.
              </p>
            ),
          },
        ]}
        supportTitle="Need help with payment?"
        supportCopy="If your order total, delivery fee, or confirmation looks incorrect, contact support with your order number."
        showOnThisPageNav={false}
      />
    </>
  )
}
