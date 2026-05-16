import type { Metadata } from 'next'
import { generatePageMetadata } from '@/backend/seo'
import { ContactForm } from '@/frontend/components/content/ContactForm'

export const metadata: Metadata = generatePageMetadata(
  'Contact Boilabin',
  'Contact Boilabin support for order issues, returns, product questions, payment help, and customer service.',
  '/contact',
)

export default function ContactPage() {
  return (
    <div className="container-site py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">Contact Us</h1>
          <p className="text-muted-foreground">We&apos;re here to help. Reach out any time.</p>
        </div>

        <ContactForm />
      </div>
    </div>
  )
}
