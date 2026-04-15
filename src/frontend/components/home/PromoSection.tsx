'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Truck, ShieldCheck, RefreshCcw, Headphones, Mail } from 'lucide-react'
import { ProductCardData } from '@/backend/types/product'
import { calculateDiscount, formatPrice } from '@/backend/utils'

interface PromoSectionProps {
  flashDealProducts: ProductCardData[]
  newArrivalProducts: ProductCardData[]
  flashDealEndsAt?: Date | string | null
  flashDealMaxDiscount?: number
}

type PromoCollection = {
  kind: 'flash' | 'arrival'
  href: string
  label: string
  title: string
  copy: string
  cta: string
  gradient: string
  labelClass: string
  copyClass: string
  headlineClass: string
  previewRailClass: string
  previewCardClass: string
  products: ProductCardData[]
}

export function PromoSection({
  flashDealProducts,
  newArrivalProducts,
  flashDealEndsAt,
  flashDealMaxDiscount = 0,
}: PromoSectionProps) {
  const collections: PromoCollection[] = [
    {
      kind: 'flash',
      href: '/deals',
      label: 'Limited Time',
      title: 'Flash Deals',
      copy: 'Big markdowns on top picks. Catch the highest discounts before this round closes.',
      cta: 'Shop deals',
      gradient: 'from-fuchsia-700 via-purple-800 to-slate-950',
      labelClass: 'text-white/72',
      copyClass: 'text-white/84',
      headlineClass: 'text-white [text-shadow:0_8px_24px_rgba(15,23,42,0.28)]',
      previewRailClass: 'border-white/12 bg-black/14',
      previewCardClass: 'border-white/16 bg-white/[0.96]',
      products: flashDealProducts.slice(0, 3),
    },
    {
      kind: 'arrival',
      href: '/new-arrivals',
      label: 'Just Landed',
      title: 'New Arrivals',
      copy: 'See the latest product drops here first, then explore the full arrival list.',
      cta: 'Explore all',
      gradient: 'from-slate-700 via-slate-900 to-slate-950',
      labelClass: 'text-slate-200/72',
      copyClass: 'text-slate-100/74',
      headlineClass: 'text-white [text-shadow:0_8px_24px_rgba(15,23,42,0.24)]',
      previewRailClass: 'border-white/10 bg-black/16',
      previewCardClass: 'border-white/12 bg-white/[0.97]',
      products: newArrivalProducts.slice(0, 3),
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {collections.map((collection) => (
        <Link
          key={collection.href}
          href={collection.href}
          className={`group relative min-h-[368px] overflow-hidden rounded-[30px] border border-black/6 bg-gradient-to-br p-6 shadow-[0_24px_70px_rgba(17,24,39,0.18)] sm:min-h-[392px] ${collection.gradient}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_34%)]" />
          <div className="absolute inset-y-0 left-0 w-[44%] bg-[linear-gradient(90deg,rgba(15,23,42,0.26),rgba(15,23,42,0.08),transparent)]" />
          <div className="relative grid h-full gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
            <div className="flex flex-col justify-between gap-5 rounded-[26px] border border-white/10 bg-black/12 p-5 backdrop-blur-[2px]">
              <div>
                <span className={`text-xs font-semibold uppercase tracking-widest ${collection.labelClass}`}>
                  {collection.label}
                </span>
                <h3 className={`mt-2 font-display text-2xl font-bold ${collection.headlineClass}`}>
                  {collection.title}
                </h3>
                <p className={`mt-3 max-w-sm text-sm leading-6 ${collection.copyClass}`}>{collection.copy}</p>
                {collection.kind === 'flash' ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {flashDealMaxDiscount > 0 ? (
                      <span className="inline-flex items-center rounded-full border border-white/16 bg-white/12 px-3 py-1 text-xs font-semibold text-white">
                        Up to {flashDealMaxDiscount}% off
                      </span>
                    ) : null}
                    {flashDealEndsAt ? <PromoCountdown endsAt={flashDealEndsAt} /> : null}
                  </div>
                ) : (
                  <div className="mt-4 inline-flex items-center rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold text-white/88">
                    Fresh drops every week
                  </div>
                )}
              </div>

              <span className="inline-flex w-fit rounded-lg bg-white px-4 py-2 text-xs font-bold text-foreground transition-colors group-hover:bg-white/90">
                {collection.cta}
              </span>
            </div>

            <div className={`rounded-[28px] border p-3 shadow-[0_18px_44px_rgba(15,23,42,0.12)] backdrop-blur ${collection.previewRailClass}`}>
              <div className="grid grid-cols-3 gap-3">
              {collection.products.length > 0 ? (
                collection.products.map((product) => (
                  <PromoProductPreview
                    key={product.id}
                    product={product}
                    cardClassName={collection.previewCardClass}
                    badgeClassName={collection.kind === 'flash' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-white'}
                  />
                ))
              ) : (
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`${collection.href}-${index}`}
                    className="aspect-[0.78] rounded-[22px] border border-white/14 bg-white/10 backdrop-blur"
                  />
                ))
              )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function PromoProductPreview({
  product,
  cardClassName,
  badgeClassName,
}: {
  product: ProductCardData
  cardClassName: string
  badgeClassName: string
}) {
  const primaryImage = product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url
  const price = product.salePrice ?? product.basePrice
  const discount = calculateDiscount(product.basePrice, product.salePrice ?? 0)

  return (
    <div className={`rounded-[22px] border p-2.5 shadow-[0_20px_45px_rgba(15,23,42,0.16)] backdrop-blur ${cardClassName}`}>
      <div className="relative aspect-[0.92] overflow-hidden rounded-[16px] bg-slate-100">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 28vw, 14vw"
            quality={80}
          />
        ) : null}
        {discount > 0 ? (
          <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold ${badgeClassName}`}>
            {discount}% off
          </span>
        ) : null}
      </div>

      <div className="mt-2.5">
        <p className="text-[11px] font-medium text-slate-500">
          {product.brand?.name ?? product.category.name}
        </p>
        <p className="mt-1 line-clamp-2 text-[12px] font-semibold leading-4 text-slate-900">
          {product.name}
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-1">
          <span className="text-[13px] font-bold text-slate-950">{formatPrice(price)}</span>
          {product.salePrice ? (
            <span className="text-[10px] text-slate-400 line-through">
              {formatPrice(product.basePrice)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function PromoCountdown({ endsAt }: { endsAt: Date | string }) {
  const endTime = useMemo(() => new Date(endsAt).getTime(), [endsAt])
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endTime))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(endTime))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [endTime])

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/16 bg-white/12 px-3 py-1.5 text-white">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">Ends in</span>
      <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
        {[timeLeft.h, timeLeft.m, timeLeft.s].map((value, index) => (
          <span key={`${value}-${index}`} className="flex items-center gap-1.5">
            <span className="rounded-md bg-black/22 px-2 py-1">{value}</span>
            {index < 2 ? <span className="text-white/42">:</span> : null}
          </span>
        ))}
      </div>
    </div>
  )
}

function getTimeLeft(endTime: number) {
  const diff = Math.max(0, endTime - Date.now())
  const totalSeconds = Math.floor(diff / 1000)
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')

  return { h: hours, m: minutes, s: seconds }
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
