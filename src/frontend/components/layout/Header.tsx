'use client'

import { useEffect, useRef, useState } from 'react'
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
  () => import('@/frontend/components/layout/HeaderSearchPanel').then((mod) => mod.HeaderSearchPanel),
  { loading: () => null, ssr: false },
)

const DesktopCategoriesMenu = dynamic(
  () => import('@/frontend/components/layout/DesktopCategoriesMenu').then((mod) => mod.DesktopCategoriesMenu),
  { loading: () => null, ssr: false },
)

const DesktopAccountMenu = dynamic(
  () => import('@/frontend/components/layout/DesktopAccountMenu').then((mod) => mod.DesktopAccountMenu),
  { loading: () => null, ssr: false },
)

const MobileNavigationDrawer = dynamic(
  () => import('@/frontend/components/layout/MobileNavigationDrawer').then((mod) => mod.MobileNavigationDrawer),
  { loading: () => null, ssr: false },
)

const MobileAccountDrawer = dynamic(
  () => import('@/frontend/components/layout/MobileAccountDrawer').then((mod) => mod.MobileAccountDrawer),
  { loading: () => null, ssr: false },
)

const DESKTOP_NAV_LINKS = [
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'About Us', href: '/about' },
  { label: 'Help', href: '/help' },
]

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isCategoriesPresent, setIsCategoriesPresent] = useState(false)
  const [isCategoriesVisible, setIsCategoriesVisible] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileMenuPresent, setIsMobileMenuPresent] = useState(false)
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false)
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false)
  const [isMobileAccountPresent, setIsMobileAccountPresent] = useState(false)
  const [isMobileAccountVisible, setIsMobileAccountVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { data: session, status: sessionStatus } = useClientSession()
  const [lastAuthenticatedSession, setLastAuthenticatedSession] = useState<Session | null>(null)
  const storedCartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  )
  const openCart = useCartStore((state) => state.openCart)
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const mobileSearchButtonRef = useRef<HTMLButtonElement>(null)
  const categoriesRootRef = useRef<HTMLDivElement>(null)
  const categoriesFrameRef = useRef<number | null>(null)
  const categoriesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const accountRootRef = useRef<HTMLDivElement>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileMenuFrameRef = useRef<number | null>(null)
  const mobileMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mobileAccountButtonRef = useRef<HTMLButtonElement>(null)
  const mobileAccountFrameRef = useRef<number | null>(null)
  const mobileAccountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cartCount = mounted ? storedCartCount : 0
  const activeSession = session ?? (sessionStatus === 'loading' ? lastAuthenticatedSession : null)
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
    if (categoriesTimerRef.current !== null) {
      clearTimeout(categoriesTimerRef.current)
      categoriesTimerRef.current = null
    }

    if (isCategoriesOpen) {
      setIsCategoriesPresent(true)
      setIsCategoriesVisible(false)

      if (categoriesFrameRef.current !== null) {
        window.cancelAnimationFrame(categoriesFrameRef.current)
      }

      categoriesFrameRef.current = window.requestAnimationFrame(() => {
        setIsCategoriesVisible(true)
        categoriesFrameRef.current = null
      })
      return
    }

    if (categoriesFrameRef.current !== null) {
      window.cancelAnimationFrame(categoriesFrameRef.current)
      categoriesFrameRef.current = null
    }

    setIsCategoriesVisible(false)
    categoriesTimerRef.current = setTimeout(() => {
      setIsCategoriesPresent(false)
      categoriesTimerRef.current = null
    }, 90)
  }, [isCategoriesOpen])

  useEffect(() => {
    if (!isCategoriesOpen) return

    const closeCategoriesOnScroll = () => {
      setIsCategoriesOpen(false)
    }

    window.addEventListener('scroll', closeCategoriesOnScroll, { passive: true })
    return () => window.removeEventListener('scroll', closeCategoriesOnScroll)
  }, [isCategoriesOpen])

  useEffect(() => {
    if (mobileMenuTimerRef.current !== null) {
      clearTimeout(mobileMenuTimerRef.current)
      mobileMenuTimerRef.current = null
    }

    if (isMobileMenuOpen) {
      setIsMobileMenuPresent(true)
      setIsMobileMenuVisible(false)
      return
    }

    if (mobileMenuFrameRef.current !== null) {
      window.cancelAnimationFrame(mobileMenuFrameRef.current)
      mobileMenuFrameRef.current = null
    }

    setIsMobileMenuVisible(false)
    mobileMenuTimerRef.current = setTimeout(() => {
      setIsMobileMenuPresent(false)
      mobileMenuTimerRef.current = null
    }, 170)
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (!isMobileMenuPresent || !isMobileMenuOpen) return

    mobileMenuFrameRef.current = window.requestAnimationFrame(() => {
      mobileMenuFrameRef.current = window.requestAnimationFrame(() => {
        setIsMobileMenuVisible(true)
        mobileMenuFrameRef.current = null
      })
    })

    return () => {
      if (mobileMenuFrameRef.current !== null) {
        window.cancelAnimationFrame(mobileMenuFrameRef.current)
        mobileMenuFrameRef.current = null
      }
    }
  }, [isMobileMenuOpen, isMobileMenuPresent])

  useEffect(() => {
    if (mobileAccountTimerRef.current !== null) {
      clearTimeout(mobileAccountTimerRef.current)
      mobileAccountTimerRef.current = null
    }

    if (isMobileAccountOpen) {
      setIsMobileAccountPresent(true)
      setIsMobileAccountVisible(false)
      return
    }

    if (mobileAccountFrameRef.current !== null) {
      window.cancelAnimationFrame(mobileAccountFrameRef.current)
      mobileAccountFrameRef.current = null
    }

    setIsMobileAccountVisible(false)
    mobileAccountTimerRef.current = setTimeout(() => {
      setIsMobileAccountPresent(false)
      mobileAccountTimerRef.current = null
    }, 170)
  }, [isMobileAccountOpen])

  useEffect(() => {
    if (!isMobileAccountPresent || !isMobileAccountOpen) return

    mobileAccountFrameRef.current = window.requestAnimationFrame(() => {
      mobileAccountFrameRef.current = window.requestAnimationFrame(() => {
        setIsMobileAccountVisible(true)
        mobileAccountFrameRef.current = null
      })
    })

    return () => {
      if (mobileAccountFrameRef.current !== null) {
        window.cancelAnimationFrame(mobileAccountFrameRef.current)
        mobileAccountFrameRef.current = null
      }
    }
  }, [isMobileAccountOpen, isMobileAccountPresent])

  useEffect(() => {
    if (!isMobileMenuPresent && !isMobileAccountPresent) return

    const root = document.documentElement
    const { body } = document
    const previousRootOverflow = root.style.overflow
    const previousRootOverscrollBehavior = root.style.overscrollBehavior
    const previousBodyOverflow = body.style.overflow
    const previousBodyOverscrollBehavior = body.style.overscrollBehavior

    root.style.overflow = 'hidden'
    root.style.overscrollBehavior = 'none'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'

    return () => {
      root.style.overflow = previousRootOverflow
      root.style.overscrollBehavior = previousRootOverscrollBehavior
      body.style.overflow = previousBodyOverflow
      body.style.overscrollBehavior = previousBodyOverscrollBehavior
    }
  }, [isMobileMenuPresent, isMobileAccountPresent])

  useEffect(() => {
    return () => {
      if (categoriesFrameRef.current !== null) {
        window.cancelAnimationFrame(categoriesFrameRef.current)
      }
      if (categoriesTimerRef.current !== null) {
        clearTimeout(categoriesTimerRef.current)
      }
      if (mobileMenuFrameRef.current !== null) {
        window.cancelAnimationFrame(mobileMenuFrameRef.current)
      }
      if (mobileMenuTimerRef.current !== null) {
        clearTimeout(mobileMenuTimerRef.current)
      }
      if (mobileAccountFrameRef.current !== null) {
        window.cancelAnimationFrame(mobileAccountFrameRef.current)
      }
      if (mobileAccountTimerRef.current !== null) {
        clearTimeout(mobileAccountTimerRef.current)
      }
    }
  }, [])

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

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`)

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
    <header className="sticky top-0 z-40 w-full bg-white">
      <div className="container-site">
        <div className="relative hidden min-h-[76px] items-center justify-between gap-8 lg:flex">
          <Link href="/" className="flex shrink-0 items-center" aria-label="Boilabin home">
            <BrandWordmark variant="art" className="h-[34px] w-[150px] text-foreground" />
          </Link>

          <nav aria-label="Primary navigation" className="flex items-center justify-center gap-8 text-sm font-medium">
            <Link
              href="/new-arrivals"
              className={cn(
                'transition-colors min-[1025px]:hover:text-foreground',
                isActive('/new-arrivals') ? 'text-foreground' : 'text-foreground/72'
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
                  'flex h-[76px] items-center gap-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
                  isCategoriesOpen || pathname?.startsWith('/category')
                    ? 'text-foreground'
                    : 'text-foreground/72 min-[1025px]:hover:text-foreground'
                )}
              >
                Categories
                <LocalIcon
                  name="chevron-down"
                  className={cn('h-3.5 w-3.5 transition-transform', isCategoriesOpen && 'rotate-180')}
                />
              </AriaExpandedButton>

              {isCategoriesPresent ? (
                <DesktopCategoriesMenu
                  isVisible={isCategoriesVisible}
                  onClose={() => setIsCategoriesOpen(false)}
                />
              ) : null}
            </div>

            {DESKTOP_NAV_LINKS.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors min-[1025px]:hover:text-foreground',
                  isActive(item.href) ? 'text-foreground' : 'text-foreground/72'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="relative flex shrink-0 items-center justify-end gap-4">
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

                {isAccountOpen ? <DesktopAccountMenu session={activeSession} /> : null}
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
          className="grid h-16 grid-cols-[7.5rem_minmax(0,1fr)_7.5rem] items-center lg:hidden"
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
                setIsMobileMenuOpen((open) => !open)
                setIsMobileAccountOpen(false)
                setIsSearchOpen(false)
              }}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full transition-colors min-[1025px]:hover:bg-secondary',
                isMobileMenuOpen && 'border border-black/10 bg-card'
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
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors min-[1025px]:hover:bg-secondary"
            >
              <LocalIcon name="search" className="h-5 w-5" />
            </AriaExpandedButton>
          </div>

          <Link
            href="/"
            data-testid="mobile-brand-link"
            aria-label="Boilabin home"
            className="flex min-w-0 justify-self-center"
          >
            <BrandWordmark
              variant="art"
              className="h-[19px] w-[5.25rem] text-foreground min-[375px]:h-[22px] min-[375px]:w-24 min-[390px]:h-6 min-[390px]:w-[6.625rem]"
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
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors min-[1025px]:hover:bg-secondary"
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
                aria-label={isMobileAccountOpen ? 'Close account menu' : 'Open account menu'}
                title={isMobileAccountOpen ? 'Close account menu' : 'Open account menu'}
                onClick={() => {
                  setIsMobileAccountOpen((open) => !open)
                  setIsMobileMenuOpen(false)
                  setIsSearchOpen(false)
                }}
                className={cn(
                  'flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border transition-colors',
                  isMobileAccountOpen
                    ? 'border-foreground bg-secondary text-foreground'
                    : 'border-transparent min-[1025px]:hover:bg-secondary'
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
                className="flex h-10 w-10 cursor-default items-center justify-center overflow-hidden rounded-full text-muted-foreground"
              >
                <HeaderAvatar />
              </button>
            ) : (
              <Link
                href="/auth/login"
                data-testid="mobile-profile-link"
                aria-label="Sign in"
                title="Sign in"
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition-colors min-[1025px]:hover:bg-secondary"
              >
                <HeaderAvatar />
              </Link>
            )}
          </div>
        </div>

        {isSearchOpen ? (
          <div className="pb-3 lg:hidden">
            <HeaderSearchPanel className="mx-auto max-w-[30rem]" onClose={closeSearch} />
          </div>
        ) : null}
      </div>

      {isMobileMenuPresent ? (
        <MobileNavigationDrawer
          isOpen={isMobileMenuOpen}
          isVisible={isMobileMenuVisible}
          onClose={closeMobileMenu}
        />
      ) : null}

      {isMobileAccountPresent && activeSession ? (
        <MobileAccountDrawer
          isVisible={isMobileAccountVisible}
          session={activeSession}
          onClose={closeMobileAccount}
        />
      ) : null}
    </header>
  )
}
