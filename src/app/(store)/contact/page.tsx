import type { Metadata } from 'next'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generateOrganizationJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { ContactForm } from '@/frontend/components/content/ContactForm'

export const metadata: Metadata = generatePageMetadata(
  'Contact Boilabin',
  'Contact Boilabin support for order issues, returns, product questions, payment help, and customer service.',
  '/contact',
)

export default function ContactPage() {
  return (
    <div className="container-site py-8 sm:py-10 lg:py-16">
      <JsonLd
        data={[
          generateWebPageJsonLd({
            type: 'ContactPage',
            name: 'Contact Boilabin',
            description: 'Contact Boilabin support for order issues, returns, product questions, payment help, and customer service.',
            path: '/contact',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Contact', url: '/contact' },
          ]),
          generateOrganizationJsonLd(),
        ]}
      />
      <header className="max-w-[48rem]">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">Contact</p>
        <h1 className="mt-3 font-display text-[1.75rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-[2.5rem]">
          Talk to us.
        </h1>
        <p className="mt-5 max-w-[22rem] text-[13px] leading-7 text-muted-foreground sm:mt-4 sm:max-w-[49rem] sm:text-[17px] sm:leading-8">
          Question about an order, a return, a product, or your account? Message us on WhatsApp, call during business
          hours, or send the form below.
        </p>
      </header>

      <div className="mt-9 lg:mt-12">
        <ContactForm />
      </div>
    </div>
  )
}
