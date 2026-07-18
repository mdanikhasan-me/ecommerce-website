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
    <div className="bg-[#fdfdfc]">
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
      <div className="container-site py-10 sm:py-14 lg:py-[4.75rem]">
        <div className="mx-auto w-full max-w-[84rem]">
          <header className="mx-auto max-w-[40rem] text-center">
            <h1 className="font-display text-[2.25rem] font-semibold leading-tight tracking-[-0.035em] text-[#111318] sm:text-[2.75rem]">
              Get In Touch
            </h1>
            <p className="mx-auto mt-3 max-w-[30rem] text-[15px] leading-6 text-[#68707d] sm:text-base">
              We are here to help with anything you need. Choose the best way to reach us.
            </p>
          </header>

          <ContactForm />
        </div>
      </div>
    </div>
  )
}
