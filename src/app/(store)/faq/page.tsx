'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/backend/utils'

const FAQS = [
  {
    category: 'Orders and Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Delivery within Dhaka city takes 1 to 2 business days. Other divisions take 2 to 4 business days. Remote areas may take up to 5 business days.' },
      { q: 'How much is the delivery fee?', a: 'Delivery is free on orders over Tk 2,000. Below that, a flat fee of Tk 60 applies for Dhaka city. Other locations have rates from Tk 80 to Tk 120.' },
      { q: 'Can I track my order?', a: "Yes. Once your order is shipped, you'll receive a tracking number via email or SMS. You can also track it from My Account and Orders." },
      { q: 'Can I change or cancel my order?', a: 'Orders can be modified or cancelled within 1 hour of placement. After that, contact our support team as soon as possible.' },
    ],
  },
  {
    category: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery, bKash, and Nagad at checkout.' },
      { q: 'Is it safe to pay online on Boilabin?', a: 'Absolutely. All payments are encrypted with TLS and HTTPS. We never store card details. bKash and Nagad use OTP verification.' },
      { q: 'Do I get a digital receipt?', a: 'Yes, an order confirmation with full payment details is sent to your email immediately after checkout.' },
    ],
  },
  {
    category: 'Returns and Refunds',
    items: [
      { q: 'What is the return policy?', a: 'We offer a seven day return window for most products. Items must be in original, unused condition with all accessories and packaging.' },
      { q: 'How do I return a product?', a: 'Go to My Account, then Orders, then select your order and request a return. Our team will approve and arrange free pickup within 24 hours.' },
      { q: 'When will I get my refund?', a: 'Refunds are processed within 3 to 5 business days after we receive and inspect the returned item.' },
    ],
  },
  {
    category: 'Products and Authenticity',
    items: [
      { q: 'Are all products on Boilabin authentic?', a: 'Yes. We source directly from authorized distributors and verified sourcing partners so every product listed on Boilabin is authentic.' },
      { q: 'Do products come with warranty?', a: "Warranty details are listed on each product page. Electronics typically come with the manufacturer's standard Bangladesh warranty." },
      { q: 'Can I find a product that is out of stock?', a: 'You can request to be notified when a product comes back in stock. Use the Notify Me button on the product page.' },
    ],
  },
  {
    category: 'Account and Security',
    items: [
      { q: 'How do I reset my password?', a: "Click Forgot Password on the login page and enter your email. You'll receive a reset link within a few minutes." },
      { q: 'Can I shop without creating an account?', a: 'Yes. Guest checkout is available. However, an account lets you track orders, save addresses, and earn rewards.' },
      { q: 'Is my personal data safe?', a: 'Yes. We follow strict data protection practices. Your data is never sold to third parties. See our Privacy Policy for full details.' },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="pr-4 text-sm font-medium">{q}</span>
        <ChevronDown className={cn('h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="pb-4 text-sm leading-relaxed text-muted-foreground">{a}</div>}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="container-site py-12 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Everything you need to know about shopping on Boilabin.</p>
        </div>

        <div className="space-y-8">
          {FAQS.map((section) => (
            <div key={section.category}>
              <h2 className="mb-3 text-center font-display text-lg font-semibold text-foreground">{section.category}</h2>
              <div className="rounded-[24px] border border-border/70 bg-card px-5 shadow-sm">
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[24px] border border-border/70 bg-secondary/55 p-6 text-center">
          <p className="mb-1 font-semibold">Still have questions?</p>
          <p className="text-sm text-muted-foreground">Our team is ready to help.</p>
          <a href="/contact" className="btn-primary mt-4 inline-flex">Contact Support</a>
        </div>
      </div>
    </div>
  )
}
