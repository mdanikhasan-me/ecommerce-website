'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/backend/utils'

const FAQS = [
  {
    category: 'Orders & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Delivery within Dhaka city takes 1–2 business days. Other divisions take 2–4 business days. Remote areas may take up to 5 business days.' },
      { q: 'How much is the delivery fee?', a: 'Delivery is FREE on orders over ৳2,000. Below that, a flat fee of ৳60 applies for Dhaka city. Other locations have rates from ৳80–120.' },
      { q: 'Can I track my order?', a: 'Yes! Once your order is shipped, you\'ll receive a tracking number via email/SMS. You can also track from My Account > Orders.' },
      { q: 'Can I change or cancel my order?', a: 'Orders can be modified or cancelled within 1 hour of placement. After that, contact our support team as soon as possible.' },
    ],
  },
  {
    category: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD), bKash, Nagad, and credit/debit cards via SSLCommerz. More methods coming soon.' },
      { q: 'Is it safe to pay online on Boilabin?', a: 'Absolutely. All payments are encrypted with TLS/HTTPS. We never store card details. bKash and Nagad use OTP verification.' },
      { q: 'Do I get a digital receipt?', a: 'Yes, an order confirmation with full payment details is sent to your email immediately after checkout.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is the return policy?', a: 'We offer a 7-day return window for most products. Items must be in original, unused condition with all accessories and packaging.' },
      { q: 'How do I return a product?', a: 'Go to My Account > Orders > Select Order > Request Return. Our team will approve and arrange free pickup within 24 hours.' },
      { q: 'When will I get my refund?', a: 'Refunds are processed within 3–5 business days after we receive and inspect the returned item.' },
    ],
  },
  {
    category: 'Products & Authenticity',
    items: [
      { q: 'Are all products on Boilabin authentic?', a: 'Yes. All products sold by the Boilabin Official Store are 100% authentic. We source directly from authorized distributors and brand representatives.' },
      { q: 'Do products come with warranty?', a: 'Warranty details are listed on each product page. Electronics typically come with the manufacturer\'s standard Bangladesh warranty.' },
      { q: 'Can I find a product that\'s out of stock?', a: 'You can request to be notified when a product comes back in stock. Use the "Notify Me" button on the product page.' },
    ],
  },
  {
    category: 'Account & Security',
    items: [
      { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page and enter your email. You\'ll receive a reset link within a few minutes.' },
      { q: 'Can I shop without creating an account?', a: 'Yes! Guest checkout is available. However, an account lets you track orders, save addresses, and earn rewards.' },
      { q: 'Is my personal data safe?', a: 'Yes. We follow strict data protection practices. Your data is never sold to third parties. See our Privacy Policy for full details.' },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left gap-4"
      >
        <span className="font-medium text-sm pr-4">{q}</span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</div>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="container-site py-12"><div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold mb-2">Frequently Asked Questions</h1>
      <p className="text-muted-foreground mb-10">Everything you need to know about shopping on Boilabin.</p>

      <div className="space-y-8">
        {FAQS.map((section) => (
          <div key={section.category}>
            <h2 className="font-display text-lg font-semibold mb-1 text-primary">{section.category}</h2>
            <div className="bg-card border border-border rounded-2xl px-5">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-secondary rounded-2xl p-6 text-center">
        <p className="font-semibold mb-1">Still have questions?</p>
        <p className="text-muted-foreground text-sm">Our team is ready to help.</p>
        <a href="/contact" className="btn-primary mt-4 inline-flex">Contact Support</a>
      </div>
    </div></div>
  )
}
