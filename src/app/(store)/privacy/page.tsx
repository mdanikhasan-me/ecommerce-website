import type { Metadata } from 'next'
import { CONTACT_EMAIL } from '@/shared/contact'
import { ContentPageShell } from '@/frontend/components/content/ContentPageShell'

export const metadata: Metadata = { title: 'Boilabin Privacy Policy' }

export default function PrivacyPage() {
  return (
    <ContentPageShell
      eyebrow="Privacy policy"
      title="How customer data is collected, used, and protected."
      description="This page explains what information Boilabin collects, why it is needed, and the steps taken to keep customer data safer across the platform."
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
              <li>Payment method metadata processed through secure gateways</li>
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
                Passwords are stored as hashes, and payment details are processed through payment
                partners instead of being stored directly by us.
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
                For privacy related questions, contact {CONTACT_EMAIL}. We also use essential cookies
                for authentication and cart functions, while analytics cookies help us improve the
                storefront experience.
              </p>
            </>
          ),
        },
      ]}
    />
  )
}
