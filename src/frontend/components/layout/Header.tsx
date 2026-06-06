'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/backend/utils'
import { BoilabinLogo } from '@/frontend/components/layout/BoilabinLogo'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { useCartStore, useCompareStore } from '@/frontend/stores'
import type { StorefrontIconName } from '@/shared/storefront-icons'

type NavSubcategory = {
  name: string
  slug: string
  icon: StorefrontIconName
}

type NavCategory = {
  name: string
  slug: string
  icon: StorefrontIconName
  sub: NavSubcategory[]
}

const DEFAULT_DESKTOP_CATEGORY_SLUG = 'electronics'

const NAV_CATEGORIES = [
  {
    name: 'Electronics',
    slug: 'electronics',
    icon: 'category-electronics',
    sub: [
      { name: 'Mobile Phones', slug: 'mobile-phones', icon: 'phone' },
      { name: 'Laptops', slug: 'laptops', icon: 'laptop' },
      { name: 'Audio', slug: 'audio', icon: 'headphones' },
      { name: 'Wearables', slug: 'wearables', icon: 'watch' },
    ],
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    icon: 'category-fashion',
    sub: [
      { name: "Men's Fashion", slug: 'mens-fashion', icon: 'user' },
      { name: "Women's Fashion", slug: 'womens-fashion', icon: 'shopping-bag' },
    ],
  },
  {
    name: 'Home & Appliances',
    slug: 'home-appliances',
    icon: 'category-home-appliances',
    sub: [{ name: 'Kitchen', slug: 'kitchen', icon: 'package' }],
  },
  { name: 'Beauty & Health', slug: 'beauty-health', icon: 'category-beauty-health', sub: [] },
  { name: 'Sports & Fitness', slug: 'sports-fitness', icon: 'category-sports-fitness', sub: [] },
  { name: 'Books & Stationery', slug: 'books-stationery', icon: 'category-books-stationery', sub: [] },
  { name: 'Gaming', slug: 'gaming', icon: 'category-gaming', sub: [] },
  {
    name: 'Toys & Collectibles',
    slug: 'toys-collectibles',
    icon: 'category-toys-collectibles',
    sub: [
      { name: 'Hot Wheels', slug: 'hot-wheels', icon: 'zap' },
      { name: 'LEGO Sets', slug: 'lego-sets', icon: 'grid' },
      { name: 'Diecast Models', slug: 'diecast-models', icon: 'package' },
      { name: 'Action Figures', slug: 'action-figures', icon: 'user' },
      { name: 'Collectible Cards', slug: 'collectible-cards', icon: 'tag' },
    ],
  },
] satisfies NavCategory[]

function getCategoryHref(slug: string) {
  return `/category/${slug}`
}

function getViewAllCategoryLabel(category: Pick<NavCategory, 'name'>) {
  return `View all ${category.name.toLowerCase()}`
}

const DESKTOP_NAV_LINKS = [
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'About Us', href: '/about' },
  { label: 'Help', href: '/help' },
]

type MobileMenuLink = {
  label: string
  href: string
  icon: StorefrontIconName
}

const MOBILE_SHOP_LINKS: MobileMenuLink[] = [
  { label: 'New Arrivals', href: '/new-arrivals', icon: 'sparkles' },
  { label: 'Compare', href: '/compare', icon: 'compare' },
]

const MOBILE_SUPPORT_LINKS: MobileMenuLink[] = [
  { label: 'Help Center', href: '/help', icon: 'life-buoy' },
  { label: 'Track Order', href: '/track-order', icon: 'package' },
  { label: 'Contact Us', href: '/contact', icon: 'mail' },
  { label: 'Returns', href: '/returns', icon: 'refresh-ccw' },
  { label: 'Shipping Info', href: '/shipping', icon: 'truck' },
]

