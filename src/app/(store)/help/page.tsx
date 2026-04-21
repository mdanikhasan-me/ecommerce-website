import Link from 'next/link'
import {
  ArrowRight,
  CreditCard,
  Headphones,
  HelpCircle,
  Mail,
  Package,
  RefreshCcw,
  Shield,
} from 'lucide-react'
import type { Metadata } from 'next'

import { CONTACT_EMAIL } from '@/shared/contact'

export const metadata: Metadata = { title: 'Boilabin Help Center' }

const HELP_TOPICS = [
  {
    icon: Package,
    title: 'Orders & Delivery',
    desc: 'Track orders, delivery windows, and shipping details without hunting through multiple pages.',
    href: '/faq#orders',
  },
  {
    icon: CreditCard,
    title: 'Payments',
    desc: 'See supported payment methods, checkout guidance, receipts, and transaction-related answers.',
    href: '/faq#payments',
  },
  {
    icon: RefreshCcw,
    title: 'Returns & Refunds',
    desc: 'Review return rules, refund timing, and the exact steps to send an item back smoothly.',
    href: '/returns',
  },
  {
    icon: Shield,
    title: 'Account & Security',
    desc: 'Find help with sign-in, account settings, privacy, and protecting your account access.',
    href: '/faq#account',
  },
  {
    icon: HelpCircle,
    title: 'FAQ',
    desc: 'Browse the most common questions first if you want the fastest route to an answer.',
    href: '/faq',
  },
  {
    icon: Headphones,
    title: 'Contact Support',
    desc: 'Reach our team directly when you need help with an order, payment, or account issue.',
    href: '/contact',
  },
]

export default function HelpPage() {
  return (
    <div className="container-site py-10 sm:py-12">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-black/8 bg-card">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_1.85fr]">
          <div className="border-b border-black/6 bg-[linear-gradient(180deg,rgba(247,242,228,0.7),rgba(247,242,228,0.32))] p-7 sm:p-10 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground/46">
              Help Center
            </p>
            <h1 className="mt-4 max-w-sm font-display text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-[3rem]">
              Clear support, without the clutter.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-[15px]">
              Pick the topic that matches what you need. Everything here is organized to get you to
              the right answer quickly, without heavy layouts or noisy visuals.
            </p>

            <div className="mt-8 rounded-[1.5rem] border border-black/7 bg-background/78 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Need a direct reply?</p>
                  <p className="text-xs text-muted-foreground">Most support emails are answered within a few hours.</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a href={`mailto:${CONTACT_EMAIL}`} className="btn-primary justify-center sm:flex-1">
                  Email Support
                </a>
                <Link href="/contact" className="btn-outline justify-center sm:flex-1">
                  Open Contact Form
                </Link>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-7">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              {HELP_TOPICS.map((topic, index) => (
                <Link
                  key={topic.title}
                  href={topic.href}
                  className="group rounded-[1.5rem] border border-black/8 bg-background p-5 transition-colors duration-200 hover:border-foreground/16 hover:bg-[hsl(var(--buttermilk)/0.2)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/7 bg-[hsl(var(--buttermilk)/0.48)] text-foreground/82 transition-colors duration-200 group-hover:bg-foreground group-hover:text-background">
                      <topic.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/34">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="mt-6">
                    <h2 className="text-[1rem] font-semibold tracking-[-0.02em] text-foreground">
                      {topic.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{topic.desc}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-black/6 pt-4 text-sm font-medium text-foreground/72">
                    <span>Open topic</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
