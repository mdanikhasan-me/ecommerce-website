'use client'

import Link from 'next/link'
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import { PAYMENT_ASSETS } from '@/shared/assets'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, FACEBOOK_URL, INSTAGRAM_URL } from '@/shared/contact'
import { BoilabinLogo } from '@/frontend/components/layout/BoilabinLogo'
import { BrandWordmark } from '@/frontend/components/layout/BrandWordmark'

const SOCIAL_LINKS = [
  { icon: Facebook, href: FACEBOOK_URL, label: 'Facebook' },
  { icon: Instagram, href: INSTAGRAM_URL, label: 'Instagram' },
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

const FOOTER_PAYMENT_LOGO_CLASSES: Record<string, string> = {
  'Cash on Delivery': 'h-[0.9rem] w-auto',
  bKash: 'h-[1.05rem] w-auto',
  Nagad: 'h-[1.15rem] w-auto',
  Visa: 'h-[0.95rem] w-auto',
  Mastercard: 'h-[0.95rem] w-auto',
}

export function Footer() {
  return (
    <footer className="mt-16 bg-foreground text-background">
      <div className="container-site py-12">
        <div className="mx-auto grid max-w-[1380px] grid-cols-1 gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:justify-between">
          <div className="max-w-sm lg:pt-1">
            <Link href="/" className="mb-5 inline-flex items-center gap-3.5" aria-label="Boilabin home">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.03] ring-1 ring-white/10">
                <BoilabinLogo variant="mark-light" size={34} />
              </span>
              <BrandWordmark
                variant="art"
                aria-label="Boilabin"
                className="w-[8rem] text-[hsl(var(--footer-heading))] sm:w-[8.7rem]"
              />
            </Link>
            <p className="footer-muted mb-6 text-sm leading-relaxed">
              Bangladesh&apos;s premium online store. Quality products, fast delivery, and a shopping
              experience you can trust.
            </p>
            <div className="footer-muted flex flex-col gap-2.5 text-sm">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="footer-link flex items-center gap-2"
              >
                <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
              </a>
              <a
                href={`tel:${CONTACT_PHONE}`}
                className="footer-link flex items-center gap-2"
              >
                <Phone className="h-4 w-4" /> {CONTACT_PHONE}
              </a>
              <span className="footer-link flex items-center gap-2">
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
                  className="footer-social rounded-lg border bg-transparent p-2"
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:justify-self-end lg:gap-x-16 xl:grid-cols-3">
            <div>
              <h4 className="footer-heading mb-4 text-xs font-semibold uppercase tracking-[0.18em]">
                Shop
              </h4>
              <ul className="footer-muted space-y-2.5 text-sm">
                {SHOP_LINKS.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="footer-link">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="footer-heading mb-4 text-xs font-semibold uppercase tracking-[0.18em]">
                Support
              </h4>
              <ul className="footer-muted space-y-2.5 text-sm">
                {SUPPORT_LINKS.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="footer-link">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="footer-heading mb-4 text-xs font-semibold uppercase tracking-[0.18em]">
                Company
              </h4>
              <ul className="footer-muted space-y-2.5 text-sm">
                {COMPANY_LINKS.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="footer-link">
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
        <div className="container-site footer-muted py-4 text-xs">
          <div className="mx-auto flex max-w-[1380px] flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span>Copyright {new Date().getFullYear()}</span>
              <BrandWordmark
                variant="art"
                aria-label="Boilabin"
                className="w-[4.2rem] text-[hsl(var(--footer-heading))] align-[-0.16em]"
              />
              <span>All rights reserved.</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span className="tracking-[0.08em] text-white/44">Payments</span>
              {FOOTER_PAYMENT_METHODS.map((method) => (
                <span key={method.alt} className="inline-flex items-center justify-center opacity-92">
                  <img
                    src={method.src}
                    alt={method.alt}
                    width={method.width}
                    height={method.height}
                    loading="eager"
                    decoding="async"
                    className={`${FOOTER_PAYMENT_LOGO_CLASSES[method.alt] ?? 'h-[1rem] w-auto'} block object-contain`}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
