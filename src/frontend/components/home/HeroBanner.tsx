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
  mobileImageUrl?: string | null
  linkUrl?: string | null
}

export function HeroBanner({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const heroTitleClass =
    'font-display font-bold leading-[0.9] text-[hsl(var(--buttermilk))] [text-shadow:0_6px_24px_rgba(16,12,10,0.42)]'
  const heroSubtitleClass =
    'max-w-xl text-sm leading-6 text-[hsl(var(--buttermilk))] [text-shadow:0_3px_18px_rgba(16,12,10,0.48)] sm:text-base sm:leading-7'

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
      <section className="w-full">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#2d1b3d_0%,#5f3a80_52%,#dac8b7_180%)] py-10 lg:py-14">
          <div className="container-site">
            <div className="max-w-2xl">
            <h1 className={cn('mt-3 text-[2.25rem] leading-[0.92] sm:text-[3.4rem]', heroTitleClass)}>
              A warmer, calmer way to shop online in Bangladesh.
            </h1>
            <p className={cn('mt-4', heroSubtitleClass)}>
              Browse electronics, fashion, home essentials, and product details in a storefront organized for everyday shopping.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/search" className="inline-flex items-center rounded-full bg-[hsl(var(--buttermilk))] px-5 py-2.5 text-sm font-semibold text-[#2d1b3d] transition-all hover:-translate-y-px hover:bg-white">
                Start shopping
              </Link>
            </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const banner = banners[current]
  const title = banner.title.trim()
  const subtitle = banner.subtitle?.trim() ?? ''
  const desktopImageUrl = banner.imageUrl?.trim() ?? ''
  const mobileImageUrl = banner.mobileImageUrl?.trim() ?? ''
  const mobileHeroImage = mobileImageUrl || desktopImageUrl
  const hasDesktopImage = Boolean(desktopImageUrl)
  const hasMobileImage = Boolean(mobileHeroImage)

  return (
    <section className="w-full">
      <div className="group relative overflow-hidden bg-foreground">
        <div className="relative aspect-[3/2] w-full sm:aspect-[19/9] lg:aspect-[24/8]">
          {hasMobileImage ? (
            <Image
              key={`${banner.id}-mobile`}
              src={mobileHeroImage}
              alt={title || 'Promotional banner'}
              fill
              priority
              quality={90}
              className={cn(
                'object-cover transition-all duration-700 sm:hidden',
                isTransitioning ? 'scale-[1.06] opacity-0' : 'scale-100 opacity-100'
              )}
              sizes="(max-width: 639px) 100vw, 0px"
            />
          ) : null}
          {hasDesktopImage ? (
            <Image
              key={`${banner.id}-desktop`}
              src={desktopImageUrl}
              alt={title || 'Promotional banner'}
              fill
              priority
              quality={92}
              className={cn(
                'hidden object-cover transition-all duration-700 sm:block',
                isTransitioning ? 'scale-[1.06] opacity-0' : 'scale-100 opacity-100'
              )}
              sizes="(max-width: 639px) 0px, 100vw"
            />
          ) : null}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,18,15,0.7)_0%,rgba(23,18,15,0.36)_40%,rgba(23,18,15,0.04)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(243,233,214,0.14),transparent_28%)]" />

          <div
            className={cn(
              'absolute inset-0 transition-all duration-700',
              isTransitioning ? 'translate-x-5 opacity-0' : 'translate-x-0 opacity-100'
            )}
          >
            <div className="container-site flex h-full items-end py-5 sm:items-center sm:py-8 lg:py-10">
              <div className="max-w-[17rem] sm:max-w-[32rem] sm:p-2">
                {title ? (
                  <h2 className={cn('text-[1.62rem] sm:text-[2.7rem] lg:text-[3.8rem]', heroTitleClass)}>
                    {title}
                  </h2>
                ) : null}
                {subtitle ? (
                  <p className={cn(title ? 'mt-2.5 sm:mt-3.5' : 'mt-0', heroSubtitleClass)}>
                    {subtitle}
                  </p>
                ) : null}
                <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-6">
                  {banner.linkUrl ? (
                    <Link
                      href={banner.linkUrl}
                      className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--buttermilk))] px-4 py-2.5 text-xs font-semibold text-[#2d1b3d] transition-all hover:-translate-y-px hover:bg-white sm:px-5 sm:text-sm"
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
                className="absolute left-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/16 bg-black/20 text-white transition-all hover:bg-black/30 sm:group-hover:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                title="Next slide"
                onClick={next}
                className="absolute right-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/16 bg-black/20 text-white transition-all hover:bg-black/30 sm:group-hover:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-5">
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
                        ? 'h-1.5 w-6 bg-[hsl(var(--buttermilk))] sm:h-2 sm:w-7'
                        : 'h-1.5 w-1.5 bg-white/45 hover:bg-white/74 sm:h-2 sm:w-2'
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
