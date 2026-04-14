import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Privacy Policy | Boilabin' }
export default function PrivacyPage() {
  return (
    <div className="container-site py-12">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>Boilabin ("we", "our", "us") is committed to protecting your privacy. This policy describes how we collect, use, and safeguard your personal information.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Information We Collect</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Account information: name, email, phone, password (hashed)</li>
            <li>Delivery addresses</li>
            <li>Order history and preferences</li>
            <li>Payment method details (processed securely, not stored by us)</li>
            <li>Device and browsing data for analytics</li>
          </ul>
          <h2 className="font-display text-xl font-semibold text-foreground">How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Processing and fulfilling your orders</li>
            <li>Sending order updates and notifications</li>
            <li>Improving our platform and personalizing your experience</li>
            <li>Fraud prevention and security</li>
            <li>Legal compliance</li>
          </ul>
          <h2 className="font-display text-xl font-semibold text-foreground">Data Security</h2>
          <p>We use industry-standard encryption (TLS/HTTPS) for all data transmission. Passwords are hashed using bcrypt. Payment data is processed by certified payment gateways.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting privacy@boilabin.com.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Cookies</h2>
          <p>We use essential cookies for authentication and cart functionality. Analytics cookies help us improve the platform. You may disable non-essential cookies in your browser settings.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Contact</h2>
          <p>For privacy inquiries: privacy@boilabin.com</p>
        </div>
      </div>
    </div>
  )
}
