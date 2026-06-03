'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  ArrowRight,
  BarChart2,
  ChevronDown,
  Grid3X3,
  Heart,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MapPin,
  Menu,
  Package,
  RefreshCcw,
  Search,
  ShoppingCart,
  Sparkles,
  Truck,
  User,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '@/backend/utils'
import { BoilabinLogo } from '@/frontend/components/layout/BoilabinLogo'
import { useCartStore, useCompareStore } from '@/frontend/stores'

const NAV_CATEGORIES = [
  {
    name: 'Electronics',
    slug: 'electronics',
    sub: [
      { name: 'Mobile Phones', slug: 'mobile-phones' },
      { name: 'Laptops', slug: 'laptops' },
      { name: 'Audio', slug: 'audio' },
      { name: 'Wearables', slug: 'wearables' },
    ],
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    sub: [
      { name: "Men's Fashion", slug: 'mens-fashion' },
      { name: "Women's Fashion", slug: 'womens-fashion' },
    ],
  },
  {
    name: 'Home & Appliances',
    slug: 'home-appliances',
    sub: [{ name: 'Kitchen', slug: 'kitchen' }],
  },
  { name: 'Beauty & Health', slug: 'beauty-health', sub: [] },
  { name: 'Sports & Fitness', slug: 'sports-fitness', sub: [] },
]

const MOBILE_SHOP_LINKS = [
  { label: 'New Arrivals', href: '/new-arrivals', icon: Sparkles },
]

const MOBILE_SUPPORT_LINKS = [
  { label: 'Help Center', href: '/help', icon: LifeBuoy },
  { label: 'Contact Us', href: '/contact', icon: HelpCircle },
  { label: 'Returns', href: '/returns', icon: RefreshCcw },
  { label: 'Shipping Info', href: '/shipping', icon: Truck },
]

