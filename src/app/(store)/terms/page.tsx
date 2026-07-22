import type { Metadata } from 'next'

import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { SupportContactBar } from '@/frontend/components/content/SupportContactBar'
import { SupportFaqList } from '@/frontend/components/content/SupportFaqList'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Terms of Service',
  'Review the Boilabin shopping terms covering accounts, orders, product information, payments, returns, and platform use.',
  '/terms',
)

const TERMS_QUESTIONS = [
  ['When do these terms apply?', 'They apply when you browse Boilabin, create an account, or place an order.'],
  ['Can an order be cancelled?', 'We may cancel or refuse an order when stock, pricing, or listing information is incorrect or unavailable.'],
  ['Which payment method is active?', 'Cash on Delivery is currently available at checkout.'],
  ['Where can I read about returns?', 'See the Returns page for the current eligibility conditions, exclusions, and return process.'],
] as const

export default function TermsPage() {
  return (
    <main className="bg-white text-[#111827]">
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin Terms of Service',
            description: 'Review the Boilabin shopping terms covering accounts, orders, product information, payments, returns, and platform use.',
            path: '/terms',
          }),
          generateBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Terms of Service', url: '/terms' }]),
        ]}
      />

      <div className="container-site py-8 sm:py-10 lg:py-14">
        <article className="w-full max-w-none">
          <h1 className="font-display text-[2.4rem] font-semibold leading-tight tracking-normal sm:text-[3rem]">Terms of Use</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: January 2025</p>
          <p className="mt-6 text-[1.03rem] leading-8 text-[#374151]">These terms explain the rules that apply when you use Boilabin, create an account, or place an order. By using the site, you agree to them and to our Privacy Policy.</p>

          <h2 className="mt-10 text-xl font-semibold leading-7">Accounts</h2>
          <p className="mt-4 text-[1.03rem] leading-8 text-[#374151]">Keep your login details private and let us know promptly if you suspect unauthorised access. You are responsible for activity completed through your account.</p>

          <h2 className="mt-10 text-xl font-semibold leading-7">Product information and availability</h2>
          <p className="mt-4 text-[1.03rem] leading-8 text-[#374151]">We work to keep product details, prices, images, and stock status accurate. Sometimes a listing may need correction or an item may become unavailable. In those cases, we may update the listing, cancel the order, or contact you with the next step.</p>

          <h2 className="mt-10 text-xl font-semibold leading-7">Orders and payment</h2>
          <p className="mt-4 text-[1.03rem] leading-8 text-[#374151]">Orders are subject to review, acceptance, and availability. The payment instructions displayed at checkout apply to your order. Cash on Delivery is currently the active payment method; any future online payment method is complete only after successful confirmation.</p>

          <h2 className="mt-10 text-xl font-semibold leading-7">Returns and refunds</h2>
          <p className="mt-4 text-[1.03rem] leading-8 text-[#374151]">Eligible products may be returned within the stated return window. The Returns page explains covered cases, exclusions, required proof, and how refunds or replacements are handled.</p>

          <h2 className="mt-10 text-xl font-semibold leading-7">Our content</h2>
          <p className="mt-4 text-[1.03rem] leading-8 text-[#374151]">Boilabin branding, text, interface design, images, and other site content belong to Boilabin or its licensors. They may not be copied, republished, or reused without permission.</p>

          <h2 className="mt-10 text-xl font-semibold leading-7">Liability and governing law</h2>
          <p className="mt-4 text-[1.03rem] leading-8 text-[#374151]">To the maximum extent permitted by law, Boilabin is not liable for indirect, incidental, or consequential loss arising from use of the platform. These terms are governed by the laws of the People&apos;s Republic of Bangladesh.</p>
        </article>

        <div className="mt-12"><SupportFaqList questions={TERMS_QUESTIONS} heading="Terms FAQ" /></div>
        <div className="mt-7"><SupportContactBar title="Questions about these terms?" description="Contact support if you need help understanding an order or account-related term." /></div>
      </div>
    </main>
  )
}
