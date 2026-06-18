import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQContent, type FAQSection } from '@/frontend/components/content/FAQContent'
import {
  JsonLd,
  generateBreadcrumbJsonLd,
  generateFAQJsonLd,
  generatePageMetadata,
  generateWebPageJsonLd,
} from '@/backend/seo'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin FAQ',
  'Answers about Boilabin orders, delivery, payments, returns, product details, and account support.',
  '/faq',
)

const FAQS: FAQSection[] = [
  {
    category: 'Orders and delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Orders inside Dhaka usually arrive within a few working days, and a little longer for other districts. Your estimated timing and fee are shown at checkout before you confirm.' },
      { q: 'How much is the delivery fee?', a: 'Tk 100 inside Dhaka and Tk 150 to other districts. Orders over Tk 2,000 ship free. Express delivery is available in some areas for a fee based on your location.' },
      { q: 'Can I track my order?', a: 'Sign in and open My Account → Orders to see your status, or use the Track Order page with your order number.' },
      { q: 'Can I change or cancel my order?', a: 'Contact us as soon as you can with your order number. We can usually change or cancel an order until it has been packed for delivery.' },
    ],
  },
  {
    category: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'Cash on delivery — you pay when your order reaches you. No online payment is needed to order.' },
      { q: 'Will you add online payment?', a: 'When we add online payment, it will appear as an option at checkout. Until then, every order is cash on delivery.' },
      { q: 'Do I get an order confirmation?', a: 'Yes. As soon as you check out, we create a confirmation with your items, delivery address, and total.' },
    ],
  },
  {
    category: 'Returns and refunds',
    items: [
      { q: 'What is the return policy?', a: 'You have seven days from delivery to report an item that arrived defective or was damaged in transit. Send us proof and choose a refund or a replacement. Requests after seven days are not accepted.' },
      { q: 'How do I return a product?', a: 'Open My Account → Orders within seven days of delivery, choose Request a return, and attach clear photos or a short video. If approved, we share the pickup or return steps.' },
      { q: 'When will I get my refund?', a: 'Once we receive and inspect the item, we confirm your refund or send a replacement. For cash-on-delivery orders we arrange the refund method with you directly.' },
    ],
  },
  {
    category: 'Products and details',
    items: [
      { q: 'Where can I check product details?', a: 'Each product page has the images, price, stock, variants, and full description. Check there before you order.' },
      { q: 'Do products come with a warranty?', a: 'It varies by product. Any warranty or return note is listed on the product page, or ask us before you order.' },
      { q: 'Can I get notified when something is back in stock?', a: 'Yes. Tap Notify Me on a sold-out product page and we will email you when it returns.' },
    ],
  },
  {
    category: 'Account and security',
    items: [
      { q: 'I forgot my password. What do I do?', a: 'Contact us from the email address on your account and we will help you recover access safely.' },
      { q: 'Can I shop without an account?', a: 'You can browse freely, but you will need to sign in or create an account to place an order.' },
      { q: 'How is my personal data handled?', a: 'Our Privacy Policy explains exactly what we collect, why, and how we keep it safe.' },
    ],
  },
]

export default function FAQPage() {
  const faqItems = FAQS.flatMap((section) => section.items.map((item) => ({
    question: item.q,
    answer: item.a,
  })))

  return (
    <div className="container-site py-9 lg:py-14">
      <JsonLd
        data={[
          generateWebPageJsonLd({
            name: 'Boilabin FAQ',
            description: 'Answers about Boilabin orders, delivery, payments, returns, product details, and account support.',
            path: '/faq',
          }),
          generateBreadcrumbJsonLd([
            { name: 'Home', url: '/' },
            { name: 'FAQ', url: '/faq' },
          ]),
          generateFAQJsonLd(faqItems),
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Help &amp; FAQ</p>
          <h1 className="mt-3 font-display text-[2rem] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[2.5rem]">
            Frequently asked questions
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-[17px] sm:leading-8">
            Quick answers about orders, delivery, payment, returns, and your account.
          </p>

          <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-5">
            <p className="font-semibold text-foreground">Still stuck?</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">If your question is not here, our team is happy to help.</p>
            <Link href="/contact" className="btn-primary mt-4 inline-flex">Contact support</Link>
          </div>
        </div>

        <div>
          <FAQContent sections={FAQS} />
        </div>
      </div>
    </div>
  )
}
