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
import { PAYMENT_ASSETS } from '@/shared/assets'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, FACEBOOK_URL, INSTAGRAM_URL } from '@/shared/contact'
import { BoilabinLogo } from '@/frontend/components/layout/BoilabinLogo'
import { HomepageNewsletterForm } from '@/frontend/components/layout/NewsletterForm'

const SOCIAL_LINKS = [
  { icon: Facebook, href: FACEBOOK_URL, label: 'Facebook' },
  { icon: Instagram, href: INSTAGRAM_URL, label: 'Instagram' },
]

// Footer display only; does not enable checkout gateways.
const FOOTER_PAYMENT_LOGOS = [
  {
    ...PAYMENT_ASSETS.CASH_ON_DELIVERY,
    className: 'h-[1.05rem] max-w-[4.8rem]',
  },
  {
    ...PAYMENT_ASSETS.BKASH,
    className: 'h-[1.35rem] max-w-[2.4rem]',
  },
  {
    ...PAYMENT_ASSETS.NAGAD,
    className: 'h-[1.55rem] max-w-[2.1rem]',
  },
  {
    ...PAYMENT_ASSETS.VISA,
    className: 'h-[1.05rem] max-w-[3.5rem]',
  },
  {
    ...PAYMENT_ASSETS.MASTERCARD,
    className: 'h-[1.15rem] max-w-[3.15rem]',
  },
]

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
    title: 'Checkout payment',
    copy: 'Confirm available options at checkout.',
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

const FOOTER_TABLET_LINK_GROUPS = [
  [FOOTER_LINK_SECTIONS[0], FOOTER_LINK_SECTIONS[1]],
  [FOOTER_LINK_SECTIONS[3], FOOTER_LINK_SECTIONS[2], FOOTER_LINK_SECTIONS[4]],
]

const BOTTOM_LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Sitemap', href: '/sitemap.xml' },
]

export function Footer() {
  return (
    <footer className="border-t border-black/8 bg-[hsl(42_42%_96%)] text-foreground">
      <div className="hidden border-b border-black/6 bg-white/52 md:block">
        <div className="container-site py-3.5 lg:py-5">
          <div className="grid gap-y-3 md:grid-cols-2 md:gap-x-6 lg:grid-cols-4 lg:gap-x-10">
            {FOOTER_SERVICE_ITEMS.map((item) => (
              <div
                key={item.title}
                className="flex min-w-0 items-center gap-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground">
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
        <div className="container-site py-6 min-[600px]:py-7 lg:py-9">
          <div className="grid gap-6 min-[600px]:gap-7 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.64fr)] lg:gap-10 xl:gap-14">
            <section aria-label="Boilabin contact" className="max-w-[34rem]">
              <Link href="/" className="inline-flex items-center gap-3" aria-label="Boilabin home">
                <BoilabinLogo variant="mark" size={46} />
                <span className="font-display text-[1.4rem] font-bold leading-none tracking-normal text-foreground sm:text-[1.55rem]">
                  Boilabin
                </span>
              </Link>
              <p className="mt-3 max-w-[27rem] text-sm leading-6 text-muted-foreground sm:mt-4">
                Browse products, manage orders, and reach support from one practical shopping hub.
              </p>
              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
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
              <div className="mt-4 flex items-center gap-2">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={item.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-foreground transition-colors hover:bg-primary/8 hover:text-primary focus-visible:bg-primary/8 focus-visible:text-primary"
                  >
                    <item.icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </section>

            <nav aria-label="Footer" className="hidden grid-cols-5 gap-x-7 gap-y-8 lg:grid">
              {FOOTER_LINK_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                  <ul className="mt-2.5 space-y-2">
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

            <nav aria-label="Footer tablet sections" className="hidden gap-x-8 gap-y-5 min-[600px]:grid min-[600px]:grid-cols-2 lg:hidden">
              {FOOTER_TABLET_LINK_GROUPS.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-5">
                  {group.map((section) => (
                    <div key={section.title}>
                      <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                      <ul className="mt-2 space-y-1.5">
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
                </div>
              ))}
            </nav>

            <nav aria-label="Footer sections" className="space-y-2 min-[600px]:hidden">
              {FOOTER_LINK_SECTIONS.map((section) => (
                <details
                  key={section.title}
                  className="group overflow-hidden border-b border-black/8"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                    {section.title}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="space-y-1 pb-3">
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

          <div className="mt-6 grid gap-5 border-t border-black/8 pt-5 min-[600px]:grid-cols-[minmax(0,0.9fr)_minmax(18rem,0.72fr)] min-[600px]:items-start min-[600px]:gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(21rem,0.68fr)] lg:gap-10">
            <section className="order-2 min-[600px]:order-1">
              <h2 className="text-sm font-semibold text-foreground">We accept</h2>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-2 min-[600px]:gap-x-4 lg:gap-x-5">
                {FOOTER_PAYMENT_LOGOS.map((method) => (
                  <img
                    key={method.alt}
                    src={method.src}
                    alt={method.alt}
                    width={method.width}
                    height={method.height}
                    loading="eager"
                    decoding="async"
                    className={`${method.className} block w-auto object-contain`}
                  />
                ))}
              </div>
            </section>

            <section className="order-1 min-[600px]:order-2 min-[600px]:max-w-[22rem] min-[600px]:justify-self-end lg:max-w-none">
              <h2 className="text-sm font-semibold text-foreground">Stay in the loop</h2>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                Get launch alerts, selected offers, and useful updates.
              </p>
              <div className="mt-2.5">
                <HomepageNewsletterForm variant="light" source="footer" layout="inline" />
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  No spam. Unsubscribe anytime.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="border-t border-black/6 bg-white/54">
        <div className="container-site py-3.5 text-xs text-muted-foreground">
          <div className="flex w-full flex-col items-center justify-between gap-2.5 min-[700px]:flex-row">
            <p className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span>Copyright {new Date().getFullYear()}</span>
              <span className="font-semibold text-foreground">Boilabin</span>
              <span>All rights reserved.</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 min-[700px]:justify-end">
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
