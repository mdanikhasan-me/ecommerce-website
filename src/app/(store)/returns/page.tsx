import type { Metadata } from 'next'
import { generatePageMetadata } from '@/backend/seo'
import { CONTACT_EMAIL, CONTACT_PHONE } from '@/shared/contact'
import { ContentPageShell } from '@/frontend/components/content/ContentPageShell'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Returns and Refund Policy',
  'Read Boilabin return eligibility, refund timelines, exclusions, and support steps before requesting a return.',
  '/returns',
)

export default function ReturnsPage() {
  return (
    <ContentPageShell
      eyebrow="Refund policy"
      title="Simple return rules with a cleaner refund process."
      description="This page explains which items can be returned, how the request flow works, and when customers should expect a refund after approval."
      updatedAt="January 2025"
      sections={[
        {
          id: 'eligible',
          title: 'Eligible for return',
          body: (
            <ul>
              <li>Items received damaged or defective</li>
              <li>Wrong product delivered</li>
              <li>Products that materially differ from the listing description</li>
              <li>Unused items in original packaging submitted within the return window</li>
            </ul>
          ),
        },
        {
          id: 'not-eligible',
          title: 'Not eligible for return',
          body: (
            <ul>
              <li>Items reported after the return window closes</li>
              <li>Products missing original packaging or accessories</li>
              <li>Damage caused by customer misuse</li>
              <li>Perishable goods, software, or digital products</li>
              <li>Undergarments and intimate apparel for hygiene reasons</li>
            </ul>
          ),
        },
        {
          id: 'process',
          title: 'How the process works',
          body: (
            <ol>
              <li>Open your account order history and choose the relevant order.</li>
              <li>Select the return request action and choose the reason.</li>
              <li>Our team reviews the request, usually within 24 hours.</li>
              <li>If approved, pickup or return instructions are shared with you.</li>
              <li>The refund is released after item inspection is complete.</li>
            </ol>
          ),
        },
        {
          id: 'timeline',
          title: 'Refund timeline',
          body: (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Bank transfer', '3 to 5 business days'],
                  ['Cash on delivery orders', 'Bank transfer within 3 to 5 business days'],
                ].map(([method, time]) => (
                  <div
                    key={method}
                    className="rounded-[22px] border border-border/70 bg-background/70 px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-foreground">{method}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{time}</p>
                  </div>
                ))}
              </div>
              <p>
                For return requests, contact {CONTACT_EMAIL} or call {CONTACT_PHONE}.
              </p>
            </>
          ),
        },
      ]}
      supportTitle="Need help with a return?"
      supportCopy="If something is unclear, our support team can guide you through the request and refund steps."
    />
  )
}
