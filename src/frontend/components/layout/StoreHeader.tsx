'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  BadgeCheck,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  User,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '@/backend/utils'
import { useCartStore } from '@/frontend/stores'

type Suggestion = {
  name: string
  slug: string
}

const NAV_CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', sub: ['Mobiles', 'Laptops', 'Audio', 'Wearables', 'Gaming'] },
  { name: 'Fashion', slug: 'fashion', sub: ['Menswear', 'Womenswear', 'Accessories'] },
  { name: 'Home', slug: 'home-appliances', sub: ['Kitchen', 'Furniture', 'Decor'] },
  { name: 'Beauty', slug: 'beauty-health', sub: ['Skincare', 'Haircare', 'Wellness'] },
  { name: 'Sports', slug: 'sports-fitness', sub: ['Shoes', 'Training', 'Outdoor'] },
]

const QUICK_LINKS = [
  { href: '/deals', label: 'Flash deals' },
  { href: '/new-arrivals', label: 'New arrivals' },
  { href: '/brands', label: 'Brands' },
]

export function StoreHeader() {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { getItemCount, openCart } = useCartStore()
  const searchRef = useRef<HTMLDivElement>(null)
  const cartCount = mounted ? getItemCount() : 0

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 4)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
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
      } catch {
        setSuggestions([])
      }
    }, 250)

    return () => clearTimeout(timeout)
  }, [searchQuery])

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    if (!searchQuery.trim()) return

    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    setShowSuggestions(false)
    setIsMobileMenuOpen(false)
  }

  const navItemClass = (active: boolean) =>
    cn(
      'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
      active
        ? 'bg-foreground text-background shadow-[0_8px_24px_rgba(17,24,39,0.12)]'
        : 'text-foreground/80 hover:bg-background hover:text-primary'
    )

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-white/10 bg-foreground text-background">
        <div className="container-site flex h-10 items-center justify-between gap-4 text-[11px] font-medium uppercase tracking-[0.18em]">
          <p className="truncate text-background/72">
            Curated tech, style, and home essentials from verified sellers across Bangladesh.
          </p>
          <div className="hidden items-center gap-5 md:flex">
            <Link href="/track-order" className="text-background/72 transition-colors hover:text-background">
              Track order
            </Link>
            <Link href="/help" className="text-background/72 transition-colors hover:text-background">
              Help center
            </Link>
            <Link
              href="/seller/register"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-background transition-colors hover:bg-white/15"
            >
              <Store className="h-3.5 w-3.5" />
              Start selling
            </Link>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'border-b border-border/70 backdrop-blur-xl transition-all',
          isScrolled ? 'bg-background/88 shadow-[0_18px_50px_rgba(34,27,21,0.08)]' : 'bg-background/68'
        )}
      >
        <div className="container-site py-4">
          <div className="flex items-center gap-3 lg:gap-5">
            <Link href="/" className="flex min-w-fit items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-[18px] bg-foreground text-background shadow-[0_18px_32px_rgba(17,24,39,0.18)]">
                <span className="font-display text-2xl font-semibold">B</span>
                <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white">
                  BD
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="font-display text-[1.55rem] leading-none text-foreground">Boilabin</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Curated marketplace
                </p>
              </div>
            </Link>

            <div ref={searchRef} className="relative flex-1">
              <form
                onSubmit={handleSearch}
                className="surface-panel flex items-center gap-3 rounded-[24px] px-4 py-3"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search products, categories, and brands"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button type="submit" className="btn-primary hidden px-4 py-2.5 sm:inline-flex">
                  Search
                </button>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="surface-panel absolute left-0 right-0 top-[calc(100%+0.6rem)] rounded-[24px] p-2">
                  {suggestions.map((suggestion) => (
                    <Link
                      key={suggestion.slug}
                      href={`/products/${suggestion.slug}`}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-foreground transition-colors hover:bg-secondary/70 hover:text-primary"
                      onClick={() => {
                        setShowSuggestions(false)
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <Search className="h-4 w-4 text-muted-foreground" />
                      {suggestion.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden items-center gap-2 xl:flex">
              <span className="pill-chip">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                Verified sellers
              </span>
              <span className="pill-chip">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Fresh edits weekly
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                href="/wishlist"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/75 text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
                aria-label="Wishlist"
              >
                <Heart className="h-4.5 w-4.5" />
              </Link>

              <button
                onClick={openCart}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/75 text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary"
                aria-label="Cart"
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {session ? (
                <div className="group relative hidden md:block">
                  <button className="group flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-primary/20">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                      {session.user.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="text-left">
                      <p className="max-w-[120px] truncate text-sm font-semibold text-foreground">
                        {session.user.name || 'Account'}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        My profile
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:rotate-180" />
                  </button>

                  <div className="surface-panel invisible absolute right-0 top-[calc(100%+0.75rem)] w-60 translate-y-2 rounded-[24px] p-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="rounded-[20px] border border-border/70 bg-secondary/45 p-4">
                      <p className="truncate text-sm font-semibold text-foreground">{session.user.name}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                    <div className="mt-2 space-y-1">
                      {(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-primary transition-colors hover:bg-secondary/70"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin panel
                        </Link>
                      )}
                      <Link
                        href="/account"
                        className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors hover:bg-secondary/70"
                      >
                        <User className="h-4 w-4" />
                        My account
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors hover:bg-secondary/70"
                      >
                        <Package className="h-4 w-4" />
                        Orders
                      </Link>
                      <Link
                        href="/account/addresses"
                        className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors hover:bg-secondary/70"
                      >
                        <MapPin className="h-4 w-4" />
                        Addresses
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/8"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/auth/login" className="btn-primary hidden px-4 py-2.5 md:inline-flex">
                  <User className="mr-2 h-4 w-4" />
                  Sign in
                </Link>
              )}

              <button
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/75 text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary lg:hidden"
                aria-label="Toggle navigation"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="mt-4 hidden lg:block">
            <div className="surface-panel flex items-center gap-1 rounded-full p-2">
              <Link href="/" className={navItemClass(pathname === '/')}>
                Home
              </Link>
              {NAV_CATEGORIES.map((category) => {
                const isActive = pathname.startsWith(`/category/${category.slug}`)
                return (
                  <div
                    key={category.slug}
                    className="relative"
                    onMouseEnter={() => setHoveredCategory(category.slug)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link href={`/category/${category.slug}`} className={navItemClass(isActive)}>
                      {category.name}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Link>

                    {hoveredCategory === category.slug && (
                      <div className="surface-panel absolute left-0 top-[calc(100%+0.7rem)] w-56 rounded-[24px] p-2">
                        {category.sub.map((subCategory) => (
                          <Link
                            key={subCategory}
                            href={`/category/${category.slug}?sub=${encodeURIComponent(subCategory)}`}
                            className="flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70 hover:text-primary"
                          >
                            {subCategory}
                            <ChevronDown className="h-3.5 w-3.5 rotate-[-90deg] text-muted-foreground" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <div className="ml-auto flex items-center gap-2">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      navItemClass(pathname === link.href),
                      link.href === '/deals' && 'bg-primary/10 text-primary hover:bg-primary/12'
                    )}
                  >
                    {link.href === '/deals' && <Zap className="h-4 w-4" />}
                    {link.label}
                  </Link>
                ))}
                <span className="pill-chip">
                  <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                  Production-minded shopping
                </span>
              </div>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-border/70 bg-background/92 lg:hidden">
            <div className="container-site py-5">
              <div className="surface-panel rounded-[28px] p-4">
                <div className="grid gap-3">
                  {QUICK_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between rounded-2xl bg-secondary/45 px-4 py-3 text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                      <ChevronDown className="h-4 w-4 rotate-[-90deg] text-muted-foreground" />
                    </Link>
                  ))}

                  {NAV_CATEGORIES.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/category/${category.slug}`}
                      className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3 text-sm font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{category.name}</span>
                      <ChevronDown className="h-4 w-4 rotate-[-90deg] text-muted-foreground" />
                    </Link>
                  ))}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="pill-chip">Cash on delivery</span>
                    <span className="pill-chip">Secure checkout</span>
                    <span className="pill-chip">3-day returns</span>
                  </div>

                  {!session && (
                    <Link
                      href="/auth/login"
                      className="btn-primary mt-2 justify-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Sign in
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
