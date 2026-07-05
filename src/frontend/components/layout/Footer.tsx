import Link from 'next/link'
import { cookies } from 'next/headers'
import { PAYMENT_ASSETS } from '@/shared/assets'
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, FACEBOOK_URL, INSTAGRAM_URL, WHATSAPP_URL } from '@/shared/contact'
import { BrandWordmark } from '@/frontend/components/layout/BrandWordmark'
import { FooterAccountLinks } from '@/frontend/components/layout/FooterAccountLinks'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'

const YOUTUBE_URL = 'https://www.youtube.com/@Boilabin'
const TRUSTPILOT_REVIEW_URL = 'https://www.trustpilot.com/review/boilabin.com'
const TRUSTPILOT_ICON_SRC = '/assets/icons/social/trustpilot.svg'

const WHATSAPP_LINK = { icon: 'whatsapp', href: WHATSAPP_URL, label: 'WhatsApp' } as const satisfies {
  icon: StorefrontIconName
  href: string
  label: string
}

const SOCIAL_LINKS = [
  { icon: 'facebook', href: FACEBOOK_URL, label: 'Facebook' },
  { icon: 'instagram', href: INSTAGRAM_URL, label: 'Instagram' },
  { icon: 'youtube', href: YOUTUBE_URL, label: 'YouTube' },
] as const satisfies ReadonlyArray<{ icon: StorefrontIconName; href: string; label: string }>

const SOCIAL_AND_CONTACT_LINKS = [...SOCIAL_LINKS, WHATSAPP_LINK] as const

const SESSION_COOKIE_PREFIXES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
] as const

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

function isSessionCookieName(cookieName: string) {
  return SESSION_COOKIE_PREFIXES.some((prefix) => {
    if (cookieName === prefix) return true
    const suffix = cookieName.slice(prefix.length)
    return /^\.\d+$/.test(suffix)
  })
}

async function hasAuthSessionCookie() {
  const cookieStore = await cookies()
  return cookieStore.getAll().some((cookie) => isSessionCookieName(cookie.name))
}

const FOOTER_LINK_SECTIONS: FooterLinkSection[] = [
  {
    title: 'Shop',
    links: [
      { label: 'All categories', href: '/category' },
      { label: 'Featured Products', href: '/search?featured=true' },
      { label: 'New arrivals', href: '/new-arrivals' },
      { label: 'Best Sellers', href: '/search?bestSeller=true' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help center', href: '/help' },
      { label: 'Track order', href: '/track-order' },
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
      { label: 'Add address', href: '/account/addresses', prefetch: false },
      { label: 'Wishlist', href: '/wishlist' },
    ],
  },
  {
    title: 'More',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Sitemap', href: '/sitemap.xml' },
    ],
  },
]

const MOBILE_FOOTER_LINK_ICONS: Record<string, StorefrontIconName> = {
  '/auth/login': 'user',
  '/account': 'settings',
  '/account/orders': 'receipt-text',
  '/account/addresses': 'map-pin',
  '/wishlist': 'heart',
  '/about': 'message-circle',
  '/privacy': 'shield',
  '/terms': 'receipt-text',
  '/sitemap.xml': 'grid',
  '/help': 'help-circle',
  '/track-order': 'truck',
  '/returns': 'refresh-ccw',
  '/contact': 'mail',
  '/category': 'grid-3x3',
  '/search?featured=true': 'tag',
  '/new-arrivals': 'sparkles',
  '/search?bestSeller=true': 'star',
}

const MOBILE_FOOTER_SECTION_ICONS: Record<string, StorefrontIconName> = {
  Account: 'user',
  Support: 'headset',
  Shop: 'shopping-bag',
  More: 'more-horizontal',
}

const TABLET_FOOTER_LINK_SECTIONS: FooterLinkSection[] = FOOTER_LINK_SECTIONS
const MOBILE_FOOTER_LINK_SECTIONS: FooterLinkSection[] = FOOTER_LINK_SECTIONS
const DESKTOP_FOOTER_LINK_SECTIONS: FooterLinkSection[] = FOOTER_LINK_SECTIONS

