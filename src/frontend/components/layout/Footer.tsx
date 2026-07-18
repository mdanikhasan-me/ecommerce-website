import Link from 'next/link'
import { APP_BADGE_ASSETS, PAYMENT_ASSETS } from '@/shared/assets'
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  WHATSAPP_URL,
} from '@/shared/contact'
import { BrandWordmark } from '@/frontend/components/layout/BrandWordmark'
import { FooterAccountLinks } from '@/frontend/components/layout/FooterAccountLinks'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'

const YOUTUBE_URL = 'https://www.youtube.com/@Boilabin'
const TRUSTPILOT_REVIEW_URL = 'https://www.trustpilot.com/review/boilabin.com'
const TRUSTPILOT_ICON_SRC = '/assets/icons/social/trustpilot.svg'
const APP_BADGE_PLACEHOLDER_HREF = '#'

const WHATSAPP_LINK = {
  icon: 'whatsapp',
  href: WHATSAPP_URL,
  label: 'WhatsApp',
} as const satisfies {
  icon: StorefrontIconName
  href: string
  label: string
}

const SOCIAL_LINKS = [
  { icon: 'facebook', href: FACEBOOK_URL, label: 'Facebook' },
  { icon: 'instagram', href: INSTAGRAM_URL, label: 'Instagram' },
  { icon: 'youtube', href: YOUTUBE_URL, label: 'YouTube' },
] as const satisfies ReadonlyArray<{
  icon: StorefrontIconName
  href: string
  label: string
}>

const SOCIAL_AND_CONTACT_LINKS = [...SOCIAL_LINKS, WHATSAPP_LINK] as const

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

const FOOTER_APP_BADGES = [
  APP_BADGE_ASSETS.APP_STORE,
  APP_BADGE_ASSETS.GOOGLE_PLAY,
] as const

