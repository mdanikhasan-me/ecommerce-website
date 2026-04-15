'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  CreditCard,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Shield,
  Truck,
  Twitter,
  Youtube,
} from 'lucide-react'
import { PAYMENT_ASSETS } from '@/shared/assets'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, INSTAGRAM_URL } from '@/shared/contact'

const TRUST_FEATURES = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders over BDT 2,000' },
  { icon: Shield, title: 'Secure Payments', desc: '100% protected checkout' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '7 day return policy' },
  { icon: CreditCard, title: 'Multiple Payments', desc: 'bKash, Nagad, Visa, Mastercard' },
]

const SOCIAL_LINKS = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: INSTAGRAM_URL, label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

const SHOP_LINKS = [
  ['New Arrivals', '/new-arrivals'],
  ['Flash Deals', '/deals'],
  ['Brands', '/brands'],
  ['All Categories', '/category'],
] as const

const SUPPORT_LINKS = [
  ['Help Center', '/help'],
  ['Track My Order', '/track-order'],
  ['Returns & Refunds', '/returns'],
  ['Contact Us', '/contact'],
  ['FAQ', '/faq'],
  ['Shipping Info', '/shipping'],
] as const

const COMPANY_LINKS = [
  ['About Us', '/about'],
  ['Terms of Service', '/terms'],
  ['Privacy Policy', '/privacy'],
  ['Refund Policy', '/returns'],
] as const

const FOOTER_PAYMENT_METHODS = [
  PAYMENT_ASSETS.CASH_ON_DELIVERY,
  PAYMENT_ASSETS.BKASH,
  PAYMENT_ASSETS.NAGAD,
  PAYMENT_ASSETS.VISA,
  PAYMENT_ASSETS.MASTERCARD,
]

function getPaymentLogoClass(alt: string) {
  if (alt === 'Cash on Delivery') {
    return 'object-contain opacity-100'
  }

  if (alt === 'bKash') {
    return 'object-contain opacity-100'
  }

  if (alt === 'Nagad') {
    return 'object-contain opacity-100'
  }

  return 'object-contain opacity-100'
}

function getPaymentLogoFrameClass(alt: string) {
  if (alt === 'Cash on Delivery') return 'h-[18px] w-[42px]'
  if (alt === 'bKash') return 'h-[24px] w-[28px]'
  if (alt === 'Nagad') return 'h-[26px] w-[32px]'
  if (alt === 'Mastercard') return 'h-[20px] w-[46px]'
  if (alt === 'Visa') return 'h-[18px] w-[46px]'
  return 'h-[18px] w-[46px]'
}

export function Footer() {
  return (
    <footer className="mt-16 bg-foreground text-background">
      <div className="border-b border-white/10">
        <div className="container-site py-8">
          <div className="mx-auto grid max-w-[1380px] grid-cols-2 gap-6 md:grid-cols-4">
            {TRUST_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[0_12px_32px_rgba(0,0,0,0.14)]"
              >
                <div className="flex-shrink-0 rounded-xl bg-white p-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                  <feature.icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{feature.title}</p>
                  <p className="mt-1 text-xs text-white/72">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-site py-12">
        <div className="mx-auto grid max-w-[1380px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:justify-between">
          <div className="max-w-sm lg:pt-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-lg font-bold text-white">B</span>
              </div>
              <span className="font-display text-xl font-bold">Boilabin</span>
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-white/60">
              Bangladesh&apos;s premium online store. Quality products, fast delivery, and a shopping
              experience you can trust.
            </p>
            <div className="flex flex-col gap-2.5 text-sm text-white/60">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
              </a>
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4" /> {CONTACT_PHONE}
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {CONTACT_ADDRESS}
              </span>
            </div>
            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={item.label}
                  className="rounded-lg border border-white/10 bg-transparent p-2 transition-colors hover:border-primary/35 hover:bg-white/[0.04]"
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:justify-self-end lg:gap-x-16 xl:grid-cols-3">
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/42">
                Shop
              </h4>
              <ul className="space-y-2.5 text-sm text-white/60">
                {SHOP_LINKS.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="transition-colors hover:text-primary">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/42">
                Support
              </h4>
              <ul className="space-y-2.5 text-sm text-white/60">
                {SUPPORT_LINKS.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="transition-colors hover:text-primary">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/42">
                Company
              </h4>
              <ul className="space-y-2.5 text-sm text-white/60">
                {COMPANY_LINKS.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="transition-colors hover:text-primary">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site py-4 text-xs text-white/40">
          <div className="mx-auto flex max-w-[1380px] flex-col items-center justify-between gap-3 sm:flex-row">
            <p>Copyright {new Date().getFullYear()} Boilabin. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-white/46">Payments</span>
              {FOOTER_PAYMENT_METHODS.map((method) => (
                <span
                  key={method.alt}
                  className="inline-flex h-10 min-w-[86px] items-center justify-center rounded-full border border-white/10 px-3 py-1.5 transition-colors hover:border-white/20"
                >
                  <span className={`relative block ${getPaymentLogoFrameClass(method.alt)}`}>
                    <Image
                      src={method.src}
                      alt={method.alt}
                      fill
                      unoptimized
                      className={getPaymentLogoClass(method.alt)}
                    />
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
