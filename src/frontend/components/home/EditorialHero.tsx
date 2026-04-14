'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react'
import { cn } from '@/backend/utils'

interface Banner {
  id: string
  title: string
  subtitle?: string | null
  imageUrl: string
  linkUrl?: string | null
}

const HERO_METRICS = [
  { icon: ShieldCheck, value: 'Verified', label: 'Seller network' },
  { icon: Truck, value: 'Nationwide', label: 'Delivery coverage' },
  { icon: Star, value: 'Curated', label: 'Weekly product edits' },
]

const QUICK_LINKS = [
  { href: '/deals', label: 'Flash deals' },
  { href: '/new-arrivals', label: 'New arrivals' },
  { href: '/brands', label: 'Shop brands' },
]

const FALLBACK_BANNER: Banner = {
  id: 'fallback',
  title: 'A sharper marketplace for beautiful, practical everyday shopping.',
  subtitle:
    'Discover better electronics, cleaner essentials, and lifestyle finds from trusted sellers with smoother delivery and safer checkout.',
  imageUrl:
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1400&q=80&auto=format',
  linkUrl: '/new-arrivals',
}

export function EditorialHero({ banners }: { banners: Banner[] }) {
  const slides = banners.length > 0 ? banners : [FALLBACK_BANNER]
  const [current, setCurrent] = useState(0)
  const activeBanner = slides[current]
  const previewBanner = slides[(current + 1) % slides.length]

  useEffect(() => {
    if (slides.length <= 1) return

    const timer = window.setInterval(() => {
      setCurrent((index) => (index + 1) % slides.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [slides.length])

  return (
    <section className="container-site pt-6 sm:pt-8">
      <div className="surface-panel overflow-hidden rounded-[36px]">
        <div className="absolute inset-0 subtle-grid opacity-30" />
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.04fr_0.96fr] lg:p-10 xl:p-12">
          <div className="flex flex-col justify-between">
            <div>
              <span className="eyebrow-chip">
                <Sparkles className="h-3.5 w-3.5" />
                Boilabin select
              </span>
              <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.02] text-foreground sm:text-5xl xl:text-6xl">
                {activeBanner.title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                {activeBanner.subtitle ||
                  'Discover polished shopping across electronics, style, beauty, and home essentials with a storefront designed to feel more trusted and more intentional.'}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={activeBanner.linkUrl || '/new-arrivals'} className="btn-primary">
                  Shop the edit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/brands" className="btn-outline">
                  Explore brands
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {HERO_METRICS.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[24px] border border-border/80 bg-background/72 p-4 shadow-[0_14px_35px_rgba(34,27,21,0.06)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <metric.icon className="h-4.5 w-4.5" />
                    </div>
                    <p className="mt-4 font-display text-2xl text-foreground">{metric.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {QUICK_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="pill-chip transition-transform hover:-translate-y-0.5">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative min-h-[360px] lg:min-h-[520px]">
            <div className="absolute inset-0 rounded-[32px] bg-foreground shadow-[0_28px_70px_rgba(17,24,39,0.24)]" />

            <div className="relative h-full overflow-hidden rounded-[32px] border border-white/8">
              <Image
                key={activeBanner.id}
                src={activeBanner.imageUrl}
                alt={activeBanner.title}
                fill
                priority
                className="object-cover transition-all duration-700"
                sizes="(max-width: 1024px) 100vw, 44vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/15 to-transparent" />

              <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
                <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur">
                  New season edit
                </span>
                {slides.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrent((index) => (index - 1 + slides.length) % slides.length)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/16"
                      aria-label="Previous banner"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrent((index) => (index + 1) % slides.length)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/16"
                      aria-label="Next banner"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="absolute bottom-5 left-5 right-5 grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/56">Current spotlight</p>
                  <p className="mt-2 max-w-lg font-display text-2xl text-white">{activeBanner.title}</p>
                  {activeBanner.subtitle && (
                    <p className="mt-2 text-sm leading-6 text-white/70">{activeBanner.subtitle}</p>
                  )}
                </div>

                <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur md:w-56">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/56">Up next</p>
                  <p className="mt-2 text-base font-semibold text-white">{previewBanner.title}</p>
                  <p className="mt-2 text-sm text-white/66">
                    Rotating featured campaigns and premium product edits.
                  </p>
                </div>
              </div>
            </div>

            {slides.length > 1 && (
              <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 gap-2 rounded-full border border-border/80 bg-background px-3 py-2 shadow-[0_12px_30px_rgba(34,27,21,0.08)]">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrent(index)}
                    className={cn(
                      'h-2.5 rounded-full transition-all',
                      index === current ? 'w-8 bg-primary' : 'w-2.5 bg-foreground/20 hover:bg-foreground/40'
                    )}
                    aria-label={`Show banner ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
