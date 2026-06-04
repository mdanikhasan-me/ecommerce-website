'use client'

import Link from 'next/link'
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import { PAYMENT_GATEWAYS } from '@/backend/config/payment'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, FACEBOOK_URL, INSTAGRAM_URL } from '@/shared/contact'
import { BoilabinLogo } from '@/frontend/components/layout/BoilabinLogo'

const SOCIAL_LINKS = [
  { icon: Facebook, href: FACEBOOK_URL, label: 'Facebook' },
  { icon: Instagram, href: INSTAGRAM_URL, label: 'Instagram' },
]

const FOOTER_PAYMENT_METHODS = PAYMENT_GATEWAYS
  .filter((gateway) => gateway.isAvailable)
  .flatMap((gateway) => gateway.logos ?? [])

const FOOTER_PAYMENT_LOGO_CLASSES: Record<string, string> = {
  'Cash on Delivery': 'h-[0.9rem] w-auto',
  bKash: 'h-[1.05rem] w-auto',
  Nagad: 'h-[1.15rem] w-auto',
  Visa: 'h-[0.95rem] w-auto',
  Mastercard: 'h-[0.95rem] w-auto',
}

type FooterLinkSection = {
  title: string
  links: Array<{
    label: string
    href: string
    prefetch?: false
  }>
}

const FOOTER_LINK_SECTIONS: FooterLinkSection[] = [
  {
    title: 'Shop',
    links: [
      { label: 'All categories', href: '/category' },
      { label: 'New arrivals', href: '/new-arrivals' },
      { label: 'Search products', href: '/search' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help center', href: '/help' },
      { label: 'Track order', href: '/track-order' },
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', href: '/auth/login' },
      { label: 'My account', href: '/account', prefetch: false },
      { label: 'Orders', href: '/account/orders', prefetch: false },
      { label: 'Wishlist', href: '/wishlist' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container-site py-8 sm:py-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,2fr)] lg:gap-10">
          <div className="max-w-[34rem] lg:pt-1">
            <Link href="/" className="mb-4 inline-flex items-center gap-2.5 sm:mb-5 sm:gap-3" aria-label="Boilabin home">
              <BoilabinLogo variant="mark" size={54} />
              <span className="font-display text-[1.42rem] font-bold leading-none tracking-normal text-white sm:text-[1.55rem]">
                Boilabin
              </span>
            </Link>
            <p className="footer-muted mb-5 max-w-[30rem] text-sm leading-relaxed sm:mb-6">
              Browse products, manage orders, and reach support from one practical shopping hub.
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
              <span className="footer-link flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {CONTACT_ADDRESS}
              </span>
            </div>
            <div className="mt-5 flex items-center gap-3 sm:mt-6">
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

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
            {FOOTER_LINK_SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="footer-heading text-sm font-semibold">{section.title}</h2>
                <ul className="mt-3 space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} prefetch={link.prefetch} className="footer-link text-sm leading-5">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site footer-muted py-4 text-xs">
          <div className="flex w-full flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span>Copyright {new Date().getFullYear()}</span>
              <span className="font-semibold text-[hsl(var(--footer-heading))]">Boilabin</span>
              <span>All rights reserved.</span>
            </p>
            {FOOTER_PAYMENT_METHODS.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-2.5">
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
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  )
}
