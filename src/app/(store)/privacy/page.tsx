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
  'Boilabin Privacy Policy',
  'Learn what customer information Boilabin collects, how it is used, and how account and order data is protected.',
  '/privacy',
)

const PRIVACY_QUESTIONS = [
  ['What information does Boilabin collect?', 'We collect account details, delivery addresses, order history, necessary fulfilment details, and limited device or browser information.'],
  ['Does Boilabin store card or mobile-wallet numbers?', 'No. We do not store card or mobile-wallet numbers.'],
  ['Why is my information used?', 'It helps us process orders, arrange delivery, provide support, improve the storefront, and help prevent fraud or abuse.'],
  ['Can I ask to access or correct my information?', 'Yes. Contact support to request access, a correction, or deletion where applicable.'],
] as const

export default function PrivacyPage() {
  return (
    <main className="bg-white text-[#111827]">
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin Privacy Policy',
            description: 'Learn what customer information Boilabin collects, how it is used, and how account and order data is protected.',
            path: '/privacy',
          }),
          generateBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Privacy Policy', url: '/privacy' }]),
        ]}
      />

      <div className="container-site py-8 sm:py-10 lg:py-14">
        <article className="w-full max-w-none">
          <h1 className="font-display text-[2.4rem] font-semibold leading-tight tracking-normal sm:text-[3rem]">Privacy Policy</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: January 2025</p>
          <p className="mt-6 text-[1.03rem] leading-8 text-[#374151]">This policy explains what information Boilabin collects when you shop, why it is needed, and how it is handled.</p>

          <h2 className="mt-10 text-xl font-semibold leading-7">Information we collect</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[1.03rem] leading-8 text-[#374151]">
            <li>Account details such as name, email address, phone number, and password hash.</li>
            <li>Delivery addresses and order history.</li>
            <li>Product preferences and storefront activity.</li>
            <li>Payment and fulfilment details needed to complete Cash on Delivery orders.</li>
            <li>Device and browser information used for analytics and fraud prevention.</li>
          </ul>

          <h2 className="mt-10 text-xl font-semibold leading-7">How we use information</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[1.03rem] leading-8 text-[#374151]">
            <li>Process orders and arrange delivery.</li>
            <li>Send order updates, alerts, and support communication.</li>
            <li>Improve recommendations, discovery, and site performance.</li>
            <li>Detect fraud, abuse, and suspicious account activity.</li>
            <li>Meet legal and operational requirements.</li>
          </ul>

          <h2 className="mt-10 text-xl font-semibold leading-7">Security and retention</h2>
          <p className="mt-4 text-[1.03rem] leading-8 text-[#374151]">Boilabin uses HTTPS and other common security measures to protect data in transit. Passwords are stored as hashes, and we do not store card or mobile-wallet numbers.</p>
          <p className="mt-5 text-[1.03rem] leading-8 text-[#374151]">Information is retained only for as long as needed for order history, customer service, fraud prevention, or legal compliance.</p>

          <h2 className="mt-10 text-xl font-semibold leading-7">Your choices and contact</h2>
          <p className="mt-4 text-[1.03rem] leading-8 text-[#374151]">You may request access to your personal information, ask for corrections, or request deletion where applicable. Essential cookies support authentication and cart functions; analytics cookies help us improve the storefront experience.</p>
        </article>

        <div className="mt-12"><SupportFaqList questions={PRIVACY_QUESTIONS} heading="Privacy FAQ" /></div>
        <div className="mt-7"><SupportContactBar title="Questions about privacy?" description="Contact support if you need help with your account or personal information." /></div>
      </div>
    </main>
  )
}
