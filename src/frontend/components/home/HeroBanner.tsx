'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/backend/utils'

interface Banner {
  id: string
  title: string
  subtitle?: string | null
  imageUrl: string
  linkUrl?: string | null
}

export function HeroBanner({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrent(index)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [isTransitioning])

  const prev = useCallback(() => goTo((current - 1 + banners.length) % banners.length), [banners.length, current, goTo])
  const next = useCallback(() => goTo((current + 1) % banners.length), [banners.length, current, goTo])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [banners.length, next])

  if (!banners.length) {
    return (
      <section className="container-site pt-6">
        <div className="relative overflow-hidden rounded-[2.4rem] border border-black/6 bg-[linear-gradient(135deg,#2d1b3d_0%,#5f3a80_52%,#dac8b7_180%)] px-6 py-12 shadow-[0_34px_80px_rgba(27,20,18,0.14)] sm:px-10 lg:px-14 lg:py-16">
          <div className="max-w-2xl">
            <h1 className="mt-4 font-display text-[2.65rem] font-bold leading-[0.92] text-white sm:text-[4rem]">
              A warmer, calmer way to shop online in Bangladesh.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/78 sm:text-base">
              Discover electronics, fashion, home essentials, and trusted brands in a storefront built to help you buy with confidence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/search" className="inline-flex items-center rounded-full bg-[hsl(var(--buttermilk))] px-6 py-3 text-sm font-semibold text-[#2d1b3d] transition-all hover:-translate-y-px hover:bg-white">
                Start shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const banner = banners[current]

  return (
    <section className="container-site pt-6">
      <div className="group relative overflow-hidden rounded-[2.4rem] border border-black/6 bg-foreground shadow-[0_34px_80px_rgba(27,20,18,0.14)]">
        <div className="relative aspect-[19/15] w-full sm:aspect-[21/12] lg:aspect-[21/8]">
          <Image
            key={banner.id}
            src={banner.imageUrl}
            alt={banner.title}
            fill
            priority
            quality={92}
            className={cn(
              'object-cover transition-all duration-700',
              isTransitioning ? 'scale-[1.06] opacity-0' : 'scale-100 opacity-100'
            )}
            sizes="100vw"
          />

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,18,15,0.78)_0%,rgba(23,18,15,0.44)_38%,rgba(23,18,15,0.06)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(243,233,214,0.14),transparent_28%)]" />

          <div
            className={cn(
              'absolute inset-0 transition-all duration-700',
              isTransitioning ? 'translate-x-5 opacity-0' : 'translate-x-0 opacity-100'
            )}
          >
            <div className="container-site flex h-full items-end py-8 sm:items-center sm:py-12 lg:py-14">
              <div className="max-w-[34rem] sm:p-2">
                <h2 className="mt-4 font-display text-[2.2rem] font-bold leading-[0.9] text-white sm:text-[3.2rem] lg:text-[4.2rem]">
                  {banner.title}
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/78 sm:text-base">
                  {banner.subtitle || 'Clear product details, dependable delivery, and a shopping experience designed to feel calm from first click to final delivery.'}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  {banner.linkUrl ? (
                    <Link
                      href={banner.linkUrl}
                      className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--buttermilk))] px-6 py-3 text-sm font-semibold text-[#2d1b3d] transition-all hover:-translate-y-px hover:bg-white"
                    >
                      Explore collection
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {banners.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                title="Previous slide"
                onClick={prev}
                className="absolute left-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/16 bg-black/20 text-white transition-all hover:bg-black/30 group-hover:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                title="Next slide"
                onClick={next}
                className="absolute right-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/16 bg-black/20 text-white transition-all hover:bg-black/30 group-hover:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    title={`Go to slide ${i + 1}`}
                    onClick={() => goTo(i)}
                    className={cn(
                      'rounded-full transition-all duration-300',
                      i === current
                        ? 'h-2 w-7 bg-[hsl(var(--buttermilk))]'
                        : 'h-2 w-2 bg-white/45 hover:bg-white/74'
                    )}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
