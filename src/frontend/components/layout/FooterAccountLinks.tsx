'use client'

import Link from 'next/link'
import { useClientSession } from '@/frontend/hooks/useClientSession'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import type { StorefrontIconName } from '@/shared/storefront-icons'

type FooterAccountLinksVariant = 'desktop' | 'tablet' | 'mobile'

type FooterAccountLink = {
  label: string
  href: string
  icon: StorefrontIconName
  prefetch?: false
  signedOutOnly?: true
}

const ACCOUNT_LINKS: FooterAccountLink[] = [
  { label: 'Sign in', href: '/auth/login', icon: 'user', signedOutOnly: true },
  { label: 'My account', href: '/account', icon: 'settings', prefetch: false },
  { label: 'Orders', href: '/account/orders', icon: 'receipt-text', prefetch: false },
  { label: 'Add address', href: '/account/addresses', icon: 'map-pin', prefetch: false },
  { label: 'Wishlist', href: '/wishlist', icon: 'bookmark-plus' },
]

export function FooterAccountLinks({
  variant,
  isInitiallyAuthenticated = false,
}: {
  variant: FooterAccountLinksVariant
  isInitiallyAuthenticated?: boolean
}) {
  const { status } = useClientSession({ delayMs: 3200 })
  const isSignedIn = isInitiallyAuthenticated || status === 'authenticated'
  const links = ACCOUNT_LINKS.filter((link) => !link.signedOutOnly || (!isSignedIn && status === 'unauthenticated'))

  if (variant === 'mobile') {
    return (
      <ul className="ml-9 divide-y divide-black/8 pb-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              prefetch={link.prefetch}
              className="flex items-center gap-2.5 py-2.5 text-[15px] text-muted-foreground focus:outline-none"
            >
              <LocalIcon name={link.icon} className="h-3.5 w-3.5 text-muted-foreground" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  const listClassName = variant === 'desktop'
    ? 'mt-2 space-y-1.5'
    : 'mt-3 space-y-2 text-xs leading-5 min-[820px]:text-sm'

  const linkClassName = variant === 'desktop'
    ? 'text-sm leading-5 text-muted-foreground focus:outline-none'
    : 'focus:outline-none'

  return (
    <ul className={listClassName}>
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} prefetch={link.prefetch} className={linkClassName}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