type Suggestion = {
  type: 'product'
  name: string
  slug: string
  href: string
}

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [selectedDesktopCategorySlug, setSelectedDesktopCategorySlug] = useState(DEFAULT_DESKTOP_CATEGORY_SLUG)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const { getItemCount, openCart } = useCartStore()
  const { items: compareItems } = useCompareStore()
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const mobileSearchButtonRef = useRef<HTMLButtonElement>(null)
  const categoriesRootRef = useRef<HTMLDivElement>(null)
  const accountRootRef = useRef<HTMLDivElement>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const cartCount = mounted ? getItemCount() : 0
  const compareCount = mounted ? compareItems.length : 0
  const selectedDesktopCategory =
    NAV_CATEGORIES.find((category) => category.slug === selectedDesktopCategorySlug) ??
    NAV_CATEGORIES.find((category) => category.slug === DEFAULT_DESKTOP_CATEGORY_SLUG) ??
    NAV_CATEGORIES[0]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      if (
        !target.closest('[data-search-root="true"]') &&
        !target.closest('[data-search-trigger="true"]')
      ) {
        setShowSuggestions(false)
        setIsSearchOpen(false)
      }

      if (categoriesRootRef.current && !categoriesRootRef.current.contains(target)) {
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

      setShowSuggestions(false)
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
        setExpandedMobileCategory(null)
        mobileMenuButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen, isSearchOpen])

  useEffect(() => {
    setShowSuggestions(false)
    setIsSearchOpen(false)
    setIsCategoriesOpen(false)
    setIsAccountOpen(false)
    setIsMobileMenuOpen(false)
    setExpandedMobileCategory(null)
  }, [pathname])

  useEffect(() => {
    const query = searchQuery.trim()
    if (!query) {
      setSuggestions([])
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(data.suggestions || [])
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setSuggestions([])
        }
      }
    }, 300)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [searchQuery])

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`)

  const openCategoriesDropdown = () => {
    setSelectedDesktopCategorySlug(DEFAULT_DESKTOP_CATEGORY_SLUG)
    setIsCategoriesOpen(true)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setExpandedMobileCategory(null)
  }

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const query = searchQuery.trim()
    if (!query) return

    router.push(`/search?q=${encodeURIComponent(query)}`)
    setShowSuggestions(false)
    setIsSearchOpen(false)
    closeMobileMenu()
  }

  const renderSearchPanel = (className?: string) => (
    <div data-search-root="true" className={cn('relative', className)}>
      <form onSubmit={handleSearch} className="flex items-center">
        <div className="relative w-full">
          <LocalIcon
            name="search"
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/45"
          />
          <input
            aria-label="Search products"
            title="Search products"
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            className="h-11 w-full rounded-full border border-black/10 bg-[#fff] pl-11 pr-4 text-sm text-foreground shadow-[0_12px_32px_rgba(20,18,16,0.08)] transition-colors placeholder:text-foreground/45 focus:border-foreground/35 focus:outline-none"
          />
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-black/10 bg-[#fff] shadow-[0_18px_38px_rgba(20,18,16,0.14)]">
          {suggestions.map((suggestion) => (
            <Link
              key={`${suggestion.type}-${suggestion.slug}`}
              href={suggestion.href}
              className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-secondary"
              onClick={() => {
                setShowSuggestions(false)
                setIsSearchOpen(false)
              }}
            >
              <LocalIcon name="search" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{suggestion.name}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )

  return (
    <header className="relative z-40 w-full border-b border-black/10 bg-[#fffdfa]">
      <div className="container-site">
        <div className="relative hidden min-h-[76px] items-center justify-between gap-8 lg:flex">
          <Link href="/" className="flex shrink-0 items-center" aria-label="Boilabin home">
            <BoilabinLogo variant="wordmark" size={34} priority className="h-[34px] w-auto" />
          </Link>

          <nav aria-label="Primary navigation" className="flex items-center justify-center gap-8 text-sm font-medium">
            <Link
              href="/new-arrivals"
              className={cn(
                'transition-colors hover:text-foreground',
                isActive('/new-arrivals') ? 'text-foreground' : 'text-foreground/72'
              )}
            >
              New Arrivals
            </Link>

            <div
              ref={categoriesRootRef}
              className="relative"
              onMouseEnter={openCategoriesDropdown}
              onMouseLeave={() => setIsCategoriesOpen(false)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setIsCategoriesOpen(false)
                }
              }}
            >
              <button
                type="button"
                aria-expanded={isCategoriesOpen}
                aria-haspopup="true"
                aria-controls="desktop-categories-menu"
                onClick={() => {
                  if (isCategoriesOpen) {
                    setIsCategoriesOpen(false)
                  } else {
                    openCategoriesDropdown()
                  }
                }}
                onFocus={openCategoriesDropdown}
                className={cn(
                  'flex items-center gap-1.5 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
                  pathname?.startsWith('/category') ? 'text-foreground' : 'text-foreground/72'
                )}
              >
                Categories
                <LocalIcon
                  name="chevron-down"
                  className={cn('h-3.5 w-3.5 transition-transform', isCategoriesOpen && 'rotate-180')}
                />
              </button>

              {isCategoriesOpen ? (
                <div
                  id="desktop-categories-menu"
                  data-testid="desktop-categories-menu"
                  role="region"
                  aria-label="Categories menu"
                  className="absolute left-1/2 top-full z-50 mt-5 w-[min(70rem,calc(100vw-3rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-black/10 bg-[#fffdfa] shadow-[0_28px_72px_rgba(20,18,16,0.18)]"
                >
                  <div className="grid min-h-[25rem] grid-cols-[17.5rem_minmax(0,1fr)]">
                    <nav
                      aria-label="Category departments"
                      data-testid="desktop-categories-rail"
                      className="border-r border-black/10 bg-[#fffaf5] p-5"
                    >
                      <div className="space-y-1.5">
                        {NAV_CATEGORIES.map((category) => {
                          const isSelected = category.slug === selectedDesktopCategory.slug

                          return (
                            <Link
                              key={category.slug}
                              href={getCategoryHref(category.slug)}
                              data-testid={`desktop-category-rail-${category.slug}`}
                              data-selected={isSelected ? 'true' : 'false'}
                              aria-current={isSelected ? 'true' : undefined}
                              className={cn(
                                'group flex min-h-[3.85rem] items-center gap-4 rounded-lg px-4 py-3 text-left text-[15px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                                isSelected
                                  ? 'bg-secondary/80 text-foreground shadow-[0_10px_24px_rgba(20,18,16,0.06)]'
                                  : 'text-foreground/78 hover:bg-secondary/45 hover:text-foreground'
                              )}
                              onMouseEnter={() => setSelectedDesktopCategorySlug(category.slug)}
                              onFocus={() => setSelectedDesktopCategorySlug(category.slug)}
                              onClick={() => setIsCategoriesOpen(false)}
                            >
                              <LocalIcon name={category.icon} className="h-6 w-6 shrink-0 text-foreground" />
                              <span className="min-w-0 flex-1 whitespace-nowrap">{category.name}</span>
                              <LocalIcon
                                name="chevron-right"
                                className={cn(
                                  'h-3.5 w-3.5 shrink-0 text-foreground/35 transition-transform group-hover:translate-x-0.5',
                                  isSelected && 'text-foreground/65'
                                )}
                              />
                            </Link>
                          )
                        })}
                      </div>
                    </nav>

                    <section
                      aria-labelledby={`desktop-category-panel-heading-${selectedDesktopCategory.slug}`}
                      data-testid="desktop-category-selected-panel"
                      className="bg-[#fffdfa] px-12 py-11"
                    >
                      <div className="flex items-center gap-6">
                        <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary/70 text-foreground">
                          <LocalIcon name={selectedDesktopCategory.icon} className="h-8 w-8" />
                        </span>
                        <h2
                          id={`desktop-category-panel-heading-${selectedDesktopCategory.slug}`}
                          className="font-display text-[1.45rem] font-semibold leading-tight text-foreground"
                        >
                          {selectedDesktopCategory.name}
                        </h2>
                      </div>

                      <div
                        data-testid="desktop-subcategory-tiles"
                        className="mt-14 grid grid-cols-5 gap-5"
                      >
                        {selectedDesktopCategory.sub.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={getCategoryHref(sub.slug)}
                            data-testid={`desktop-subcategory-tile-${sub.slug}`}
                            className="group flex min-h-[10rem] flex-col items-center justify-center gap-5 rounded-lg border border-black/10 bg-[#fff] px-4 py-6 text-center text-foreground transition-colors hover:border-black/20 hover:bg-secondary/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            onClick={() => setIsCategoriesOpen(false)}
                          >
                            <LocalIcon
                              name={sub.icon}
                              className="h-11 w-11 text-foreground transition-transform group-hover:scale-[1.04]"
                            />
                            <span className="text-sm font-semibold leading-5">{sub.name}</span>
                          </Link>
                        ))}
                        <Link
                          href={getCategoryHref(selectedDesktopCategory.slug)}
                          data-testid={`desktop-subcategory-tile-view-all-${selectedDesktopCategory.slug}`}
                          data-tile-kind="view-all"
                          aria-label={getViewAllCategoryLabel(selectedDesktopCategory)}
                          className="group flex min-h-[10rem] flex-col items-center justify-center gap-5 rounded-lg border border-black/10 bg-[#fff] px-4 py-6 text-center text-foreground transition-colors hover:border-black/20 hover:bg-secondary/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          onClick={() => setIsCategoriesOpen(false)}
                        >
                          <LocalIcon
                            name="grid"
                            className="h-11 w-11 text-foreground transition-transform group-hover:scale-[1.04]"
                          />
                          <span className="text-sm font-semibold leading-5">
                            {getViewAllCategoryLabel(selectedDesktopCategory)}
                          </span>
                        </Link>
                      </div>
                    </section>
                  </div>
                </div>
              ) : null}
            </div>

            {DESKTOP_NAV_LINKS.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground',
                  isActive(item.href) ? 'text-foreground' : 'text-foreground/72'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="relative flex shrink-0 items-center justify-end gap-4">
            <button
              ref={searchButtonRef}
              type="button"
              data-search-trigger="true"
              aria-expanded={isSearchOpen}
              aria-label="Open search"
              title="Open search"
              onClick={() => {
                setIsSearchOpen((open) => !open)
                setShowSuggestions(true)
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-secondary"
            >
              <LocalIcon name="search" className="h-5 w-5" />
            </button>

            {session ? (
              <div ref={accountRootRef} className="relative">
                <button
                  type="button"
                  aria-expanded={isAccountOpen}
                  aria-haspopup="menu"
                  aria-label="Open account menu"
                  title="Open account menu"
                  onClick={() => setIsAccountOpen((open) => !open)}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition-colors hover:bg-secondary"
                >
                  {session.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <LocalIcon name="user" className="h-5 w-5" />
                  )}
                </button>

                {isAccountOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-4 w-56 overflow-hidden rounded-lg border border-black/10 bg-[#fff] shadow-[0_24px_56px_rgba(20,18,16,0.16)]"
                  >
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {session.user.name ?? 'My Account'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                    <div className="p-1.5">
                      {session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' ? (
                        <Link
                          href="/admin"
                          role="menuitem"
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary"
                        >
                          <LocalIcon name="layout-dashboard" className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      ) : null}
                      <Link
                        href="/account"
                        role="menuitem"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary"
                      >
                        <LocalIcon name="user" className="h-4 w-4" />
                        My Account
                      </Link>
                      <Link
                        href="/account/orders"
                        role="menuitem"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary"
                      >
                        <LocalIcon name="package" className="h-4 w-4" />
                        My Orders
                      </Link>
                      <Link
                        href="/account/addresses"
                        role="menuitem"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary"
                      >
                        <LocalIcon name="location" className="h-4 w-4" />
                        Addresses
                      </Link>
                      <Link
                        href="/wishlist"
                        role="menuitem"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary"
                      >
                        <LocalIcon name="heart" className="h-4 w-4" />
                        Wishlist
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-secondary"
                      >
                        <LocalIcon name="log-out" className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/auth/login"
                aria-label="Sign in"
                title="Sign in"
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-secondary"
              >
                <LocalIcon name="user" className="h-5 w-5" />
              </Link>
            )}

            <button
              type="button"
              aria-label="Cart"
              title="Cart"
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-secondary"
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
                {renderSearchPanel()}
              </div>
            ) : null}
          </div>
        </div>

        <div
          data-testid="mobile-header"
          className="grid h-16 grid-cols-[7.5rem_minmax(0,1fr)_7.5rem] items-center lg:hidden"
        >
          <button
            ref={mobileMenuButtonRef}
            type="button"
            data-testid="mobile-menu-button"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            title={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => {
              setIsMobileMenuOpen((open) => !open)
              setIsSearchOpen(false)
              setShowSuggestions(false)
              setExpandedMobileCategory(null)
            }}
            className="flex h-10 w-10 items-center justify-center justify-self-start rounded-full transition-colors hover:bg-secondary"
          >
            {isMobileMenuOpen ? (
              <LocalIcon name="close" className="h-5 w-5" />
            ) : (
              <LocalIcon name="menu" className="h-5 w-5" />
            )}
          </button>

          <Link
            href="/"
            data-testid="mobile-brand-link"
            aria-label="Boilabin home"
            className="flex min-w-0 justify-self-center"
          >
            <BoilabinLogo
              variant="wordmark"
              size={24}
              priority
              className="h-auto w-[5.25rem] min-[375px]:w-24 min-[390px]:w-[6.625rem]"
            />
          </Link>

          <div className="flex items-center justify-end gap-0 justify-self-end">
            <button
              ref={mobileSearchButtonRef}
              type="button"
              data-search-trigger="true"
              data-testid="mobile-search-button"
              aria-expanded={isSearchOpen}
              aria-label="Search products"
              title="Search products"
              onClick={() => {
                setIsMobileMenuOpen(false)
                setExpandedMobileCategory(null)
                setIsSearchOpen((open) => !open)
                setShowSuggestions(true)
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-secondary"
            >
              <LocalIcon name="search" className="h-5 w-5" />
            </button>

            <button
              type="button"
              data-testid="mobile-cart-button"
              aria-label="Cart"
              title="Cart"
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-secondary"
            >
              <LocalIcon name="cart" className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[11px] font-bold text-background">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              ) : null}
            </button>

            <Link
              href={session ? '/account' : '/auth/login'}
              data-testid="mobile-profile-link"
              aria-label={session ? 'My account' : 'Sign in'}
              title={session ? 'My account' : 'Sign in'}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition-colors hover:bg-secondary"
            >
              {session?.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <LocalIcon name="user" className="h-5 w-5" />
              )}
            </Link>
          </div>
        </div>

        {isSearchOpen ? (
          <div className="pb-3 lg:hidden">
            {renderSearchPanel('mx-auto max-w-[30rem]')}
          </div>
        ) : null}
      </div>

      {isMobileMenuOpen ? (
        <div className="absolute left-0 right-0 top-full z-50 bg-transparent px-4 pb-5 pt-3 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-x-0 top-0 -z-10 h-[calc(100vh-4rem)] w-full bg-foreground/20 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="mx-auto max-w-[30rem] overflow-hidden rounded-lg border border-black/10 bg-[#fffdfa] shadow-[0_28px_70px_rgba(20,18,16,0.22)]">
            <div className="max-h-[calc(100vh-8.5rem)] overflow-y-auto p-3">
              {renderSearchPanel('mb-3')}

              <section className="rounded-lg border border-black/10 bg-[#fff] p-3">
                {session ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary">
                        {session.user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={session.user.image}
                            alt=""
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <LocalIcon name="user" className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {session.user.name ?? 'My Account'}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' ? (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/10 px-3 py-3 text-sm font-semibold text-primary"
                          onClick={closeMobileMenu}
                        >
                          <LocalIcon name="layout-dashboard" className="h-4 w-4 shrink-0" />
                          <span className="truncate">Admin</span>
                        </Link>
                      ) : null}
                      <Link
                        href="/account"
                        className="flex items-center gap-2 rounded-lg border border-border bg-[#fffdfa] px-3 py-3 text-sm font-semibold text-foreground"
                        onClick={closeMobileMenu}
                      >
                        <LocalIcon name="user" className="h-4 w-4 shrink-0" />
                        <span className="truncate">Account</span>
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-2 rounded-lg border border-border bg-[#fffdfa] px-3 py-3 text-sm font-semibold text-foreground"
                        onClick={closeMobileMenu}
                      >
                        <LocalIcon name="package" className="h-4 w-4 shrink-0" />
                        <span className="truncate">Orders</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-2 rounded-lg border border-border bg-[#fffdfa] px-3 py-3 text-sm font-semibold text-foreground"
                        onClick={closeMobileMenu}
                      >
                        <LocalIcon name="heart" className="h-4 w-4 shrink-0" />
                        <span className="truncate">Wishlist</span>
                      </Link>
                      <Link
                        href="/compare"
                        className="flex items-center justify-between gap-2 rounded-lg border border-border bg-[#fffdfa] px-3 py-3 text-sm font-semibold text-foreground"
                        onClick={closeMobileMenu}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <LocalIcon name="compare" className="h-4 w-4 shrink-0" />
                          <span className="truncate">Compare</span>
                        </span>
                        {compareCount > 0 ? (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-bold text-background">
                            {compareCount > 9 ? '9+' : compareCount}
                          </span>
                        ) : null}
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu()
                        signOut({ callbackUrl: '/' })
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm font-semibold text-destructive"
                    >
                      <LocalIcon name="log-out" className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/auth/login"
                      className="flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background"
                      onClick={closeMobileMenu}
                    >
                      <LocalIcon name="user" className="h-4 w-4" />
                      Sign In
                    </Link>
                    <Link
                      href="/compare"
                      className="flex items-center justify-center gap-2 rounded-full border border-border bg-[#fffdfa] px-4 py-2.5 text-sm font-semibold text-foreground"
                      onClick={closeMobileMenu}
                    >
                      <LocalIcon name="compare" className="h-4 w-4" />
                      Compare
                    </Link>
                  </div>
                )}
              </section>

              <section className="mt-3 overflow-hidden rounded-lg border border-black/10 bg-[#fff]">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                  onClick={() =>
                    setExpandedMobileCategory(
                      expandedMobileCategory === 'all-categories' ? null : 'all-categories'
                    )
                  }
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                      <LocalIcon name="grid" className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground">Shop categories</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">Departments and subcategories</span>
                    </span>
                  </span>
                  <LocalIcon
                    name="chevron-down"
                    className={cn(
                      'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                      (expandedMobileCategory === 'all-categories' ||
                        expandedMobileCategory?.startsWith('category-')) &&
                        'rotate-180'
                    )}
                  />
                </button>

                {expandedMobileCategory === 'all-categories' ||
                expandedMobileCategory?.startsWith('category-') ? (
                  <div className="space-y-2 border-t border-border bg-[#fffdfa] p-3">
                    {NAV_CATEGORIES.map((category) => {
                      const isExpanded = expandedMobileCategory === `category-${category.slug}`

                      return (
                        <div key={category.slug} className="rounded-lg border border-border bg-[#fff]">
                          <div className="flex items-center">
                            <Link
                              href={`/category/${category.slug}`}
                              className="min-w-0 flex-1 px-3 py-3 text-sm font-semibold text-foreground"
                              onClick={closeMobileMenu}
                            >
                              {category.name}
                            </Link>
                            {category.sub.length > 0 ? (
                              <button
                                type="button"
                                aria-label={`Expand ${category.name}`}
                                title={`Expand ${category.name}`}
                                className="mr-1 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
                                onClick={() =>
                                  setExpandedMobileCategory(isExpanded ? 'all-categories' : `category-${category.slug}`)
                                }
                              >
                                <LocalIcon
                                  name="chevron-down"
                                  className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
                                />
                              </button>
                            ) : null}
                          </div>

                          {isExpanded ? (
                            <div className="grid grid-cols-2 gap-1 border-t border-border px-2 pb-2 pt-2">
                              {category.sub.map((sub) => (
                                <Link
                                  key={sub.slug}
                                  href={`/category/${sub.slug}`}
                                  className="rounded-md px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                                  onClick={closeMobileMenu}
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </section>

              <section className="mt-3">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase text-muted-foreground">Shopping</p>
                <div className="grid grid-cols-2 gap-2">
                  {MOBILE_SHOP_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 rounded-lg border border-border bg-[#fff] px-3 py-3 text-sm font-semibold text-foreground"
                      onClick={closeMobileMenu}
                    >
                      <LocalIcon name={item.icon} className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="mt-3 rounded-lg border border-border bg-[#fff] p-3">
                <p className="mb-1 px-1 text-[11px] font-semibold uppercase text-muted-foreground">Support</p>
                <div className="divide-y divide-border">
                  {MOBILE_SUPPORT_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between gap-3 py-3 text-sm font-medium text-foreground"
                      onClick={closeMobileMenu}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <LocalIcon name={item.icon} className="h-4 w-4 shrink-0 text-foreground" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <LocalIcon name="arrow-right" className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
