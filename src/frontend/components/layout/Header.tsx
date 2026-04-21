'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  BarChart2,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Search,
  ShoppingCart,
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

type Suggestion =
  { type: 'product'; name: string; slug: string; href: string }

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
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
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        setSuggestions(data.suggestions || [])
      } catch {}
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    setShowSuggestions(false)
  }

  return (
    <header className="w-full border-b border-black/6 bg-background">
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
            <Link href="/track-order" className="transition-colors hover:text-[hsl(var(--buttermilk))]">
              Track Order
            </Link>
            <Link href="/about" className="transition-colors hover:text-[hsl(var(--buttermilk))]">
              About
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-black/6 bg-background">
        <div className="container-site">
          <div className="flex min-h-[4.2rem] items-center gap-3 py-3 lg:gap-5">
            <Link
              href="/"
              className="group flex flex-shrink-0 items-center gap-3"
              aria-label="Boilabin home"
            >
              <BoilabinLogo variant="mark" size={40} priority />
              <BoilabinLogo variant="wordmark" size={22} className="hidden sm:block" />
            </Link>

            <div ref={searchRef} className="relative flex-1">
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
                    className="h-11 w-full rounded-full border border-black/8 bg-card pl-11 pr-5 text-sm text-foreground shadow-[0_6px_16px_rgba(23,18,15,0.03)] transition-colors placeholder:text-foreground/36 focus:border-primary/25 focus:outline-none"
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

            <div className="flex items-center gap-1 lg:gap-1.5">
              <Link
                href="/compare"
                className="relative rounded-lg p-2 transition-colors hover:bg-secondary"
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

              <Link
                href="/wishlist"
                className="rounded-lg p-2 transition-colors hover:bg-secondary"
                aria-label="Wishlist"
                title="Wishlist"
              >
                <Heart className="h-5 w-5" />
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
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-xs font-semibold text-primary">
                        {session.user.name?.[0]?.toUpperCase() ?? 'U'}
                      </span>
                    </div>
                    <ChevronDown className="hidden h-3 w-3 text-muted-foreground sm:block" />
                  </button>

                  <div className="invisible absolute right-0 top-full z-50 w-52 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                    <div className="overflow-hidden rounded-[1.1rem] border border-black/6 bg-card shadow-[0_20px_44px_rgba(23,18,15,0.1)]">
                      <div className="border-b border-border p-3">
                        <p className="truncate text-sm font-semibold">{session.user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
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
                        <Link href="/account/orders" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-secondary">
                          <Package className="h-4 w-4" />
                          My Orders
                        </Link>
                        <Link href="/account/addresses" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-secondary">
                          <MapPin className="h-4 w-4" />
                          Addresses
                        </Link>
                        <Link href="/compare" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-secondary">
                          <BarChart2 className="h-4 w-4" />
                          Compare
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
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 transition-colors hover:bg-secondary lg:hidden"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
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
              href="/deals"
              className={cn(
                'ml-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors',
                pathname === '/deals'
                  ? 'bg-red-50 text-red-600'
                  : 'text-red-600 hover:bg-red-50'
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              Flash Deals
            </Link>

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
        <div className="border-b border-black/6 bg-background lg:hidden">
          <div className="container-site flex flex-col gap-2 py-4">
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="flex items-center justify-between rounded-xl border border-black/6 bg-card px-4 py-3 text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {cat.name}
                {cat.sub.length > 0 ? <ChevronDown className="h-4 w-4" /> : null}
              </Link>
            ))}
            <Link
              href="/deals"
              className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Flash Deals
            </Link>
            <Link
              href="/new-arrivals"
              className="rounded-xl border border-black/6 bg-card px-4 py-3 text-sm font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              New Arrivals
            </Link>
            <Link
              href="/compare"
              className="rounded-xl border border-black/6 bg-card px-4 py-3 text-sm font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Compare
            </Link>
            {!session ? (
              <Link href="/auth/login" className="btn-primary mt-2 justify-center" onClick={() => setIsMobileMenuOpen(false)}>
                Sign In
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
