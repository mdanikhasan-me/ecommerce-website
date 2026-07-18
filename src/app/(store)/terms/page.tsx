import type { Metadata } from 'next'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { ContentPageShell } from '@/frontend/components/content/ContentPageShell'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Terms of Service',
  'Review the Boilabin shopping terms covering accounts, orders, product information, payments, returns, and platform use.',
  '/terms',
)

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin Terms of Service',
            description: 'Review the Boilabin shopping terms covering accounts, orders, product information, payments, returns, and platform use.',
            path: '/terms',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Terms of Service', url: '/terms' },
          ]),
        ]}
      />
      <ContentPageShell
      title="The rules for shopping on Boilabin."
      description="What you agree to when you use Boilabin: your account, placing orders, cash-on-delivery payment, returns, and the legal basics."
      updatedAt="January 2025"
      sections={[
        {
          id: 'acceptance',
          title: 'Acceptance of terms',
          body: (
            <p>
              By creating an account, browsing the storefront, or placing an order on Boilabin,
              you agree to be bound by these terms and our privacy policy.
            </p>
          ),
        },
        {
          id: 'account',
          title: 'Account responsibility',
          body: (
            <p>
              You are responsible for maintaining the confidentiality of your login credentials
              and for any activity that takes place under your account. If you suspect unauthorized
              access, contact us immediately.
            </p>
          ),
        },
        {
          id: 'products',
          title: 'Product information and availability',
          body: (
            <>
              <p>
                We work to keep product details, prices, images, and stock status as accurate as
                possible, but we may occasionally need to correct errors or update listings.
              </p>
              <p>
                Boilabin reserves the right to cancel or refuse orders placed against incorrect
                pricing, incomplete information, or unavailable inventory.
              </p>
            </>
          ),
        },
        {
          id: 'orders',
          title: 'Orders and payments',
          body: (
            <>
              <p>
                Orders are subject to review, acceptance, and availability. Payment instructions
                shown during checkout apply to the order you place.
              </p>
              <p>
                Cash on delivery is currently the active checkout method. Any future online payment
                method will only be considered complete after successful confirmation.
              </p>
            </>
          ),
        },
        {
          id: 'returns',
          title: 'Returns and refunds',
          body: (
            <p>
              Most products follow our 7 day return window, subject to eligibility conditions.
              Please review the refund policy page for details on approved return cases, exclusions,
              and refund timelines.
            </p>
          ),
        },
        {
          id: 'property',
          title: 'Intellectual property',
          body: (
            <p>
              All text, branding, interface design, imagery, and site content are owned by
              Boilabin or our licensors. Copying, republishing, or reusing those materials without
              permission is prohibited.
            </p>
          ),
        },
        {
          id: 'liability',
          title: 'Liability and governing law',
          body: (
            <>
              <p>
                To the maximum extent permitted by law, Boilabin is not liable for indirect,
                incidental, or consequential damages resulting from use of the platform.
              </p>
              <p>
                These terms are governed by the laws of the People&apos;s Republic of Bangladesh.
                For questions about these terms, use the contact page.
              </p>
            </>
          ),
        },
      ]}
    />
    </>
  )
}
