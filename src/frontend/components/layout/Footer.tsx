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
      { label: 'Best Sellers', href: '/search?bestSeller=true' },
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
]

const DESKTOP_FOOTER_LINK_SECTIONS: FooterLinkSection[] = FOOTER_LINK_SECTIONS.map((section) => {
  if (section.title !== 'Support') return section

  return {
    ...section,
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Help center', href: '/help' },
      { label: 'Contact', href: '/contact' },
    ],
  }
})

const BOTTOM_LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Sitemap', href: '/sitemap.xml' },
]

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-[#fffdfa] text-foreground">
      <div className="container-site">
        <div className="w-full pb-3.5 pt-2 min-[600px]:py-6 lg:py-8">
          <div className="hidden gap-3 xl:grid xl:grid-cols-[minmax(14rem,0.62fr)_minmax(0,1.38fr)] xl:gap-11">
            <section aria-label="Boilabin contact" className="max-w-[18rem]">
              <Link href="/" className="inline-flex items-center gap-3" aria-label="Boilabin home">
                <span className="font-display text-[1.28rem] font-bold leading-none tracking-normal text-foreground sm:text-[1.42rem]">
                  Boilabin
                </span>
              </Link>
              <p className="mt-2.5 max-w-[28rem] text-sm leading-6 text-muted-foreground lg:max-w-[17rem]">
                Everyday finds. Best deals. Delivered across Bangladesh.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-1.5 transition-colors md:hover:text-foreground focus-visible:text-foreground"
                >
                  <LocalIcon name="mail" className="h-3.5 w-3.5 text-primary/70" /> {CONTACT_EMAIL}
                </a>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="inline-flex items-center gap-1.5 transition-colors md:hover:text-foreground focus-visible:text-foreground"
                >
                  <LocalIcon name="phone" className="h-3.5 w-3.5 text-primary/70" /> {CONTACT_PHONE}
                </a>
                <span className="hidden items-center gap-1.5 min-[600px]:inline-flex">
                  <LocalIcon name="location" className="h-3.5 w-3.5 shrink-0 text-primary/70" /> {CONTACT_ADDRESS}
                </span>
              </div>
              {/* Mobile only: social icons stay under the address. On desktop they move to the Social column. */}
              <div className="mt-3 flex items-center gap-2 min-[600px]:hidden">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={item.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-foreground transition-colors md:hover:bg-primary/8 md:hover:text-primary focus-visible:bg-primary/8 focus-visible:text-primary"
                  >
                    <LocalIcon name={item.icon} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </section>

            <nav
              aria-label="Footer"
              className="grid grid-cols-4 gap-x-9 gap-y-5"
            >
              {DESKTOP_FOOTER_LINK_SECTIONS.map((section) => (
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
                          className="text-sm leading-5 text-muted-foreground transition-colors md:hover:text-foreground focus-visible:text-foreground"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <h2 className="text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-foreground/88">Social</h2>
                <ul className="mt-2 space-y-2.5">
                  {SOCIAL_LINKS.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className="inline-flex items-center gap-2.5 text-sm leading-5 text-muted-foreground transition-colors md:hover:text-foreground focus-visible:text-foreground"
                      >
                        <LocalIcon name={item.icon} className="h-4 w-4 shrink-0" />
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>

          <div className="hidden md:block xl:hidden">
              <nav
                aria-label="Footer sections"
                className="grid grid-cols-3 border-b border-black/8 pb-9 pt-3 text-muted-foreground"
              >
                {FOOTER_LINK_SECTIONS.map((section, index) => (
                  <details
                    key={section.title}
                    className={`group px-8 ${index > 0 ? 'border-l border-black/10' : ''}`}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-center gap-12 text-base font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
                      {section.title}
                      <LocalIcon name="chevron-down" className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="mx-auto mt-4 max-w-[10rem] space-y-2 text-center text-sm">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            prefetch={link.prefetch}
                            className="transition-colors md:hover:text-foreground focus-visible:text-foreground"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </nav>

              <section className="grid grid-cols-[minmax(14rem,0.75fr)_minmax(20rem,1fr)] items-center gap-8 border-b border-black/8 py-10">
                <div className="flex min-w-0 items-center gap-4 text-muted-foreground">
                  <LocalIcon name="mail" className="h-7 w-7 text-foreground" />
                  <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h2 className="text-lg font-semibold text-foreground">Stay in the loop</h2>
                    <p className="text-sm leading-5">Get updates and offers.</p>
                  </div>
                </div>
                <HomepageNewsletterForm
                  variant="light"
                  source="footer"
                  layout="inline"
                  density="spacious"
                  submitDisplay="icon"
                />
              </section>

              <section
                aria-label="Boilabin contact"
                className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-b border-black/8 py-8"
              >
                <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-muted-foreground">
                  <Link
                    href="/"
                    className="text-2xl font-semibold leading-none text-foreground"
                    aria-label="Boilabin home"
                  >
                    Boilabin
                  </Link>
                  <span aria-hidden="true" className="h-9 w-px bg-black/10" />
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="inline-flex items-center gap-3 transition-colors md:hover:text-foreground focus-visible:text-foreground"
                  >
                    <LocalIcon name="mail" className="h-5 w-5 text-foreground" /> {CONTACT_EMAIL}
                  </a>
                  <span aria-hidden="true" className="h-9 w-px bg-black/10" />
                  <a
                    href={`tel:${CONTACT_PHONE}`}
                    className="inline-flex items-center gap-3 transition-colors md:hover:text-foreground focus-visible:text-foreground"
                  >
                    <LocalIcon name="phone" className="h-5 w-5 text-foreground" /> {CONTACT_PHONE}
                  </a>
                </div>
                <div className="flex items-center gap-5">
                  {SOCIAL_LINKS.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-foreground transition-colors md:hover:border-primary/20 md:hover:text-primary focus-visible:border-primary/20 focus-visible:text-primary"
                    >
                      <LocalIcon name={item.icon} className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-8 pt-8">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
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
                <span aria-hidden="true" className="h-10 w-px bg-black/10" />
                <p className="flex items-center justify-end gap-4 text-sm text-muted-foreground">
                  <LocalIcon name="shopping-bag" className="h-5 w-5 text-muted-foreground" />
                  <span>&copy; {new Date().getFullYear()} Boilabin. All rights reserved.</span>
                </p>
              </div>
          </div>

          <nav aria-label="Footer sections" className="space-y-1 md:hidden">
              {FOOTER_LINK_SECTIONS.map((section) => (
                <details
                  key={section.title}
                  className="group overflow-hidden border-b border-black/8"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1.5 text-[0.86rem] font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                    {section.title}
                    <LocalIcon name="chevron-down" className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="space-y-0.5 pb-1">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          prefetch={link.prefetch}
                          className="block rounded-lg py-1 text-[0.82rem] text-muted-foreground transition-colors md:hover:text-foreground focus-visible:text-foreground"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
          </nav>

          <div className="mt-2.5 grid gap-2.5 pt-0 min-[600px]:mt-5 min-[600px]:grid-cols-[minmax(0,1fr)_minmax(16rem,0.78fr)] min-[600px]:items-start min-[600px]:gap-6 min-[600px]:border-t min-[600px]:border-black/8 min-[600px]:pt-4 md:hidden xl:mt-6 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.62fr)] xl:items-center xl:gap-9">
            <section className="order-3 min-[600px]:order-1">
              <h2 className="text-[0.82rem] font-semibold text-foreground min-[600px]:text-sm">Checkout payment options</h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 min-[600px]:mt-2 min-[600px]:gap-x-3.5 lg:gap-x-4">
                {FOOTER_PAYMENT_LOGOS.map((method) => (
                  <img
                    key={method.alt}
                    src={method.src}
                    alt={method.alt}
                    width={method.width}
                    height={method.height}
                    loading="eager"
                    decoding="async"
                    className={`${method.className} block w-auto origin-left scale-[0.92] object-contain min-[600px]:scale-100`}
                  />
                ))}
              </div>
            </section>

            <section className="order-1 min-[600px]:order-2 min-[600px]:max-w-[20rem] min-[600px]:justify-self-end lg:max-w-none">
              <h2 className="text-[0.82rem] font-semibold text-foreground min-[600px]:text-sm">Stay in the loop</h2>
              <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground min-[600px]:mt-1 min-[600px]:text-xs min-[600px]:leading-5">
                Get launch updates and selected store notices.
              </p>
              <div className="mt-1.5 min-[600px]:mt-2">
                <HomepageNewsletterForm variant="light" source="footer" layout="inline" />
              </div>
            </section>

            <section aria-label="Boilabin contact" className="order-2 pt-1 md:hidden">
              <Link href="/" className="inline-flex items-center gap-3" aria-label="Boilabin home">
                <span className="font-display text-[1.16rem] font-bold leading-none tracking-normal text-foreground">
                  Boilabin
                </span>
              </Link>
              <p className="mt-1 max-w-[28rem] text-[0.82rem] leading-5 text-muted-foreground">
                Everyday finds. Best deals. Delivered across Bangladesh.
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-muted-foreground">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-1.5 transition-colors md:hover:text-foreground focus-visible:text-foreground"
                >
                  <LocalIcon name="mail" className="h-3 w-3 text-primary/70" /> {CONTACT_EMAIL}
                </a>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="inline-flex items-center gap-1.5 transition-colors md:hover:text-foreground focus-visible:text-foreground"
                >
                  <LocalIcon name="phone" className="h-3 w-3 text-primary/70" /> {CONTACT_PHONE}
                </a>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={item.label}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-foreground transition-colors md:hover:bg-primary/8 md:hover:text-primary focus-visible:bg-primary/8 focus-visible:text-primary"
                  >
                    <LocalIcon name={item.icon} className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="w-full border-t border-black/6 py-2 text-[11px] text-muted-foreground min-[600px]:py-3 min-[600px]:text-xs md:hidden xl:block">
          <div className="flex w-full flex-col items-center justify-between gap-1.5 min-[700px]:flex-row">
            <p className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span>&copy; {new Date().getFullYear()} Boilabin</span>
              <span>All rights reserved.</span>
            </p>
            <div className="hidden flex-wrap items-center justify-center gap-x-3 gap-y-2 min-[700px]:flex min-[700px]:justify-end">
              {BOTTOM_LEGAL_LINKS.map((link, index) => (
                <span key={link.href} className="inline-flex items-center gap-3">
                  {index > 0 ? <span aria-hidden="true" className="text-black/20">|</span> : null}
                  <Link
                    href={link.href}
                    className="transition-colors md:hover:text-foreground focus-visible:text-foreground"
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
