'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronDown,
  Package, LogOut, LayoutDashboard, MapPin, Zap
} from 'lucide-react'
import { useCartStore } from '@/frontend/stores'
import { cn } from '@/backend/utils'

const NAV_CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', sub: ['Mobile Phones', 'Laptops', 'Audio', 'Wearables', 'Gaming'] },
  { name: 'Fashion', slug: 'fashion', sub: ["Men's Fashion", "Women's Fashion", 'Accessories'] },
  { name: 'Home & Appliances', slug: 'home-appliances', sub: ['Kitchen', 'Furniture', 'Decor'] },
  { name: 'Beauty', slug: 'beauty-health', sub: ['Skincare', 'Haircare', 'Health'] },
  { name: 'Sports', slug: 'sports-fitness', sub: ['Footwear', 'Equipment', 'Clothing'] },
]

export function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ name: string; slug: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const { getItemCount, openCart } = useCartStore()
  const searchRef = useRef<HTMLDivElement>(null)
  const cartCount = mounted ? getItemCount() : 0

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
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
    if (!searchQuery.trim()) { setSuggestions([]); return }
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
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSuggestions(false)
    }
  }

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full transition-shadow duration-200',
      isScrolled ? 'shadow-sm' : ''
    )}>
      {/* ─── Top Bar ──────────────────────────────────────────── */}
      <div className="bg-foreground text-background text-xs py-1.5">
        <div className="container-site flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-primary" />
            Free delivery on orders over ৳2,000
          </span>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/help" className="hover:text-primary transition-colors">Help</Link>
            <Link href="/track-order" className="hover:text-primary transition-colors">Track Order</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
          </div>
        </div>
      </div>

      {/* ─── Main Header ──────────────────────────────────────── */}
      <div className="bg-background border-b border-border">
        <div className="container-site">
          <div className="flex h-16 items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">B</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
                Boilabin
              </span>
            </Link>

            {/* Search */}
            <div ref={searchRef} className="flex-1 relative">
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search products, brands..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true) }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-input bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                  {suggestions.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/products/${s.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-sm"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <Search className="h-3.5 w-3.5 text-muted-foreground" />
                      {s.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2 rounded-lg hover:bg-secondary transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="p-2 rounded-lg hover:bg-secondary transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Account */}
              {session ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-xs font-semibold">
                        {session.user.name?.[0]?.toUpperCase() ?? 'U'}
                      </span>
                    </div>
                    <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
                  </button>

                  <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-3 border-b border-border">
                      <p className="text-sm font-semibold truncate">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                    <div className="p-1">
                      {(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') && (
                        <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-primary font-medium">
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      )}
                      <Link href="/account" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors">
                        <User className="h-4 w-4" />
                        My Account
                      </Link>
                      <Link href="/account/orders" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors">
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>
                      <Link href="/account/addresses" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors">
                        <MapPin className="h-4 w-4" />
                        Addresses
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:block">Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors lg:hidden"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Nav Bar ──────────────────────────────────────────── */}
      <div className="bg-background border-b border-border hidden lg:block">
        <div className="container-site">
          <nav className="flex items-center gap-1 h-10">
            {NAV_CATEGORIES.map((cat) => (
              <div
                key={cat.slug}
                className="relative group"
                onMouseEnter={() => setHoveredCategory(cat.slug)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    hoveredCategory === cat.slug
                      ? 'bg-secondary text-primary'
                      : 'hover:bg-secondary hover:text-primary'
                  )}
                >
                  {cat.name}
                  <ChevronDown className="h-3 w-3" />
                </Link>

                {hoveredCategory === cat.slug && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    {cat.sub.map((sub) => (
                      <Link
                        key={sub}
                        href={`/category/${cat.slug}?sub=${encodeURIComponent(sub)}`}
                        className="block px-4 py-2.5 text-sm hover:bg-secondary hover:text-primary transition-colors"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/deals"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
            >
              <Zap className="h-3.5 w-3.5" />
              Flash Deals
            </Link>

            <Link href="/new-arrivals" className="px-3 py-2 text-sm font-medium hover:bg-secondary rounded-lg transition-colors ml-auto">
              New Arrivals
            </Link>
            <Link href="/brands" className="px-3 py-2 text-sm font-medium hover:bg-secondary rounded-lg transition-colors">
              Brands
            </Link>
          </nav>
        </div>
      </div>

      {/* ─── Mobile Menu ──────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background border-b border-border">
          <div className="container-site py-4 flex flex-col gap-2">
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="flex items-center justify-between py-2.5 text-sm font-medium border-b border-border last:border-0"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {cat.name}
                <ChevronDown className="h-4 w-4" />
              </Link>
            ))}
            <Link href="/deals" className="py-2.5 text-sm font-medium text-red-500 border-b border-border" onClick={() => setIsMobileMenuOpen(false)}>
              Flash Deals
            </Link>
            <Link href="/new-arrivals" className="py-2.5 text-sm font-medium border-b border-border" onClick={() => setIsMobileMenuOpen(false)}>
              New Arrivals
            </Link>
            <Link href="/brands" className="py-2.5 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              Brands
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