const MOBILE_FOOTER_LINK_ICONS: Record<string, StorefrontIconName> = {
  '/auth/login': 'user',
  '/account': 'settings',
  '/account/orders': 'receipt-text',
  '/account/addresses': 'map-pin',
  '/wishlist': 'bookmark-plus',
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

function TrustpilotReviewLine({
  className = '',
  canWrap = false,
}: {
  className?: string
  canWrap?: boolean
}) {
  return (
    <p
      className={`${canWrap ? '' : 'whitespace-nowrap'} text-sm leading-5 text-muted-foreground ${className}`}
    >
      <span className={canWrap ? 'block min-[1024px]:inline' : ''}>
        See our reviews on
      </span>{' '}
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
          loading="lazy"
          decoding="async"
          className="block h-auto w-[5.45rem] max-w-none object-contain"
        />
      </a>
    </p>
  )
}

function FooterAppBadges({
  className = '',
  imageClassName = 'h-auto w-[7.5rem]',
  badgesClassName = 'mt-2.5 grid justify-start gap-2',
  titleClassName = 'text-xs font-medium leading-4 text-foreground/82',
}: {
  className?: string
  imageClassName?: string
  badgesClassName?: string
  titleClassName?: string
}) {
  return (
    <div className={className}>
      <p className={titleClassName}>Apps launching soon</p>
      <div className={badgesClassName}>
        {FOOTER_APP_BADGES.map((badge) => (
          <a
            key={badge.alt}
            href={APP_BADGE_PLACEHOLDER_HREF}
            aria-label={`${badge.alt} coming soon`}
            className="inline-flex focus:outline-none"
          >
            <img
              src={badge.src}
              alt={badge.alt}
              width={badge.width}
              height={badge.height}
              loading="lazy"
              decoding="async"
              className={`${imageClassName} block max-w-none object-contain`}
            />
          </a>
        ))}
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="storefront-footer border-t border-black/8 text-foreground">
      <div className="storefront-frame">
        <div className="w-full pb-5 pt-4 min-[560px]:py-3 xl:py-8">
          <div className="hidden gap-10 xl:grid xl:grid-cols-[minmax(15rem,0.9fr)_minmax(0,2.3fr)_minmax(16rem,0.85fr)] xl:items-start">
            <section aria-label="Boilabin contact" className="max-w-[18rem]">
              <Link
                href="/"
                className="inline-flex w-fit items-center leading-none"
                aria-label="Boilabin home"
              >
                <BrandWordmark variant="art" className="h-[44px]" />
              </Link>
              <p className="mt-2.5 max-w-[28rem] text-sm leading-6 text-muted-foreground lg:max-w-[17rem]">
                Everyday finds. Best deals. Delivered across Bangladesh.
              </p>
              <div className="mt-4 grid gap-3 text-sm font-normal leading-5 text-muted-foreground">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-3 focus:outline-none"
                >
                  <LocalIcon name="mail" className="h-4 w-4 text-foreground" />
                  <span className="min-w-0 truncate">{CONTACT_EMAIL}</span>
                </a>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-3 focus:outline-none"
                >
                  <LocalIcon name="phone" className="h-4 w-4 text-foreground" />
                  <span>{CONTACT_PHONE}</span>
                </a>
                <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-3">
                  <LocalIcon
                    name="location"
                    className="mt-0.5 h-4 w-4 text-foreground"
                  />
                  <span className="max-w-[13.5rem] text-balance">
                    {CONTACT_ADDRESS}
                  </span>
                </div>
              </div>
            </section>

            <nav
              aria-label="Footer"
              className="grid min-w-0 grid-cols-4 gap-x-8 gap-y-5"
            >
              {DESKTOP_FOOTER_LINK_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h2 className="text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-foreground/88">
                    {section.title}
                  </h2>
                  {section.title === 'Account' ? (
                    <FooterAccountLinks variant="desktop" />
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

            <aside aria-label="Boilabin social and apps" className="min-w-0">
              <h2 className="text-[0.82rem] font-semibold uppercase tracking-[0.08em] text-foreground/88">
                Stay connected
              </h2>
              <div className="mt-4 flex items-center gap-3">
                {SOCIAL_AND_CONTACT_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={
                      item.href.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                    aria-label={item.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-foreground focus:outline-none"
                  >
                    <LocalIcon name={item.icon} className="h-4 w-4" />
                  </a>
                ))}
              </div>
              <TrustpilotReviewLine className="mt-5" />
              <div className="mt-4 border-t border-black/8 pt-4">
                <FooterAppBadges
                  titleClassName="text-[0.82rem] font-semibold uppercase leading-4 tracking-[0.08em] text-foreground/88"
                  badgesClassName="mt-3 flex items-center gap-3"
                />
              </div>
            </aside>
          </div>

          <div className="hidden min-[560px]:block xl:hidden">
            <div className="grid gap-6 py-6 min-[820px]:gap-7">
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_auto] items-start gap-x-4 gap-y-5 min-[700px]:grid-cols-[minmax(13.5rem,1fr)_minmax(10.5rem,0.9fr)_auto] min-[700px]:gap-x-6 min-[820px]:grid-cols-[minmax(14.5rem,1fr)_minmax(12rem,0.9fr)_auto] min-[820px]:gap-x-8 min-[1024px]:grid-cols-[minmax(15.5rem,1fr)_minmax(13rem,0.9fr)_auto] min-[1024px]:gap-x-10">
                <section aria-label="Boilabin contact" className="min-w-0">
                  <div className="min-w-0">
                    <Link
                      href="/"
                      className="inline-flex w-fit items-center leading-none"
                      aria-label="Boilabin home"
                    >
                      <BrandWordmark variant="art" className="h-[38px]" />
                    </Link>
                    <p className="mt-3 max-w-[13.5rem] text-sm leading-6 text-muted-foreground">
                      Everyday finds. Best deals. Delivered across Bangladesh.
                    </p>
                    <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                      <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="flex min-w-0 items-center gap-2 focus:outline-none"
                      >
                        <LocalIcon
                          name="mail"
                          className="h-4 w-4 text-foreground/55"
                        />
                        <span className="truncate">{CONTACT_EMAIL}</span>
                      </a>
                      <a
                        href={`tel:${CONTACT_PHONE}`}
                        className="flex items-center gap-2 whitespace-nowrap focus:outline-none"
                      >
                        <LocalIcon
                          name="phone"
                          className="h-4 w-4 text-foreground/55"
                        />
                        {CONTACT_PHONE}
                      </a>
                    </div>
                  </div>
                </section>

                <aside
                  className="min-w-0"
                  aria-label="Boilabin social and apps"
                >
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold leading-5 text-foreground">
                      Stay connected
                    </h2>
                    <div className="mt-4 flex flex-wrap items-center gap-2.5">
                      {SOCIAL_AND_CONTACT_LINKS.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          target={
                            item.href.startsWith('http') ? '_blank' : undefined
                          }
                          rel={
                            item.href.startsWith('http')
                              ? 'noopener noreferrer'
                              : undefined
                          }
                          aria-label={item.label}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-foreground focus:outline-none"
                        >
                          <LocalIcon name={item.icon} className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
                    <TrustpilotReviewLine
                      canWrap
                      className="mt-5 text-xs min-[1024px]:text-sm [&_img]:!w-[5.1rem] min-[1024px]:[&_img]:!w-[5.45rem]"
                    />
                  </div>
                </aside>
                <FooterAppBadges
                  className="min-w-0 justify-self-end"
                  badgesClassName="mt-2.5 grid justify-items-end gap-2"
                />
              </div>

              <nav
                aria-label="Footer sections"
                className="grid min-w-0 grid-cols-4 gap-x-3 border-t border-black/8 pt-6 text-muted-foreground min-[700px]:gap-x-6 min-[820px]:gap-x-10 min-[1024px]:gap-x-14"
              >
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
                      <FooterAccountLinks variant="tablet" />
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
                <span className="whitespace-nowrap">
                  &copy; {new Date().getFullYear()} Boilabin. All rights
                  reserved.
                </span>
              </p>
            </div>
          </div>

          <div className="min-[560px]:hidden">
            <section aria-label="Boilabin contact" className="text-center">
              <Link
                href="/"
                className="inline-flex w-fit justify-center leading-none"
                aria-label="Boilabin home"
              >
                <BrandWordmark variant="art" className="h-[34px]" />
              </Link>
              <p className="mx-auto mt-2.5 max-w-[17.5rem] text-[15px] leading-6 text-muted-foreground">
                Everyday finds. Best deals. Delivered across Bangladesh.
              </p>
              <div className="mx-auto mt-4 grid min-w-0 justify-items-center gap-2.5 text-sm leading-none text-muted-foreground">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex min-w-0 items-center justify-center gap-2 focus:outline-none"
                >
                  <LocalIcon
                    name="mail"
                    className="h-[1.05rem] w-[1.05rem] shrink-0 text-foreground/55"
                  />
                  <span className="min-w-0 truncate">{CONTACT_EMAIL}</span>
                </a>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="flex min-w-0 items-center justify-center gap-2 whitespace-nowrap focus:outline-none"
                >
                  <LocalIcon
                    name="phone"
                    className="h-[1.05rem] w-[1.05rem] shrink-0 text-foreground/55"
                  />
                  <span>{CONTACT_PHONE}</span>
                </a>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2.5">
                {SOCIAL_AND_CONTACT_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={
                      item.href.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                    aria-label={item.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-foreground focus:outline-none"
                  >
                    <LocalIcon name={item.icon} className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
              <TrustpilotReviewLine className="mt-2.5 justify-center whitespace-nowrap" />
            </section>

            <nav
              aria-label="Footer sections"
              className="mt-5 border-t border-black/10"
            >
              {MOBILE_FOOTER_LINK_SECTIONS.map((section) => (
                <details
                  key={section.title}
                  className="group border-b border-black/10"
                >
                  <summary className="relative flex min-h-14 cursor-pointer list-none items-center justify-center text-center text-sm font-medium text-foreground/90 focus:outline-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-center gap-3">
                      <LocalIcon
                        name={MOBILE_FOOTER_SECTION_ICONS[section.title]}
                        className="h-[1.15rem] w-[1.15rem] text-foreground/90"
                      />
                      {section.title}
                    </span>
                    <LocalIcon
                      name="chevron-down"
                      className="absolute right-0 h-4 w-4 shrink-0 text-foreground/90 group-open:rotate-180"
                    />
                  </summary>
                  {section.title === 'Account' ? (
                    <FooterAccountLinks variant="mobile" />
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
              <h2 className="text-[13px] font-medium leading-4 text-foreground/82">
                We accept
              </h2>
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
          <div className="flex w-full flex-col items-center justify-between gap-1.5 min-[700px]:flex-row xl:grid xl:grid-cols-[auto_minmax(0,1fr)_auto]">
            <div className="hidden items-center justify-start gap-x-3 xl:col-start-1 xl:row-start-1 xl:flex">
              <span className="whitespace-nowrap text-[11px] font-medium text-foreground/82">
                We accept
              </span>
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
            <p className="flex flex-nowrap items-center justify-center gap-2 whitespace-nowrap xl:col-start-3 xl:row-start-1 xl:justify-end">
              <span>&copy; {new Date().getFullYear()} Boilabin</span>
              <span>All rights reserved.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
