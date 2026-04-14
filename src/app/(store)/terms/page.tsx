import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service | Boilabin' }
export default function TermsPage() {
  return (
    <div className="container-site py-12">
      <div className="max-w-3xl prose prose-sm max-w-none">
        <h1 className="font-display text-3xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: January 2025</p>
        <p>By accessing and using Boilabin (&quot;the Platform&quot;), you agree to these Terms of Service. Please read them carefully.</p>
        <h2 className="font-display text-xl font-semibold mt-8">1. Acceptance of Terms</h2>
        <p>By creating an account or placing an order on Boilabin, you agree to be bound by these terms and our Privacy Policy.</p>
        <h2 className="font-display text-xl font-semibold mt-6">2. Account Responsibility</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized use.</p>
        <h2 className="font-display text-xl font-semibold mt-6">3. Product Information</h2>
        <p>We strive for accuracy in all product descriptions, prices, and availability. We reserve the right to correct errors and cancel orders placed at incorrect prices.</p>
        <h2 className="font-display text-xl font-semibold mt-6">4. Orders & Payments</h2>
        <p>All orders are subject to acceptance and availability. Payment must be completed before dispatch for online payment methods. Cash on Delivery is subject to a delivery charge.</p>
        <h2 className="font-display text-xl font-semibold mt-6">5. Returns & Refunds</h2>
        <p>We offer a 7-day return window for most products. Please see our Return Policy for full details on eligible items and conditions.</p>
        <h2 className="font-display text-xl font-semibold mt-6">6. Intellectual Property</h2>
        <p>All content on the Boilabin platform, including text, images, logos, and design, is owned by Boilabin or our licensors. Unauthorized reproduction is prohibited.</p>
        <h2 className="font-display text-xl font-semibold mt-6">7. Limitation of Liability</h2>
        <p>Boilabin is not liable for indirect, incidental, or consequential damages arising from use of the platform, to the maximum extent permitted by Bangladeshi law.</p>
        <h2 className="font-display text-xl font-semibold mt-6">8. Governing Law</h2>
          <p>These terms are governed by the laws of the People&apos;s Republic of Bangladesh.</p>
        <p className="text-muted-foreground">For questions about these terms, contact: legal@boilabin.com</p>
      </div>
    </div>
  )
}
