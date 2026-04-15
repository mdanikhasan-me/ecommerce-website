import type { Metadata } from 'next'
import { CONTACT_EMAIL } from '@/shared/contact'
import { ContentPageShell } from '@/frontend/components/content/ContentPageShell'

export const metadata: Metadata = { title: 'Boilabin Terms of Service' }

export default function TermsPage() {
  return (
    <ContentPageShell
      eyebrow="Terms of service"
      title="Clear marketplace rules, written to be readable."
      description="These terms explain how Boilabin works, what customers can expect from us, and the responsibilities that come with using the platform."
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
                Cash on delivery may be offered depending on the order and delivery area. Online
                payment methods are only considered complete after successful confirmation.
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
                For questions, contact {CONTACT_EMAIL}.
              </p>
            </>
          ),
        },
      ]}
    />
  )
}
