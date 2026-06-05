import type { Metadata } from 'next'
import { FAQContent, type FAQSection } from '@/frontend/components/content/FAQContent'
import { JsonLd, generateFAQJsonLd, generatePageMetadata } from '@/backend/seo'

export const metadata: Metadata = generatePageMetadata(
  'Boilabin FAQ',
  'Answers about Boilabin orders, delivery, payments, returns, product details, and account support.',
  '/faq',
)

const FAQS: FAQSection[] = [
  {
    category: 'Orders and Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Delivery timing depends on the order address, item availability, holidays, and fulfillment capacity. Review the shipping page and checkout details before placing an order.' },
      { q: 'How much is the delivery fee?', a: 'Delivery is free on orders over Tk 2,000. Below that, delivery is Tk 60.' },
      { q: 'Can I track my order?', a: 'Signed-in customers can check order status from My Account and Orders. Tracking details appear there when they are available.' },
      { q: 'Can I change or cancel my order?', a: 'Orders can be modified or cancelled within 1 hour of placement. After that, contact our support team as soon as possible.' },
    ],
  },
  {
    category: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'Cash on Delivery is available now. Online payment options are shown at checkout when they are available.' },
      { q: 'How are online payment options handled?', a: 'Online payment options appear only when they are available in the checkout flow. Cash on Delivery remains available for eligible orders.' },
      { q: 'Do I get an order confirmation?', a: 'Yes, an order confirmation is created after checkout with the order and payment details available for that order.' },
    ],
  },
  {
    category: 'Returns and Refunds',
    items: [
      { q: 'What is the return policy?', a: 'We offer a seven day return window for most products. Items must be in original, unused condition with all accessories and packaging.' },
      { q: 'How do I return a product?', a: 'Go to My Account, then Orders, then select your order and request a return. If the request is approved, return or pickup instructions are shared with you.' },
      { q: 'When will I get my refund?', a: 'Refund timing depends on the return review, item inspection, and refund method. Support shares the next step after the request is reviewed.' },
    ],
  },
  {
    category: 'Products and Details',
    items: [
      { q: 'Where can I check product details?', a: 'Review each product page for images, price, availability, category, variant, and description details before ordering.' },
      { q: 'Do products come with warranty?', a: 'Warranty or return notes should be checked on the product page or with support before ordering.' },
      { q: 'Can I find a product that is out of stock?', a: 'You can request to be notified when a product comes back in stock. Use the Notify Me button on the product page.' },
    ],
  },
  {
    category: 'Account and Security',
    items: [
      { q: 'How do I get help with my password?', a: 'Contact support with the email address on your account. The team will help you recover access safely.' },
      { q: 'Can I shop without creating an account?', a: 'You can browse products without an account, but you must sign in or create an account before placing an order.' },
      { q: 'Where can I read about personal data?', a: 'See the Privacy Policy for the current explanation of account, order, and contact data handling.' },
    ],
  },
]

export default function FAQPage() {
  const faqItems = FAQS.flatMap((section) => section.items.map((item) => ({
    question: item.q,
    answer: item.a,
  })))

  return (
    <div className="container-site py-12 lg:py-16">
      <JsonLd data={generateFAQJsonLd(faqItems)} />
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Everything you need to know about shopping on Boilabin.</p>
        </div>

        <FAQContent sections={FAQS} />

        <div className="mt-10 rounded-[24px] border border-border/70 bg-secondary/55 p-6 text-center">
          <p className="mb-1 font-semibold">Still have questions?</p>
          <p className="text-sm text-muted-foreground">Our team is ready to help.</p>
          <a href="/contact" className="btn-primary mt-4 inline-flex">Contact Support</a>
        </div>
      </div>
    </div>
  )
}
