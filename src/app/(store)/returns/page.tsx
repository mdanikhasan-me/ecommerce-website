import type { Metadata } from 'next'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { ContentPageShell } from '@/frontend/components/content/ContentPageShell'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Returns and Refund Policy',
  'Boilabin accepts returns within seven days of delivery for products that arrive defective or are damaged in transit. With proof, choose a refund or a replacement.',
  '/returns',
)

export default function ReturnsPage() {
  return (
    <>
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin Returns and Refund Policy',
            description: 'Boilabin accepts returns within seven days of delivery for products that arrive defective or are damaged in transit. With proof, choose a refund or a replacement.',
            path: '/returns',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Returns', url: '/returns' },
          ]),
        ]}
      />
      <ContentPageShell
      eyebrow="Returns & refunds"
      title="Seven-day returns for defective or damaged items."
      description="Boilabin accepts returns within seven days of delivery when a product arrives defective or is damaged during delivery. With clear proof of the issue, you can choose a refund or a replacement."
      updatedAt="June 2026"
      highlights={[
        { label: 'Window', value: 'Seven days from the delivery date' },
        { label: 'Covers', value: 'Defective items and delivery damage, with proof' },
        { label: 'Resolution', value: 'Your choice of a refund or a replacement' },
      ]}
      sections={[
        {
          id: 'eligible',
          title: 'What you can return',
          body: (
            <>
              <p>
                A return can be requested within <strong>seven days of delivery</strong> if the product:
              </p>
              <ul>
                <li>arrived <strong>defective</strong> and does not work as described, or</li>
                <li>was <strong>damaged during delivery</strong>.</li>
              </ul>
              <p>
                To process the request, you need to share clear <strong>proof of the issue</strong>, such as
                photos or a short video showing the defect or the delivery damage, along with the packaging.
              </p>
            </>
          ),
        },
        {
          id: 'options',
          title: 'Your options',
          body: (
            <p>
              Once the return is reviewed and approved, you choose how it is resolved: a <strong>refund</strong> of the
              amount paid, or a <strong>replacement</strong> of the same product where stock is available. Tell us which
              option you prefer when you submit the request.
            </p>
          ),
        },
        {
          id: 'not-eligible',
          title: 'What is not covered',
          body: (
            <ul>
              <li>Requests made <strong>after seven days</strong> from the delivery date.</li>
              <li>Change of mind, the wrong size or color chosen, or items you no longer need.</li>
              <li>Items without proof of a manufacturing defect or delivery damage.</li>
              <li>Damage caused by use, mishandling, or accidents after delivery.</li>
            </ul>
          ),
        },
        {
          id: 'process',
          title: 'How to request a return',
          body: (
            <ol>
              <li>Sign in and open <strong>My Account → Orders</strong>.</li>
              <li>Open the relevant order within seven days of delivery and choose <strong>Request a return</strong>.</li>
              <li>Describe the problem and attach clear photos or video as proof.</li>
              <li>Our team reviews the request and shares the next step.</li>
              <li>If approved, we arrange the return or pickup and complete an inspection.</li>
              <li>After inspection, your chosen refund or replacement is processed.</li>
            </ol>
          ),
        },
        {
          id: 'refund',
          title: 'Refunds and replacements',
          body: (
            <>
              <p>
                For cash on delivery orders, support confirms the refund method with you after the returned item is
                inspected. A replacement is shipped once the request is approved and stock is confirmed.
              </p>
              <p>
                To start a return or ask a question, use the contact page and the team will guide you through it.
              </p>
            </>
          ),
        },
      ]}
      supportTitle="Need help with a return?"
      supportCopy="If anything is unclear, our support team can guide you through the request, proof, and refund or replacement steps."
      showOnThisPageNav={false}
    />
    </>
  )
}
