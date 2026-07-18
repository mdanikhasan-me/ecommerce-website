import type { Metadata } from 'next'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'
import { ContentPageShell } from '@/frontend/components/content/ContentPageShell'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin Privacy Policy',
  'Learn what customer information Boilabin collects, how it is used, and how account and order data is protected.',
  '/privacy',
)

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin Privacy Policy',
            description: 'Learn what customer information Boilabin collects, how it is used, and how account and order data is protected.',
            path: '/privacy',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'Privacy Policy', url: '/privacy' },
          ]),
        ]}
      />
      <ContentPageShell
      title="What we collect, and why."
      description="The information Boilabin collects when you shop, how we use it to get your order to you, and how we keep it safe."
      updatedAt="January 2025"
      sections={[
        {
          id: 'collect',
          title: 'Information we collect',
          body: (
            <ul>
              <li>Account details such as name, email, phone number, and password hash</li>
              <li>Delivery addresses and order history</li>
              <li>Product preferences and storefront activity</li>
              <li>Payment and fulfillment details needed to complete cash on delivery orders</li>
              <li>Device and browser information used for analytics and fraud prevention</li>
            </ul>
          ),
        },
        {
          id: 'use',
          title: 'How the information is used',
          body: (
            <ul>
              <li>Processing orders and arranging delivery</li>
              <li>Sending order updates, alerts, and support communication</li>
              <li>Improving recommendations, discovery, and site performance</li>
              <li>Detecting fraud, abuse, and suspicious account activity</li>
              <li>Meeting legal and operational requirements</li>
            </ul>
          ),
        },
        {
          id: 'security',
          title: 'Security and retention',
          body: (
            <>
              <p>
                Boilabin uses HTTPS and other common security measures to protect data in transit.
                Passwords are stored as hashes, and we do not store card or mobile wallet numbers.
              </p>
              <p>
                Data is retained only as long as it is needed for order history, customer service,
                fraud prevention, or legal compliance.
              </p>
            </>
          ),
        },
        {
          id: 'rights',
          title: 'Your rights and contact',
          body: (
            <>
              <p>
                You may request access to your personal information, ask for corrections, or request
                deletion where applicable.
              </p>
              <p>
                For privacy questions, use the contact page. We also use essential cookies for
                authentication and cart functions, while analytics cookies help us improve the
                storefront experience.
              </p>
            </>
          ),
        },
      ]}
    />
    </>
  )
}
