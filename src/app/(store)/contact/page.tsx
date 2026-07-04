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
      <div className="container-site py-10 sm:py-12 lg:py-16">
        <header className="mx-auto max-w-[42rem] text-center">
          <h1 className="font-display text-[2rem] font-medium leading-tight tracking-normal text-[#20232d] sm:text-[2.55rem]">
            Get In Touch
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#4b5563] sm:text-[15px]">
            Whether it is a question about products, shipping, returns, or anything else, our team is happy to help.
          </p>
        </header>

        <ContactForm />
      </div>
    </div>
  )
}
