'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Session } from 'next-auth'
import { cn } from '@/backend/utils'
import { HeaderAvatar } from '@/frontend/components/layout/HeaderAvatar'
import { BrandWordmark } from '@/frontend/components/layout/BrandWordmark'
import { AriaExpandedButton } from '@/frontend/components/ui/AriaExpandedButton'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { useCartStore } from '@/frontend/stores/cart'
import { useClientSession } from '@/frontend/hooks/useClientSession'

const HeaderSearchPanel = dynamic(
  () =>
    import('@/frontend/components/layout/HeaderSearchPanel').then(
      (mod) => mod.HeaderSearchPanel
    ),
  { loading: () => null, ssr: false }
)

const loadDesktopCategoriesMenu = () =>
  import('@/frontend/components/layout/DesktopCategoriesMenu').then(
    (mod) => mod.DesktopCategoriesMenu
  )

const DesktopCategoriesMenu = dynamic(loadDesktopCategoriesMenu, {
  loading: () => null,
  ssr: false,
})

const loadDesktopAccountMenu = () =>
  import('@/frontend/components/layout/DesktopAccountMenu').then(
    (mod) => mod.DesktopAccountMenu
  )

const DesktopAccountMenu = dynamic(loadDesktopAccountMenu, {
  loading: () => null,
  ssr: false,
})

const loadMobileNavigationDrawer = () =>
  import('@/frontend/components/layout/MobileNavigationDrawer').then(
    (mod) => mod.MobileNavigationDrawer
  )

const MobileNavigationDrawer = dynamic(loadMobileNavigationDrawer, {
  loading: () => null,
  ssr: false,
})

const loadMobileAccountDrawer = () =>
  import('@/frontend/components/layout/MobileAccountDrawer').then(
    (mod) => mod.MobileAccountDrawer
  )

const MobileAccountDrawer = dynamic(loadMobileAccountDrawer, {
  loading: () => null,
  ssr: false,
})

