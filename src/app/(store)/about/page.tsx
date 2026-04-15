import type { Metadata } from 'next'
import { ContentPageShell } from '@/frontend/components/content/ContentPageShell'

export const metadata: Metadata = { title: 'About Boilabin' }

export default function AboutPage() {
  return (
    <ContentPageShell
      eyebrow="About Boilabin"
      title="A cleaner online shopping experience for Bangladesh."
      description="Boilabin is being built around trust, clarity, and better product discovery so customers can shop with more confidence from the first click to the final delivery."
      highlights={[
        { label: 'Focus', value: 'Authentic products and a more polished storefront' },
        { label: 'Coverage', value: 'Fast delivery across Bangladesh with tracked fulfillment' },
        { label: 'Support', value: 'Straightforward service before and after checkout' },
      ]}
      sections={[
        {
          id: 'story',
          title: 'Our story',
          body: (
            <>
              <p>
                Boilabin started with a simple goal: make online shopping feel more reliable,
                more premium, and far less confusing for customers in Bangladesh.
              </p>
              <p>
                Instead of overwhelming people with messy listings and inconsistent storefronts,
                we want the experience to feel curated. The focus is better presentation,
                clearer product information, and service that still feels human after payment.
              </p>
            </>
          ),
        },
        {
          id: 'promise',
          title: 'What customers should expect',
          body: (
            <ul>
              <li>Authentic products sourced through trusted channels</li>
              <li>Clear pricing without hidden surprises at checkout</li>
              <li>Delivery updates that stay transparent from dispatch to handoff</li>
              <li>Returns and refunds explained in plain language</li>
              <li>Support that actually responds when customers need help</li>
            </ul>
          ),
        },
        {
          id: 'vision',
          title: 'Where we are going',
          body: (
            <>
              <p>
                The long term vision is not just a store with products on shelves. It is a
                marketplace that earns trust over time through better design, better operations,
                and better seller standards.
              </p>
              <p>
                We want Boilabin to feel modern and premium without becoming difficult to use.
                That balance matters just as much as the products themselves.
              </p>
            </>
          ),
        },
      ]}
    />
  )
}