type Suggestion =
  { type: 'product'; name: string; slug: string; href: string }

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const { getItemCount, openCart } = useCartStore()
  const { items: compareItems } = useCompareStore()
  const searchRef = useRef<HTMLDivElement>(null)
  const cartCount = mounted ? getItemCount() : 0
  const compareCount = mounted ? compareItems.length : 0

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-search-root="true"]')) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    setShowSuggestions(false)
  }

  const renderSearch = (className?: string) => (
    <div data-search-root="true" ref={searchRef} className={cn('relative', className)}>
      <form onSubmit={handleSearch} className="flex items-center">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/42" />
          <input
            aria-label="Search products..."
            title="Search products..."
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            className="h-10 w-full rounded-full border border-black/8 bg-card pl-11 pr-5 text-sm text-foreground shadow-[0_6px_16px_rgba(23,18,15,0.03)] transition-colors placeholder:text-foreground/40 focus:border-primary/25 focus:outline-none sm:h-11"
          />
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[1.1rem] border border-black/6 bg-card shadow-[0_20px_44px_rgba(23,18,15,0.1)]">
          {suggestions.map((s) => (
            <Link
              key={`${s.type}-${s.slug}`}
              href={s.href}
              className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-secondary/70"
              onClick={() => setShowSuggestions(false)}
            >
              <Search className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{s.name}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )

  return (
    <header className="relative z-40 w-full border-b border-black/6 bg-background">
      <div className="border-b border-black/6 bg-foreground text-background">
        <div className="container-site flex min-h-9 items-center justify-between gap-4 text-[11px] tracking-[0.02em] text-background/84">
          <span className="flex items-center gap-1.5 font-medium">
            <Zap className="h-3 w-3 text-[hsl(var(--buttermilk))]" />
            Free delivery on orders over Tk 2,000
          </span>
          <div className="hidden items-center gap-5 sm:flex">
            <Link href="/help" className="transition-colors hover:text-[hsl(var(--buttermilk))]">
              Help
            </Link>
            <Link href="/about" className="transition-colors hover:text-[hsl(var(--buttermilk))]">
              About
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-black/6 bg-background">
        <div className="container-site">
          <div className="flex min-h-[3.9rem] items-center gap-3 py-2.5 sm:min-h-[4.2rem] sm:py-3 lg:gap-5">
            <Link
              href="/"
              className="group flex flex-shrink-0 items-center gap-2.5 sm:gap-3"
              aria-label="Boilabin home"
            >
              <BoilabinLogo variant="mark" size={38} priority />
              <span className="hidden font-display text-lg font-bold leading-none text-foreground min-[360px]:block sm:hidden">
                Boilabin
              </span>
              <BoilabinLogo variant="wordmark" size={24} className="hidden sm:block" priority />
            </Link>

            {renderSearch('hidden flex-1 sm:block')}

            <div className="ml-auto flex items-center justify-end gap-0.5 sm:ml-0 sm:gap-1 lg:gap-1.5">
              <Link
                href="/compare"
                className="relative hidden rounded-lg p-2 transition-colors hover:bg-secondary sm:block"
                aria-label="Compare products"
                title="Compare products"
              >
                <BarChart2 className="h-5 w-5" />
                {compareCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {compareCount > 9 ? '9+' : compareCount}
                  </span>
                ) : null}
              </Link>

              <button
                type="button"
                title="Cart"
                aria-label="Cart"
                onClick={openCart}
                className="relative rounded-lg p-2 transition-colors hover:bg-secondary"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                ) : null}
              </button>

              {session ? (
                <div className="relative group">
                  <button
                    type="button"
                    aria-label="Open account menu"
                    title="Open account menu"
                    className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-secondary sm:px-2"
                  >
                    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-1 ring-black/5">
                      {session.user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={session.user.image}
                          alt=""
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-primary">
                          {session.user.name?.[0]?.toUpperCase() ?? 'U'}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="hidden h-3 w-3 text-muted-foreground sm:block" />
                  </button>

                  <div className="invisible absolute right-0 top-full z-50 w-52 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                    <div className="overflow-hidden rounded-[1.1rem] border border-black/6 bg-card shadow-[0_20px_44px_rgba(23,18,15,0.1)]">
                      <div className="border-b border-border p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-1 ring-black/5">
                            {session.user.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={session.user.image}
                                alt=""
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-primary">
                                {session.user.name?.[0]?.toUpperCase() ?? 'U'}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{session.user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-1">
                        {session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' ? (
                          <Link href="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary">
                            <LayoutDashboard className="h-4 w-4" />
                            Admin Panel
                          </Link>
                        ) : null}
                        <Link href="/account" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-secondary">
                          <User className="h-4 w-4" />
                          My Account
                        </Link>
                        <Link href="/track-order" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-secondary">
                          <Package className="h-4 w-4" />
                          Track Order
                        </Link>
                        <Link href="/wishlist" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-secondary">
                          <Heart className="h-4 w-4" />
                          Wishlist
                        </Link>
                        <Link href="/account/orders" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-secondary">
                          <Package className="h-4 w-4" />
                          My Orders
                        </Link>
                        <Link href="/account/addresses" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-secondary">
                          <MapPin className="h-4 w-4" />
                          Addresses
                        </Link>
                        <button
                          type="button"
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive transition-colors hover:bg-secondary"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 sm:flex"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              )}

              <button
                type="button"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                title={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen)
                  setExpandedMobileCategory(null)
                }}
                className="rounded-lg p-2 transition-colors hover:bg-secondary lg:hidden"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="pb-3 sm:hidden">
            {renderSearch()}
          </div>
        </div>
      </div>

      <div className="hidden border-b border-black/6 bg-background lg:block">
        <div className="container-site">
          <nav className="flex h-12 items-center gap-1.5">
            {NAV_CATEGORIES.map((cat) => (
              <div
                key={cat.slug}
                className="relative group"
                onMouseEnter={() => (cat.sub.length > 0 ? setHoveredCategory(cat.slug) : null)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className={cn(
                    'flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                    hoveredCategory === cat.slug
                      ? 'bg-secondary text-primary'
                      : 'text-foreground/78 hover:bg-secondary hover:text-primary'
                  )}
                >
                  {cat.name}
                  {cat.sub.length > 0 ? <ChevronDown className="h-3 w-3" /> : null}
                </Link>

                {hoveredCategory === cat.slug && cat.sub.length > 0 ? (
                  <div className="absolute left-0 top-full z-50 w-48 pt-2">
                    <div className="overflow-hidden rounded-[1rem] border border-black/6 bg-card shadow-[0_16px_36px_rgba(23,18,15,0.08)]">
                      {cat.sub.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/category/${sub.slug}`}
                          className="block px-4 py-2.5 text-sm transition-colors hover:bg-secondary hover:text-primary"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}

            <Link
              href="/new-arrivals"
              className={cn(
                'ml-auto rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                pathname === '/new-arrivals'
                  ? 'bg-secondary text-primary'
                  : 'text-foreground/78 hover:bg-secondary hover:text-primary'
              )}
            >
              New Arrivals
            </Link>
          </nav>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="absolute left-0 right-0 top-full z-50 bg-transparent px-3 pb-4 pt-3 lg:hidden">
          <div
            className="absolute inset-x-0 top-0 -z-10 h-[calc(100vh-4rem)] bg-foreground/[0.14] backdrop-blur-[2px]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="mx-auto max-w-[30rem] overflow-hidden rounded-[1.35rem] border border-black/10 bg-background shadow-[0_28px_70px_rgba(23,18,15,0.22)]">
            <div className="max-h-[calc(100vh-9.25rem)] overflow-y-auto">
              <div className="border-b border-border bg-card p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <BoilabinLogo variant="mark" size={36} priority />
                    <div>
                      <p className="text-base font-semibold leading-none text-foreground">Menu</p>
                      <p className="mt-1 text-xs text-muted-foreground">Shop and support</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Close menu"
                    title="Close menu"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

              </div>

              <div className="space-y-3 p-3">
                <section className="rounded-[1.25rem] border border-border bg-card p-3">
                  {session ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-1 pb-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-1 ring-black/5">
                          {session.user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={session.user.image}
                              alt=""
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-primary">
                              {session.user.name?.[0]?.toUpperCase() ?? 'U'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{session.user.name ?? 'My Account'}</p>
                          <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN' ? (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 rounded-2xl border border-primary/15 bg-primary/8 px-3 py-3 text-sm font-semibold text-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4 shrink-0" />
                            <span className="truncate">Admin</span>
                          </Link>
                        ) : null}
                        <Link
                          href="/account"
                          className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-3 text-sm font-semibold text-foreground"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="h-4 w-4 shrink-0" />
                          <span className="truncate">Account</span>
                        </Link>
                        <Link
                          href="/account/orders"
                          className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-3 text-sm font-semibold text-foreground"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Package className="h-4 w-4 shrink-0" />
                          <span className="truncate">Orders</span>
                        </Link>
                        <Link
                          href="/wishlist"
                          className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-3 text-sm font-semibold text-foreground"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4 shrink-0" />
                          <span className="truncate">Wishlist</span>
                        </Link>
                        <Link
                          href="/compare"
                          className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-background px-3 py-3 text-sm font-semibold text-foreground"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <BarChart2 className="h-4 w-4 shrink-0" />
                            <span className="truncate">Compare</span>
                          </span>
                          {compareCount > 0 ? (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                              {compareCount > 9 ? '9+' : compareCount}
                            </span>
                          ) : null}
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          signOut({ callbackUrl: '/' })
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm font-semibold text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/auth/login"
                        className="btn-primary justify-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Sign In
                      </Link>
                      <Link
                        href="/compare"
                        className="flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BarChart2 className="h-4 w-4" />
                        Compare
                      </Link>
                    </div>
                  )}
                </section>

                <section className="overflow-hidden rounded-[1.25rem] border border-border bg-card">
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
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Grid3X3 className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-foreground">Shop categories</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">Departments and subcategories</span>
                        </span>
                      </span>
                    <ChevronDown
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
                    <div className="space-y-2 border-t border-border bg-background p-3">
                      {NAV_CATEGORIES.map((cat) => {
                        const isExpanded = expandedMobileCategory === `category-${cat.slug}`

                        return (
                          <div key={cat.slug} className="rounded-2xl border border-border bg-card">
                            <div className="flex items-center">
                              <Link
                                href={`/category/${cat.slug}`}
                                className="min-w-0 flex-1 px-3 py-3 text-sm font-semibold text-foreground"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {cat.name}
                              </Link>
                              {cat.sub.length > 0 ? (
                                <button
                                  type="button"
                                  aria-label={`Expand ${cat.name}`}
                                  title={`Expand ${cat.name}`}
                                  className="mr-1 flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary"
                                  onClick={() =>
                                    setExpandedMobileCategory(isExpanded ? 'all-categories' : `category-${cat.slug}`)
                                  }
                                >
                                  <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                                </button>
                              ) : null}
                            </div>

                            {isExpanded ? (
                              <div className="grid grid-cols-2 gap-1 border-t border-border px-2 pb-2 pt-2">
                                {cat.sub.map((sub) => (
                                  <Link
                                    key={sub.slug}
                                    href={`/category/${sub.slug}`}
                                    className="rounded-xl px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    onClick={() => setIsMobileMenuOpen(false)}
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

                <section>
                  <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Shopping
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {MOBILE_SHOP_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold',
                          'border-border bg-card text-foreground'
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="rounded-[1.25rem] border border-border bg-card p-3">
                  <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Support
                  </p>
                  <div className="divide-y divide-border">
                    {MOBILE_SUPPORT_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between gap-3 py-3 text-sm font-medium text-foreground"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <item.icon className="h-4 w-4 shrink-0 text-primary" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
