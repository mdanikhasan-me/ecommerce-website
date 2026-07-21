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
    <main className="bg-white text-foreground">
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
      <div className="container-site py-7 sm:py-9 lg:py-10">
        <div className="w-full">
          <header className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-[-0.045em] sm:text-5xl">
              Get In Touch
            </h1>
            <p className="mx-auto mt-3 max-w-[30rem] text-sm leading-6 text-muted-foreground sm:text-base">
              We are here to help with anything you need. Choose the best way to reach us.
            </p>
          </header>

          <ContactForm />
        </div>
      </div>
    </main>
  )
}
