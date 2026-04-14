'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Truck, ShieldCheck, RefreshCcw, Headphones, Mail } from 'lucide-react'

export function PromoSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link href="/deals" className="relative rounded-2xl overflow-hidden aspect-[2/1] bg-gradient-to-br from-brand-600 to-brand-800 group">
        <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
          <span className="text-brand-200 text-xs font-semibold uppercase tracking-widest mb-1">Limited Time</span>
          <h3 className="font-display text-white text-2xl font-bold">Flash Deals</h3>
          <p className="text-white/70 text-sm mt-1">Up to 30% off top brands</p>
          <span className="mt-3 inline-block bg-white text-brand-700 text-xs font-bold px-4 py-1.5 rounded-lg w-fit group-hover:bg-brand-50 transition-colors">
            Shop Now           </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 to-transparent" />
      </Link>

      <Link href="/new-arrivals" className="relative rounded-2xl overflow-hidden aspect-[2/1] bg-gradient-to-br from-slate-700 to-slate-900 group">
        <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
          <span className="text-slate-300 text-xs font-semibold uppercase tracking-widest mb-1">Just Landed</span>
          <h3 className="font-display text-white text-2xl font-bold">New Arrivals</h3>
          <p className="text-white/70 text-sm mt-1">Fresh finds every week</p>
          <span className="mt-3 inline-block bg-white text-slate-700 text-xs font-bold px-4 py-1.5 rounded-lg w-fit group-hover:bg-slate-50 transition-colors">
            Explore           </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface Brand {
  id: string; name: string; slug: string; logo?: string | null;
}

export function BrandHighlights({ brands }: { brands: Brand[] }) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="section-title">Featured Brands</h2>
        <p className="text-muted-foreground text-sm mt-1">Shop authentic products from world-class brands</p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-5">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="flex items-center justify-center p-4 bg-background rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 aspect-square"
          >
            {brand.logo ? (
              <div className="relative h-10 w-full">
                <Image src={brand.logo} alt={brand.name} fill className="object-contain" sizes="100px" />
              </div>
            ) : (
              <span className="font-display font-bold text-sm">{brand.name}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon: Truck, title: 'Fast Delivery', desc: 'Express delivery across Bangladesh' },
  { icon: ShieldCheck, title: 'Authentic Products', desc: '100% genuine, always' },
  { icon: RefreshCcw, title: 'Easy Returns', desc: 'Hassle-free 7-day returns' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here when you need us' },
]

export function NewsletterSection() {
  return (
    <section>
      {/* Trust Badges */}
      <div className="bg-secondary">
        <div className="container-site py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800">
        <div className="container-site py-14 text-center">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Mail className="h-6 w-6 text-brand-200" />
              <span className="text-brand-200 text-sm font-semibold uppercase tracking-widest">Newsletter</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
              Get Exclusive Deals First
            </h2>
            <p className="text-white/70 mt-2 text-sm">
              Subscribe to our newsletter and never miss flash sales, new arrivals, or special offers.
            </p>
            <form className="flex gap-2 mt-6" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 rounded-xl px-4 py-3 text-sm bg-white/10 text-white placeholder:text-white/50 border border-white/20 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all min-w-0"
              />
              <button
                type="submit"
                className="flex-shrink-0 bg-white text-brand-700 px-5 py-3 rounded-xl text-sm font-bold hover:bg-brand-50 transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="text-white/40 text-xs mt-3">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
