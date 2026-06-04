'use client'

import Link from 'next/link'
import {
  ChevronDown,
  Facebook,
  Instagram,
  LifeBuoy,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCcw,
  WalletCards,
} from 'lucide-react'
import { PAYMENT_GATEWAYS } from '@/backend/config/payment'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, FACEBOOK_URL, INSTAGRAM_URL } from '@/shared/contact'
import { BoilabinLogo } from '@/frontend/components/layout/BoilabinLogo'
import { HomepageNewsletterForm } from '@/frontend/components/layout/NewsletterForm'

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

const FOOTER_SERVICE_ITEMS = [
  {
    title: 'Delivery information',
    copy: 'Review delivery details before checkout.',
    icon: PackageCheck,
  },
  {
    title: 'Returns and refunds',
    copy: 'Use the returns page for return guidance.',
    icon: RefreshCcw,
  },
  {
    title: 'Cash on Delivery',
    copy: 'Shown payment methods follow current checkout availability.',
    icon: WalletCards,
  },
  {
    title: 'Support and contact',
    copy: 'Find help, tracking, and contact routes in one place.',
    icon: LifeBuoy,
  },
]

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
    title: 'Customer Service',
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
    title: 'About Us',
    links: [
      { label: 'About Boilabin', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
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
    title: 'Policies',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
    ],
  },
]

const BOTTOM_LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Sitemap', href: '/sitemap.xml' },
]

export function Footer() {
  return (
    <footer className="border-t border-black/8 bg-[hsl(42_42%_96%)] text-foreground">
      <div className="border-b border-black/6 bg-white/52">
        <div className="container-site py-5 sm:py-6">
          <div className="grid gap-y-4 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-10">
            {FOOTER_SERVICE_ITEMS.map((item) => (
              <div
                key={item.title}
                className="flex min-w-0 items-center gap-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground">
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-5 text-foreground">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.copy}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="container-site py-8 sm:py-10 lg:py-12">
          <div className="grid gap-9 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.62fr)] lg:gap-12 xl:gap-16">
            <section aria-label="Boilabin contact" className="max-w-[34rem]">
              <Link href="/" className="inline-flex items-center gap-3" aria-label="Boilabin home">
                <BoilabinLogo variant="mark" size={52} />
                <span className="font-display text-[1.48rem] font-bold leading-none tracking-normal text-foreground sm:text-[1.6rem]">
                  Boilabin
                </span>
              </Link>
              <p className="mt-4 max-w-[29rem] text-sm leading-6 text-muted-foreground">
                Browse products, manage orders, and reach support from one practical shopping hub.
              </p>
              <div className="mt-5 flex flex-col gap-2.5 text-sm text-muted-foreground">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-2 transition-colors hover:text-foreground focus-visible:text-foreground"
                >
                  <Mail className="h-4 w-4 text-primary/72" /> {CONTACT_EMAIL}
                </a>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="flex items-center gap-2 transition-colors hover:text-foreground focus-visible:text-foreground"
                >
                  <Phone className="h-4 w-4 text-primary/72" /> {CONTACT_PHONE}
                </a>
                <span className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/72" /> {CONTACT_ADDRESS}
                </span>
              </div>
              <div className="mt-5 flex items-center gap-2.5">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={item.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-foreground transition-colors hover:bg-primary/8 hover:text-primary focus-visible:bg-primary/8 focus-visible:text-primary"
                  >
                    <item.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </section>

            <nav aria-label="Footer" className="hidden grid-cols-2 gap-x-7 gap-y-8 sm:grid md:grid-cols-3 xl:grid-cols-5">
              {FOOTER_LINK_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                  <ul className="mt-3 space-y-2.5">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          prefetch={link.prefetch}
                          className="text-sm leading-5 text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <nav aria-label="Footer sections" className="space-y-2 sm:hidden">
              {FOOTER_LINK_SECTIONS.map((section) => (
                <details
                  key={section.title}
                  className="group overflow-hidden rounded-xl border border-black/6 bg-white/72 shadow-[0_8px_20px_rgba(23,18,15,0.03)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                    {section.title}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="space-y-1 border-t border-black/6 px-4 py-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          prefetch={link.prefetch}
                          className="block rounded-lg py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </nav>
          </div>

          <div className="mt-8 grid gap-7 border-t border-black/8 pt-7 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)] lg:items-start lg:gap-12">
            <section className="order-2 lg:order-1">
              <h2 className="text-sm font-semibold text-foreground">We accept</h2>
              {FOOTER_PAYMENT_METHODS.length > 0 ? (
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  {FOOTER_PAYMENT_METHODS.map((method) => (
                    <span
                      key={method.alt}
                      className="inline-flex min-h-8 items-center justify-center rounded-md border border-black/8 bg-white px-3 shadow-[0_5px_14px_rgba(23,18,15,0.035)]"
                    >
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
              <p className="mt-2.5 max-w-md text-xs leading-5 text-muted-foreground">
                Displayed methods follow current checkout availability.
              </p>
            </section>

            <section className="order-1 lg:order-2">
              <h2 className="text-sm font-semibold text-foreground">Stay in the loop</h2>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Get launch alerts, selected offers, and useful updates.
              </p>
              <div className="mt-3">
                <HomepageNewsletterForm variant="light" source="footer" layout="inline" />
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  No spam. Unsubscribe anytime.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="border-t border-black/6 bg-white/54">
        <div className="container-site py-4 text-xs text-muted-foreground">
          <div className="flex w-full flex-col items-center justify-between gap-3 lg:flex-row">
            <p className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span>Copyright {new Date().getFullYear()}</span>
              <span className="font-semibold text-foreground">Boilabin</span>
              <span>All rights reserved.</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 lg:justify-end">
              {BOTTOM_LEGAL_LINKS.map((link, index) => (
                <span key={link.href} className="inline-flex items-center gap-3">
                  {index > 0 ? <span aria-hidden="true" className="text-black/20">|</span> : null}
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-foreground focus-visible:text-foreground"
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