const DESKTOP_NAV_LINKS = [
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'About Us', href: '/about' },
  { label: 'Help', href: '/help' },
]

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false)
  const [shouldLoadMobileMenu, setShouldLoadMobileMenu] = useState(false)
  const [shouldLoadMobileAccount, setShouldLoadMobileAccount] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { data: session, status: sessionStatus } = useClientSession()
  const [lastAuthenticatedSession, setLastAuthenticatedSession] =
    useState<Session | null>(null)
  const storedCartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  )
  const openCart = useCartStore((state) => state.openCart)
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const mobileSearchButtonRef = useRef<HTMLButtonElement>(null)
  const categoriesRootRef = useRef<HTMLDivElement>(null)
  const accountRootRef = useRef<HTMLDivElement>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileAccountButtonRef = useRef<HTMLButtonElement>(null)
  const cartCount = mounted ? storedCartCount : 0
  const activeSession =
    session ?? (sessionStatus === 'loading' ? lastAuthenticatedSession : null)
  const isSessionLoading = sessionStatus === 'loading' && !activeSession

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (session) {
      setLastAuthenticatedSession(session)
      return
    }

    if (sessionStatus === 'unauthenticated') {
      setLastAuthenticatedSession(null)
      setIsAccountOpen(false)
      setIsMobileAccountOpen(false)
    }
  }, [session, sessionStatus])

  useEffect(() => {
    if (!isCategoriesOpen) return

    const closeCategoriesOnScroll = () => {
      setIsCategoriesOpen(false)
    }

    window.addEventListener('scroll', closeCategoriesOnScroll, {
      passive: true,
    })
    return () => window.removeEventListener('scroll', closeCategoriesOnScroll)
  }, [isCategoriesOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      if (
        !target.closest('[data-search-root="true"]') &&
        !target.closest('[data-search-trigger="true"]')
      ) {
        setIsSearchOpen(false)
      }

      if (
        categoriesRootRef.current &&
        !categoriesRootRef.current.contains(target) &&
        !target.closest('[data-desktop-categories-menu="true"]')
      ) {
        setIsCategoriesOpen(false)
      }

      if (accountRootRef.current && !accountRootRef.current.contains(target)) {
        setIsAccountOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      setIsCategoriesOpen(false)
      setIsAccountOpen(false)

      if (isSearchOpen) {
        setIsSearchOpen(false)
        if (window.matchMedia('(min-width: 1024px)').matches) {
          searchButtonRef.current?.focus()
        } else {
          mobileSearchButtonRef.current?.focus()
        }
      }

      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
        mobileMenuButtonRef.current?.focus()
      }

      if (isMobileAccountOpen) {
        setIsMobileAccountOpen(false)
        mobileAccountButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileAccountOpen, isMobileMenuOpen, isSearchOpen])

  useEffect(() => {
    setIsSearchOpen(false)
    setIsCategoriesOpen(false)
    setIsAccountOpen(false)
    setIsMobileMenuOpen(false)
    setIsMobileAccountOpen(false)
  }, [pathname])

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`)

  const toggleCategoriesDropdown = () => {
    setIsCategoriesOpen((open) => !open)
    setIsSearchOpen(false)
    setIsAccountOpen(false)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const closeMobileAccount = () => {
    setIsMobileAccountOpen(false)
  }

  const closeSearch = () => {
    setIsSearchOpen(false)
    closeMobileMenu()
    closeMobileAccount()
  }

  return (
    <header
      className="sticky top-0 z-[60] w-full border-b border-[rgba(15,23,42,0.08)] bg-white text-[#111827] shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:z-40"
    >
      <div className="storefront-frame">
        <div className="relative hidden h-[71px] grid-cols-[1fr_auto_1fr] items-center gap-8 lg:grid">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center justify-self-start leading-none"
            aria-label="Boilabin home"
          >
            <BrandWordmark variant="art" className="h-[35px]" />
          </Link>

          <nav
            aria-label="Primary navigation"
            className="flex items-center justify-center gap-8 text-sm font-medium tracking-[-0.01em]"
          >
            <Link
              href="/new-arrivals"
              className={cn(
                'focus-visible:outline-none',
                isActive('/new-arrivals') ? 'text-[#111827]' : 'text-[#111827]/70'
              )}
            >
              New Arrivals
            </Link>

            <div ref={categoriesRootRef} className="relative">
              <AriaExpandedButton
                type="button"
                expanded={isCategoriesOpen}
                aria-haspopup="true"
                aria-controls="desktop-categories-menu"
                onClick={toggleCategoriesDropdown}
                className={cn(
                  'flex h-[71px] items-center gap-1.5 focus-visible:outline-none',
                  isCategoriesOpen || pathname?.startsWith('/category')
                    ? 'text-[#111827]'
                    : 'text-[#111827]/70'
                )}
              >
                Categories
                <LocalIcon
                  name="chevron-down"
                  className={cn(
                    'h-3.5 w-3.5',
                    isCategoriesOpen && 'rotate-180'
                  )}
                />
              </AriaExpandedButton>

              {isCategoriesOpen ? (
                <DesktopCategoriesMenu
                  onClose={() => setIsCategoriesOpen(false)}
                />
              ) : null}
            </div>

            {DESKTOP_NAV_LINKS.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'focus-visible:outline-none',
                  isActive(item.href) ? 'text-[#111827]' : 'text-[#111827]/70'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="relative flex shrink-0 items-center justify-end gap-4 justify-self-end">
            <AriaExpandedButton
              ref={searchButtonRef}
              type="button"
              data-search-trigger="true"
              expanded={isSearchOpen}
              aria-label="Open search"
              title="Open search"
              onClick={() => {
                setIsSearchOpen((open) => !open)
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors min-[1025px]:hover:bg-secondary"
            >
              <LocalIcon name="search" className="h-5 w-5" />
            </AriaExpandedButton>

            {activeSession ? (
              <div ref={accountRootRef} className="relative">
                <AriaExpandedButton
                  type="button"
                  expanded={isAccountOpen}
                  aria-haspopup="menu"
                  aria-label="Open account menu"
                  title="Open account menu"
                  onClick={() => setIsAccountOpen((open) => !open)}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition-colors min-[1025px]:hover:bg-secondary"
                >
                  <HeaderAvatar imageUrl={activeSession.user.image} />
                </AriaExpandedButton>

                {isAccountOpen ? (
                  <DesktopAccountMenu session={activeSession} />
                ) : null}
              </div>
            ) : isSessionLoading ? (
              <button
                type="button"
                aria-label="Loading account"
                title="Loading account"
                disabled
                className="flex h-10 w-10 cursor-default items-center justify-center rounded-full text-muted-foreground"
              >
                <HeaderAvatar />
              </button>
            ) : (
              <Link
                href="/auth/login"
                aria-label="Sign in"
                title="Sign in"
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors min-[1025px]:hover:bg-secondary"
              >
                <LocalIcon name="user" className="h-5 w-5" />
              </Link>
            )}

            <button
              type="button"
              aria-label="Cart"
              title="Cart"
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors min-[1025px]:hover:bg-secondary"
            >
              <LocalIcon name="cart" className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[11px] font-bold text-background">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              ) : null}
            </button>

            {isSearchOpen ? (
              <div className="absolute right-0 top-full z-50 mt-4 w-[22rem] max-w-[calc(100vw-2rem)]">
                <HeaderSearchPanel onClose={closeSearch} />
              </div>
            ) : null}
          </div>
        </div>

        <div
          data-testid="mobile-header"
          className="grid h-16 grid-cols-[4.5rem_minmax(0,1fr)_4.5rem] items-center min-[390px]:grid-cols-[5.75rem_minmax(8.35rem,1fr)_5.75rem] lg:hidden"
        >
          <div className="flex items-center justify-self-start">
            <AriaExpandedButton
              ref={mobileMenuButtonRef}
              type="button"
              data-testid="mobile-menu-button"
              expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              title={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => {
                setShouldLoadMobileMenu(true)
                setIsMobileMenuOpen((open) => !open)
                setIsMobileAccountOpen(false)
                setIsSearchOpen(false)
              }}
              onPointerDown={() => {
                setShouldLoadMobileMenu(true)
                void loadMobileNavigationDrawer()
              }}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full min-[390px]:h-10 min-[390px]:w-10',
                isMobileMenuOpen && 'bg-card'
              )}
            >
              {isMobileMenuOpen ? (
                <LocalIcon name="close" className="h-5 w-5" />
              ) : (
                <LocalIcon name="menu" className="h-5 w-5" />
              )}
            </AriaExpandedButton>

            <AriaExpandedButton
              ref={mobileSearchButtonRef}
              type="button"
              data-search-trigger="true"
              data-testid="mobile-search-button"
              expanded={isSearchOpen}
              aria-label="Search products"
              title="Search products"
              onClick={() => {
                setIsMobileMenuOpen(false)
                setIsMobileAccountOpen(false)
                setIsSearchOpen((open) => !open)
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full min-[390px]:h-10 min-[390px]:w-10"
            >
              <LocalIcon name="search" className="h-5 w-5" />
            </AriaExpandedButton>
          </div>

          <Link
            href="/"
            data-testid="mobile-brand-link"
            aria-label="Boilabin home"
            className="inline-flex min-w-0 justify-self-center leading-none"
          >
            <BrandWordmark
              variant="art"
              className="h-[25px] min-[340px]:h-[30px] min-[390px]:h-[32px]"
            />
          </Link>

          <div className="flex items-center justify-end gap-0 justify-self-end">
            <button
              type="button"
              data-testid="mobile-cart-button"
              aria-label="Cart"
              title="Cart"
              onClick={() => {
                setIsMobileMenuOpen(false)
                setIsMobileAccountOpen(false)
                openCart()
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-full min-[390px]:h-10 min-[390px]:w-10"
            >
              <LocalIcon name="cart" className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[11px] font-bold text-background">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              ) : null}
            </button>

            {activeSession ? (
              <AriaExpandedButton
                ref={mobileAccountButtonRef}
                type="button"
                data-testid="mobile-profile-button"
                expanded={isMobileAccountOpen}
                aria-controls="mobile-account-drawer"
                aria-label={
                  isMobileAccountOpen
                    ? 'Close account menu'
                    : 'Open account menu'
                }
                title={
                  isMobileAccountOpen
                    ? 'Close account menu'
                    : 'Open account menu'
                }
                onClick={() => {
                  setShouldLoadMobileAccount(true)
                  setIsMobileAccountOpen((open) => !open)
                  setIsMobileMenuOpen(false)
                  setIsSearchOpen(false)
                }}
                onPointerDown={() => {
                  setShouldLoadMobileAccount(true)
                  void loadMobileAccountDrawer()
                }}
                className={cn(
                  'flex h-9 w-9 items-center justify-center overflow-hidden rounded-full min-[390px]:h-10 min-[390px]:w-10',
                  isMobileAccountOpen
                    ? 'bg-secondary text-foreground'
                    : ''
                )}
              >
                {isMobileAccountOpen ? (
                  <LocalIcon name="close" className="h-5 w-5" />
                ) : (
                  <HeaderAvatar imageUrl={activeSession.user.image} />
                )}
              </AriaExpandedButton>
            ) : isSessionLoading ? (
              <button
                type="button"
                data-testid="mobile-profile-loading-button"
                aria-label="Loading account"
                title="Loading account"
                disabled
                className="flex h-9 w-9 cursor-default items-center justify-center overflow-hidden rounded-full text-muted-foreground min-[390px]:h-10 min-[390px]:w-10"
              >
                <HeaderAvatar />
              </button>
            ) : (
              <Link
                href="/auth/login"
                data-testid="mobile-profile-link"
                aria-label="Sign in"
                title="Sign in"
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full min-[390px]:h-10 min-[390px]:w-10"
              >
                <HeaderAvatar />
              </Link>
            )}
          </div>
        </div>

        {isSearchOpen ? (
          <div className="pb-3 lg:hidden">
            <HeaderSearchPanel
              className="mx-auto max-w-[30rem]"
              onClose={closeSearch}
            />
          </div>
        ) : null}
      </div>

      {mounted
        ? createPortal(
            <>
              {shouldLoadMobileMenu ? (
                <MobileNavigationDrawer
                  isOpen={isMobileMenuOpen}
                  onClose={closeMobileMenu}
                />
              ) : null}
              {activeSession && shouldLoadMobileAccount ? (
                <MobileAccountDrawer
                  isOpen={isMobileAccountOpen}
                  session={activeSession}
                  onClose={closeMobileAccount}
                />
              ) : null}
            </>,
            document.body
          )
        : null}
    </header>
  )
}
