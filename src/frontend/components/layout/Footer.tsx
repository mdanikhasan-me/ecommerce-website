'use client'

import Link from 'next/link'
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Shield,
  RefreshCw,
  Truck,
  CreditCard,
} from 'lucide-react'

const TRUST_FEATURES = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders over BDT 2,000' },
  { icon: Shield, title: 'Secure Payments', desc: '100% protected checkout' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '7 day return policy' },
  { icon: CreditCard, title: 'Multiple Payments', desc: 'bKash, Nagad, Cards, COD' },
]

const FOOTER_EMAIL = 'anikhasan2@icloud.com'
const FOOTER_PHONE = '01758409063'
const SOCIAL_LINKS = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  {
    icon: Instagram,
    href: 'https://www.instagram.com/boilabin?igsh=d2ZkNnN3ZmJvdWxj',
    label: 'Instagram',
  },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

export function Footer() {
  return (
    <footer className="mt-16 bg-foreground text-background">
      <div className="border-b border-white/10">
        <div className="container-site py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {TRUST_FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[0_12px_32px_rgba(0,0,0,0.14)]"
              >
                <div className="flex-shrink-0 rounded-xl bg-white p-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                  <f.icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="mt-1 text-xs text-white/72">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-site py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-lg font-bold text-white">B</span>
              </div>
              <span className="font-display text-xl font-bold">Boilabin</span>
            </Link>
            <p className="mb-5 max-w-sm text-sm leading-relaxed text-white/60">
              Bangladesh&apos;s premium online store. Quality products, fast delivery, and a shopping
              experience you can trust.
            </p>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <a
                href={`mailto:${FOOTER_EMAIL}`}
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4" /> {FOOTER_EMAIL}
              </a>
              <a
                href={`tel:${FOOTER_PHONE}`}
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4" /> {FOOTER_PHONE}
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Dhaka, Bangladesh
              </span>
            </div>
            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={item.label}
                  className="rounded-lg bg-white/10 p-2 transition-colors hover:bg-primary"
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Support</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {[
                ['Help Center', '/help'],
                ['Track My Order', '/track-order'],
                ['Returns & Refunds', '/returns'],
                ['Contact Us', '/contact'],
                ['FAQ', '/faq'],
                ['Shipping Info', '/shipping'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-primary">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Company</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {[
                ['About Us', '/about'],
                ['Terms of Service', '/terms'],
                ['Privacy Policy', '/privacy'],
                ['Refund Policy', '/returns'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-primary">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Stay Updated</h4>
            <p className="mb-4 text-sm text-white/60">Subscribe for exclusive deals and new arrivals.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                className="flex-shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-4 text-xs text-white/40 sm:flex-row">
          <p>Copyright {new Date().getFullYear()} Boilabin. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Payments:</span>
            {['COD', 'bKash', 'Nagad', 'Visa', 'MC'].map((p) => (
              <span key={p} className="rounded bg-white/10 px-2 py-0.5 font-medium">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
