'use client'

import Link from 'next/link'
import { PAYMENT_ASSETS } from '@/shared/assets'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, FACEBOOK_URL, INSTAGRAM_URL } from '@/shared/contact'
import { HomepageNewsletterForm } from '@/frontend/components/layout/NewsletterForm'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'

const YOUTUBE_URL = 'https://www.youtube.com/@Boilabin'

const SOCIAL_LINKS = [
  { icon: 'facebook', href: FACEBOOK_URL, label: 'Facebook' },
  { icon: 'instagram', href: INSTAGRAM_URL, label: 'Instagram' },
  { icon: 'youtube', href: YOUTUBE_URL, label: 'YouTube' },
] as const satisfies ReadonlyArray<{ icon: StorefrontIconName; href: string; label: string }>

// Footer brand display only; does not enable checkout gateways.
const FOOTER_PAYMENT_LOGOS = [
  {
    ...PAYMENT_ASSETS.BKASH,
    className: 'h-[1.18rem] max-w-[2.15rem]',
  },
  {
    ...PAYMENT_ASSETS.NAGAD,
    className: 'h-[1.24rem] max-w-[1.9rem]',
  },
  {
    ...PAYMENT_ASSETS.VISA,
    className: 'h-[0.84rem] max-w-[2.95rem]',
  },
  {
    ...PAYMENT_ASSETS.MASTERCARD,
    className: 'h-[0.96rem] max-w-[2.58rem]',
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
      { label: 'Sitemap', href: '/sitemap.xml' },
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
      <div className="container-site">
        <div className="w-full py-5 min-[600px]:py-6 lg:py-8">
          <div className="grid gap-5 min-[600px]:gap-6 lg:grid-cols-[minmax(14rem,0.62fr)_minmax(0,1.38fr)] lg:gap-9 xl:gap-11">
            <section aria-label="Boilabin contact" className="max-w-[32rem] lg:max-w-[18rem]">
              <Link href="/" className="inline-flex items-center gap-3" aria-label="Boilabin home">
                <span className="font-display text-[1.28rem] font-bold leading-none tracking-normal text-foreground sm:text-[1.42rem]">
                  Boilabin
                </span>
              </Link>
              <p className="mt-2.5 max-w-[28rem] text-sm leading-6 text-muted-foreground lg:max-w-[17rem]">
                Browse products, manage orders, and reach support from one practical shopping hub.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground focus-visible:text-foreground"
                >
                  <LocalIcon name="mail" className="h-3.5 w-3.5 text-primary/70" /> {CONTACT_EMAIL}
                </a>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground focus-visible:text-foreground"
                >
                  <LocalIcon name="phone" className="h-3.5 w-3.5 text-primary/70" /> {CONTACT_PHONE}
                </a>
                <span className="hidden items-center gap-1.5 min-[600px]:inline-flex">
                  <LocalIcon name="location" className="h-3.5 w-3.5 shrink-0 text-primary/70" /> {CONTACT_ADDRESS}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={item.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-foreground transition-colors hover:bg-primary/8 hover:text-primary focus-visible:bg-primary/8 focus-visible:text-primary"
                  >
                    <LocalIcon name={item.icon} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </section>

            <nav
              aria-label="Footer"
              className="hidden gap-x-8 gap-y-5 min-[600px]:grid min-[600px]:grid-cols-2 lg:grid-cols-4 lg:gap-x-7 xl:gap-x-9"
            >
              {FOOTER_LINK_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h2 className="text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-foreground/88">
                    {section.title}
                  </h2>
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
            </nav>

            <nav aria-label="Footer sections" className="space-y-1 min-[600px]:hidden">
              {FOOTER_LINK_SECTIONS.map((section) => (
                <details
                  key={section.title}
                  className="group overflow-hidden border-b border-black/8"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2.5 text-[0.92rem] font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                    {section.title}
                    <LocalIcon name="chevron-down" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="space-y-0.5 pb-2">
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

          <div className="mt-5 grid gap-4 border-t border-black/8 pt-4 min-[600px]:grid-cols-[minmax(0,1fr)_minmax(16rem,0.78fr)] min-[600px]:items-start min-[600px]:gap-6 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.62fr)] lg:items-center lg:gap-9">
            <section className="order-2 min-[600px]:order-1">
              <h2 className="text-sm font-semibold text-foreground">Checkout payment options</h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 min-[600px]:gap-x-3.5 lg:gap-x-4">
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

            <section className="order-1 min-[600px]:order-2 min-[600px]:max-w-[20rem] min-[600px]:justify-self-end lg:max-w-none">
              <h2 className="text-sm font-semibold text-foreground">Stay in the loop</h2>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                Get launch updates and selected store notices.
              </p>
              <div className="mt-2.5">
                <HomepageNewsletterForm variant="light" source="footer" layout="inline" />
              </div>
            </section>
          </div>
        </div>

        <div className="w-full border-t border-black/6 py-3 text-xs text-muted-foreground">
          <div className="flex w-full flex-col items-center justify-between gap-2 min-[700px]:flex-row">
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