function TrustpilotReviewLine({ className = '' }: { className?: string }) {
  return (
    <p className={`whitespace-nowrap text-sm leading-5 text-muted-foreground ${className}`}>
      <span>See our reviews on</span>{' '}
      <a
        href={TRUSTPILOT_REVIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block align-[-0.22em] focus:outline-none"
      >
        <img
          src={TRUSTPILOT_ICON_SRC}
          alt="Trustpilot"
          width={86}
          height={21}
          loading="eager"
          decoding="async"
          className="block h-auto w-[5.45rem] max-w-none object-contain"
        />
      </a>
    </p>
  )
}

export async function Footer() {
  const isInitiallyAuthenticated = await hasAuthSessionCookie()

  return (
    <footer className="storefront-footer border-t border-black/8 text-foreground">
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
              <div className="mt-4 grid gap-2.5 text-sm font-normal leading-5 text-muted-foreground">
                <div className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/8 bg-black/[0.03] text-foreground/70">
                    <LocalIcon name="location" className="h-3.5 w-3.5" />
                  </span>
                  <span className="max-w-[13.5rem] text-balance">{CONTACT_ADDRESS}</span>
                </div>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 focus:outline-none"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/8 bg-black/[0.03] text-foreground/70">
                    <LocalIcon name="phone" className="h-3.5 w-3.5" />
                  </span>
                  <span>{CONTACT_PHONE}</span>
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 focus:outline-none"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/8 bg-black/[0.03] text-foreground/70">
                    <LocalIcon name="mail" className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 truncate">{CONTACT_EMAIL}</span>
                </a>
              </div>
              {/* Mobile only: social icons stay under the address. Desktop uses More instead of a Social column. */}
              <div className="mt-3 flex items-center gap-2 min-[600px]:hidden">
                {SOCIAL_AND_CONTACT_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={item.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-foreground focus:outline-none"
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
                  {section.title === 'Account' ? (
                    <FooterAccountLinks variant="desktop" isInitiallyAuthenticated={isInitiallyAuthenticated} />
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            prefetch={link.prefetch}
                            className="text-sm leading-5 text-muted-foreground focus:outline-none"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

            </nav>
          </div>

          <div className="hidden min-[560px]:block xl:hidden">
            <div className="grid gap-6 py-5 min-[700px]:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)] min-[820px]:gap-8 min-[1024px]:grid-cols-[minmax(18.5rem,0.8fr)_minmax(0,1.2fr)] min-[1024px]:gap-12">
              <section
                aria-label="Boilabin contact"
                className="min-w-0 min-[560px]:grid min-[560px]:grid-cols-[minmax(0,1fr)_auto] min-[560px]:items-start min-[560px]:gap-x-8 min-[700px]:block min-[700px]:border-r min-[700px]:border-black/8 min-[700px]:pr-4 min-[820px]:pr-5"
              >
                <div className="min-w-0">
                  <Link href="/" className="inline-flex" aria-label="Boilabin home">
                    <span className="font-display text-[1.35rem] font-bold leading-none tracking-normal text-foreground">
                      Boilabin
                    </span>
                  </Link>
                  <p className="mt-3 max-w-[13rem] text-xs leading-5 text-muted-foreground min-[820px]:text-sm">
                    Everyday finds. Best deals. Delivered across Bangladesh.
                  </p>
                  <div className="mt-5 space-y-3 text-xs text-muted-foreground min-[820px]:text-sm">
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="flex min-w-0 items-center gap-2 focus:outline-none"
                    >
                      <LocalIcon name="mail" className="h-4 w-4 text-primary/70" />
                      <span className="truncate">{CONTACT_EMAIL}</span>
                    </a>
                    <a
                      href={`tel:${CONTACT_PHONE}`}
                      className="flex items-center gap-2 whitespace-nowrap focus:outline-none"
                    >
                      <LocalIcon name="phone" className="h-4 w-4 text-primary/70" />
                      {CONTACT_PHONE}
                    </a>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-[auto_auto] justify-start gap-4 min-[560px]:mt-0 min-[700px]:mt-5 min-[820px]:gap-5 min-[1024px]:gap-6">
                  <div>
                    <h2 className="whitespace-nowrap text-xs font-semibold text-foreground/88 min-[820px]:text-sm">Follow us</h2>
                    <div className="mt-2.5 flex items-center gap-2.5">
                      {SOCIAL_LINKS.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={item.label}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-foreground focus:outline-none"
                        >
                          <LocalIcon name={item.icon} className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="whitespace-nowrap text-xs font-semibold text-foreground/88 min-[820px]:text-sm">Reach us</h2>
                    <a
                      href={WHATSAPP_LINK.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={WHATSAPP_LINK.label}
                      className="mt-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-foreground focus:outline-none"
                    >
                      <LocalIcon name={WHATSAPP_LINK.icon} className="h-4 w-4" />
                    </a>
                  </div>
                  <TrustpilotReviewLine className="col-span-2 mt-2.5" />
                </div>
              </section>

              <nav aria-label="Footer sections" className="grid grid-cols-4 gap-x-3 text-muted-foreground min-[820px]:gap-x-5 min-[1024px]:gap-x-7">
                {TABLET_FOOTER_LINK_SECTIONS.map((section) => (
                  <div key={section.title} className="min-w-0">
                    <LocalIcon
                      name={MOBILE_FOOTER_SECTION_ICONS[section.title]}
                      className="h-5 w-5 text-foreground"
                    />
                    <h2 className="mt-2 text-sm font-semibold leading-5 text-foreground">
                      {section.title}
                    </h2>
                    {section.title === 'Account' ? (
                      <FooterAccountLinks variant="tablet" isInitiallyAuthenticated={isInitiallyAuthenticated} />
                    ) : (
                      <ul className="mt-3 space-y-2 text-xs leading-5 min-[820px]:text-sm">
                        {section.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              prefetch={link.prefetch}
                              className="focus:outline-none"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5 border-t border-black/8 py-4 min-[820px]:gap-8">
              <div className="flex items-center gap-x-3 min-[820px]:gap-x-4">
                <span className="whitespace-nowrap text-xs font-medium text-foreground/82 min-[820px]:text-sm">
                  We accept
                </span>
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
              </div>
              <p className="flex items-center justify-end text-right text-xs text-muted-foreground min-[820px]:text-sm">
                <span className="whitespace-nowrap">&copy; {new Date().getFullYear()} Boilabin. All rights reserved.</span>
              </p>
            </div>
          </div>

          <div className="min-[560px]:hidden">
            <section aria-label="Boilabin contact" className="text-center">
              <Link href="/" className="inline-flex justify-center" aria-label="Boilabin home">
                <BrandWordmark variant="art" className="h-[23px] w-[6.4rem] text-foreground" />
              </Link>
              <p className="mx-auto mt-2.5 max-w-[17.5rem] text-[15px] leading-6 text-muted-foreground">
                Everyday finds. Best deals. Delivered across Bangladesh.
              </p>
              <div className="mx-auto mt-4 grid min-w-0 justify-items-center gap-2.5 text-sm leading-none text-muted-foreground">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex min-w-0 items-center justify-center gap-2 focus:outline-none"
                >
                  <LocalIcon name="mail" className="h-[1.05rem] w-[1.05rem] shrink-0 text-foreground/55" />
                  <span className="min-w-0 truncate">{CONTACT_EMAIL}</span>
                </a>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="flex min-w-0 items-center justify-center gap-2 whitespace-nowrap focus:outline-none"
                >
                  <LocalIcon name="phone" className="h-[1.05rem] w-[1.05rem] shrink-0 text-foreground/55" />
                  <span>{CONTACT_PHONE}</span>
                </a>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2.5">
                {SOCIAL_AND_CONTACT_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={item.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-foreground focus:outline-none"
                  >
                    <LocalIcon name={item.icon} className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
              <TrustpilotReviewLine className="mt-2.5 justify-center whitespace-nowrap" />
            </section>

            <nav aria-label="Footer sections" className="mt-5 border-t border-black/10">
              {MOBILE_FOOTER_LINK_SECTIONS.map((section) => (
                <details key={section.title} className="group border-b border-black/10">
                  <summary className="relative flex cursor-pointer list-none items-center justify-center py-4 text-center text-sm font-medium text-foreground/90 focus:outline-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-center gap-3">
                      <LocalIcon
                        name={MOBILE_FOOTER_SECTION_ICONS[section.title]}
                        className="h-[1.15rem] w-[1.15rem] text-foreground/90"
                      />
                      {section.title}
                    </span>
                    <LocalIcon name="chevron-down" className="absolute right-0 h-4 w-4 shrink-0 text-foreground/90 group-open:rotate-180" />
                  </summary>
                  {section.title === 'Account' ? (
                    <FooterAccountLinks variant="mobile" isInitiallyAuthenticated={isInitiallyAuthenticated} />
                  ) : (
                    <ul className="ml-9 divide-y divide-black/8 pb-3">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            prefetch={link.prefetch}
                            className="flex items-center gap-2.5 py-2.5 text-[15px] text-muted-foreground focus:outline-none"
                          >
                            <LocalIcon
                              name={MOBILE_FOOTER_LINK_ICONS[link.href]}
                              className="h-3.5 w-3.5 text-muted-foreground"
                            />
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </details>
              ))}
            </nav>

            <section className="pb-1 pt-5 text-center">
              <h2 className="text-[13px] font-medium leading-4 text-foreground/82">We accept</h2>
              <div className="mt-2 flex items-center justify-center gap-x-4 py-1">
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

        <div className="w-full border-t border-black/8 py-3 text-[11px] text-muted-foreground min-[560px]:hidden min-[560px]:py-3 xl:block">
          <div className="flex w-full flex-col items-center justify-between gap-1.5 min-[700px]:flex-row xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <p className="flex flex-nowrap items-center justify-center gap-2 whitespace-nowrap lg:justify-start">
              <span>&copy; {new Date().getFullYear()} Boilabin</span>
              <span>All rights reserved.</span>
            </p>
            <div className="hidden items-center justify-center gap-x-3 xl:flex">
              <span className="whitespace-nowrap text-[11px] font-medium text-foreground/82">We accept</span>
              <div className="flex items-center gap-x-4">
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
            </div>
            <div className="hidden min-[700px]:block" aria-hidden="true" />
          </div>
        </div>
      </div>
    </footer>
  )
}
