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
    <div className="bg-white">
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
      <div className="container-site py-12 sm:py-14 lg:py-20">
        <header className="mx-auto max-w-[48rem] text-center">
          <h1 className="font-display text-[2.2rem] font-medium leading-tight tracking-normal text-[#20232d] sm:text-[2.85rem]">
            Get In Touch
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-[#4b5563] sm:text-base">
            Whether it is a question about products, shipping, returns, or anything else, our team is happy to help.
          </p>
        </header>

        <ContactForm />
      </div>
    </div>
  )
}
