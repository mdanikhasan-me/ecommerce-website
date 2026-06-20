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

const MOBILE_FOOTER_LINK_SECTIONS: FooterLinkSection[] = [
  FOOTER_LINK_SECTIONS[2],
  FOOTER_LINK_SECTIONS[1],
  FOOTER_LINK_SECTIONS[0],
]

const MOBILE_FOOTER_LINK_ICONS: Record<string, StorefrontIconName> = {
  '/auth/login': 'user',
  '/account': 'settings',
  '/account/orders': 'receipt-text',
  '/wishlist': 'heart',
  '/help': 'help-circle',
  '/track-order': 'truck',
  '/shipping': 'package',
  '/returns': 'refresh-ccw',
  '/contact': 'mail',
  '/category': 'grid-3x3',
  '/new-arrivals': 'sparkles',
  '/search?bestSeller=true': 'star',
}

const MOBILE_FOOTER_SECTION_ICONS: Record<string, StorefrontIconName> = {
  Account: 'user',
  Support: 'life-buoy',
  Shop: 'shopping-bag',
}

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
    <footer className="storefront-footer border-t border-black/8 bg-[#f6f7f9] text-foreground">
      <div className="container-site">
        <div className="w-full pb-5 pt-4 min-[560px]:py-3 xl:py-8">
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
                  className="inline-flex items-center gap-1.5 transition-colors min-[1025px]:hover:text-foreground focus-visible:text-foreground"
                >
                  <LocalIcon name="mail" className="h-3.5 w-3.5 text-primary/70" /> {CONTACT_EMAIL}
                </a>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="inline-flex items-center gap-1.5 transition-colors min-[1025px]:hover:text-foreground focus-visible:text-foreground"
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
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-foreground transition-colors min-[1025px]:hover:bg-primary/8 min-[1025px]:hover:text-primary focus-visible:bg-primary/8 focus-visible:text-primary"
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
                          className="text-sm leading-5 text-muted-foreground transition-colors min-[1025px]:hover:text-foreground focus-visible:text-foreground"
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
                        className="inline-flex items-center gap-2.5 text-sm leading-5 text-muted-foreground transition-colors min-[1025px]:hover:text-foreground focus-visible:text-foreground"
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

          <div className="hidden min-[560px]:block xl:hidden">
            <section
              aria-label="Boilabin contact"
              className="flex items-center justify-between gap-4 border-b border-black/8 pb-3"
            >
              <div className="flex min-w-0 items-center gap-3 text-xs text-muted-foreground min-[768px]:gap-5 min-[900px]:gap-7 min-[768px]:text-sm">
                <Link
                  href="/"
                  className="inline-flex shrink-0 items-center gap-3"
                  aria-label="Boilabin home"
                >
                  <span className="font-display text-[1.08rem] font-bold leading-none tracking-normal text-foreground min-[768px]:text-[1.32rem] min-[900px]:text-[1.42rem]">
                    Boilabin
                  </span>
                </Link>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex min-w-0 items-center gap-1.5 truncate transition-colors focus-visible:text-foreground"
                >
                  <LocalIcon name="mail" className="h-3 w-3 text-primary/70 min-[700px]:h-3.5 min-[700px]:w-3.5" />
                  <span className="truncate">{CONTACT_EMAIL}</span>
                </a>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap transition-colors focus-visible:text-foreground"
                >
                  <LocalIcon name="phone" className="h-3 w-3 text-primary/70 min-[700px]:h-3.5 min-[700px]:w-3.5" /> {CONTACT_PHONE}
                </a>
              </div>
              <div className="flex shrink-0 items-center gap-2.5 min-[900px]:gap-4">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-foreground transition-colors focus-visible:border-primary/20 focus-visible:text-primary min-[768px]:h-9 min-[768px]:w-9"
                  >
                    <LocalIcon name={item.icon} className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </section>

            <nav
              aria-label="Footer sections"
              className="mx-auto grid w-full max-w-[40rem] grid-cols-3 gap-x-5 gap-y-3 py-3 text-muted-foreground min-[820px]:max-w-[45rem] min-[820px]:gap-x-8 min-[1024px]:max-w-[48rem]"
            >
              {FOOTER_LINK_SECTIONS.map((section) => (
                <div key={section.title} className="mx-auto w-full max-w-[9rem] min-w-0 text-left">
                  <h2 className="text-sm font-semibold leading-5 text-foreground/88">
                    {section.title}
                  </h2>
                  <ul className="mt-2 space-y-1 text-sm leading-5">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          prefetch={link.prefetch}
                          className="transition-colors focus-visible:text-foreground"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <section className="grid items-center gap-4 border-y border-black/8 py-3 min-[700px]:grid-cols-[minmax(0,1fr)_minmax(17rem,21rem)] min-[820px]:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)] min-[900px]:gap-6">
              <div className="flex min-w-0 items-center gap-3 text-muted-foreground">
                <LocalIcon name="mail" className="h-5 w-5 text-primary/70" />
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="text-sm font-semibold text-foreground">Stay in the loop</h2>
                  <p className="text-xs leading-5">Get updates and offers.</p>
                </div>
              </div>
              <div className="w-full min-[700px]:ml-auto min-[700px]:max-w-[21rem] min-[820px]:max-w-[22rem]">
                <HomepageNewsletterForm
                  variant="light"
                  source="footer"
                  layout="inline"
                  density="compact"
                  submitDisplay="icon"
                />
              </div>
            </section>

            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 pt-2.5 min-[700px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] min-[820px]:gap-8">
              <div className="flex items-center gap-x-4 min-[820px]:gap-x-5">
                {FOOTER_PAYMENT_LOGOS.map((method) => (
                  <img
                    key={method.alt}
                    src={method.src}
                    alt={method.alt}
                    width={method.width}
                    height={method.height}
                    loading="lazy"
                    decoding="async"
                    className={`${method.className} block w-auto object-contain`}
                  />
                ))}
              </div>
              <p className="flex items-center justify-end text-right text-xs text-muted-foreground min-[700px]:text-sm">
                <span className="whitespace-nowrap">&copy; {new Date().getFullYear()} Boilabin. All rights reserved.</span>
              </p>
            </div>
          </div>

          <div className="min-[560px]:hidden">
            <section aria-label="Boilabin contact">
              <div className="flex items-center justify-between gap-4">
                <Link href="/" className="inline-flex items-center gap-3" aria-label="Boilabin home">
                  <span className="font-display text-[1.55rem] font-semibold leading-none tracking-normal text-foreground">
                    Boilabin
                  </span>
                </Link>
                <div className="flex items-center gap-2">
                  {SOCIAL_LINKS.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      aria-label={item.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-foreground focus-visible:border-primary/20 focus-visible:text-primary"
                    >
                      <LocalIcon name={item.icon} className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-2.5 text-[13px] text-muted-foreground">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex h-12 min-w-0 items-center gap-2 rounded-xl border border-black/10 bg-white px-2.5 transition-colors focus-visible:border-primary/20 focus-visible:text-foreground"
                >
                  <LocalIcon name="mail" className="h-[1.1rem] w-[1.1rem] text-primary/70" />
                  <span className="min-w-0 truncate">{CONTACT_EMAIL}</span>
                </a>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="flex h-12 min-w-0 items-center gap-2 rounded-xl border border-black/10 bg-white px-2.5 transition-colors focus-visible:border-primary/20 focus-visible:text-foreground"
                >
                  <LocalIcon name="phone" className="h-[1.1rem] w-[1.1rem] text-primary/70" />
                  <span className="min-w-0 truncate">{CONTACT_PHONE}</span>
                </a>
              </div>
            </section>

            <nav aria-label="Footer sections" className="mt-5 border-t border-black/8">
              {MOBILE_FOOTER_LINK_SECTIONS.map((section) => (
                <details key={section.title} className="group border-b border-black/8">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-sm font-normal text-foreground/82 focus:outline-none focus-visible:bg-black/[0.02] [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-3">
                      <LocalIcon
                        name={MOBILE_FOOTER_SECTION_ICONS[section.title]}
                        className="h-5 w-5 text-primary/55"
                      />
                      {section.title}
                    </span>
                    <LocalIcon name="chevron-down" className="h-4 w-4 shrink-0 text-muted-foreground/80 transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="ml-9 divide-y divide-black/8 pb-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          prefetch={link.prefetch}
                          className="flex items-center gap-2.5 py-2 text-sm text-muted-foreground transition-colors focus-visible:text-foreground"
                        >
                          <LocalIcon
                            name={MOBILE_FOOTER_LINK_ICONS[link.href]}
                            className="h-3.5 w-3.5 text-primary/65"
                          />
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </nav>

            <section className="pt-5">
              <h2 className="text-[15px] font-medium text-foreground/88">Stay in the loop</h2>
              <div className="mt-3 [&_button]:h-12 [&_button]:w-12 [&_input]:h-12 [&_input]:text-sm">
                <HomepageNewsletterForm variant="light" source="footer" layout="inline" />
              </div>
            </section>

            <section className="pb-1 pt-5">
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 py-1">
                {FOOTER_PAYMENT_LOGOS.map((method) => (
                  <img
                    key={method.alt}
                    src={method.src}
                    alt={method.alt}
                    width={method.width}
                    height={method.height}
                    loading="lazy"
                    decoding="async"
                    className={`${method.className} block w-auto origin-center scale-110 object-contain`}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="w-full border-t border-black/8 py-5 text-[12px] text-muted-foreground min-[560px]:hidden min-[560px]:py-3 xl:block xl:text-[11px]">
          <div className="flex w-full flex-col items-center justify-between gap-1.5 min-[700px]:flex-row xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <p className="flex flex-nowrap items-center justify-center gap-2 whitespace-nowrap lg:justify-start">
              <span>&copy; {new Date().getFullYear()} Boilabin</span>
              <span>All rights reserved.</span>
            </p>
            <div className="hidden items-center justify-center gap-x-4 xl:flex">
              {FOOTER_PAYMENT_LOGOS.map((method) => (
                <img
                  key={method.alt}
                  src={method.src}
                  alt={method.alt}
                  width={method.width}
                  height={method.height}
                  loading="lazy"
                  decoding="async"
                  className={`${method.className} block w-auto object-contain`}
                />
              ))}
            </div>
            <div className="hidden flex-wrap items-center justify-center gap-x-5 gap-y-2 min-[700px]:flex min-[700px]:justify-end">
              {BOTTOM_LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors min-[1025px]:hover:text-foreground focus-visible:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
