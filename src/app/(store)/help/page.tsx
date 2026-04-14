import Link from 'next/link'
import { HelpCircle, Package, CreditCard, RefreshCcw, Shield, Headphones, Mail } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Help Center | Boilabin' }

const HELP_TOPICS = [
  {
    icon: Package,
    title: 'Orders & Delivery',
    desc: 'Track orders, delivery times, shipping fees',
    href: '/faq#orders',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: CreditCard,
    title: 'Payments',
    desc: 'Payment methods, security, receipts',
    href: '/faq#payments',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: RefreshCcw,
    title: 'Returns & Refunds',
    desc: 'Return policy, how to return, refund timeline',
    href: '/returns',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Shield,
    title: 'Account & Security',
    desc: 'Password reset, account settings, privacy',
    href: '/faq#account',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: HelpCircle,
    title: 'FAQ',
    desc: 'Answers to the most common questions',
    href: '/faq',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Headphones,
    title: 'Contact Support',
    desc: 'Get in touch with our support team',
    href: '/contact',
    color: 'bg-sky-50 text-sky-600',
  },
]

export default function HelpPage() {
  return (
    <div className="container-site py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold mb-2">How can we help?</h1>
          <p className="text-muted-foreground">Find answers, track orders, or get in touch with our team.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HELP_TOPICS.map((topic) => (
            <Link
              key={topic.title}
              href={topic.href}
              className="flex items-start gap-4 p-5 bg-card border border-border rounded-2xl hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <div className={`p-2.5 rounded-xl ${topic.color} flex-shrink-0`}>
                <topic.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{topic.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{topic.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-secondary rounded-2xl p-8 text-center">
          <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
          <h2 className="font-display text-xl font-semibold mb-1">Still need help?</h2>
          <p className="text-muted-foreground text-sm mb-4">Our support team typically responds within a few hours.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="mailto:hello@boilabin.com" className="btn-primary">Email Us</a>
            <Link href="/contact" className="btn-outline">Contact Form</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
