'use client'

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react'
import { getImageProps } from 'next/image'
import Link from 'next/link'
import { cn } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

interface Banner {
  id: string
  title: string
  subtitle?: string | null
  imageUrl: string
  mobileImageUrl?: string | null
  linkUrl?: string | null
}

function BannerImage({
  desktopSrc,
  mobileSrc,
  alt,
  className,
}: {
  desktopSrc: string
  mobileSrc?: string
  alt: string
  className: string
}) {
  const common = { alt, fill: true, quality: 90 as const, priority: true, sizes: '100vw' }
  const { props: desktopProps } = getImageProps({ ...common, src: desktopSrc })

  if (!mobileSrc || mobileSrc === desktopSrc) {
    return <img {...desktopProps} alt={alt} className={className} />
  }

  const { props: mobileProps } = getImageProps({ ...common, src: mobileSrc })

  return (
    <picture>
      <source media="(max-width: 639px)" srcSet={mobileProps.srcSet} sizes="100vw" />
      <img {...desktopProps} alt={alt} className={className} />
    </picture>
  )
}

export function HeroBanner({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isInView, setIsInView] = useState(true)
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const bannerRootRef = useRef<HTMLDivElement | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const heroTitleClass =
    'font-display font-bold leading-[0.9] text-[hsl(var(--buttermilk))] [text-shadow:0_6px_24px_rgba(16,12,10,0.42)]'
  const heroSubtitleClass =
    'max-w-xl text-sm leading-6 text-[hsl(var(--buttermilk))] [text-shadow:0_3px_18px_rgba(16,12,10,0.48)] sm:text-base sm:leading-7'

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return
    if (prefersReducedMotion) {
      setCurrent(index)
      return
    }
    setIsTransitioning(true)
    setCurrent(index)
    setTimeout(() => setIsTransitioning(false), 240)
  }, [isTransitioning, prefersReducedMotion])

  const prev = useCallback(() => goTo((current - 1 + banners.length) % banners.length), [banners.length, current, goTo])
  const next = useCallback(() => goTo((current + 1) % banners.length), [banners.length, current, goTo])

  const handleTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    if (banners.length <= 1) return
    const touch = event.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
  }, [banners.length])

  const handleTouchEnd = useCallback((event: TouchEvent<HTMLDivElement>) => {
    if (banners.length <= 1 || touchStartX.current === null || touchStartY.current === null) return
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return
    if (deltaX < 0) next()
    else prev()
  }, [banners.length, next, prev])

  useEffect(() => {
    if (banners.length <= 1) return
    const updateVisibility = () => setIsPageVisible(document.visibilityState === 'visible')
    updateVisibility()
    document.addEventListener('visibilitychange', updateVisibility)
    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [banners.length])

  useEffect(() => {
    if (banners.length <= 1) return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches)
    updateMotionPreference()
    mediaQuery.addEventListener('change', updateMotionPreference)
    return () => mediaQuery.removeEventListener('change', updateMotionPreference)
  }, [banners.length])

  useEffect(() => {
    if (banners.length <= 1) return
    if (!bannerRootRef.current || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: '160px 0px' },
    )

    observer.observe(bannerRootRef.current)
    return () => observer.disconnect()
  }, [banners.length])

  useEffect(() => {
    if (banners.length <= 1 || !isPageVisible || !isInView || prefersReducedMotion) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [banners.length, isInView, isPageVisible, next, prefersReducedMotion])

  if (!banners.length) {
    return null
  }

  const banner = banners[current]
  const title = banner.title.trim()
  const subtitle = banner.subtitle?.trim() ?? ''
  const desktopImageUrl = banner.imageUrl?.trim() ?? ''
  const mobileImageUrl = banner.mobileImageUrl?.trim() ?? ''
  const hasSeparateMobileImage = Boolean(mobileImageUrl && mobileImageUrl !== desktopImageUrl)
  const fallbackImageUrl = desktopImageUrl || mobileImageUrl
  const hasDesktopImage = Boolean(desktopImageUrl)
  const hasFallbackImage = Boolean(fallbackImageUrl)

  return (
    <section className="w-full">
      <div ref={bannerRootRef} className="group relative overflow-hidden bg-foreground">
        <div
          className="relative aspect-[3/2] w-full sm:aspect-[19/9] lg:aspect-[24/8]"
          role="region"
          aria-label="Homepage banner carousel"
          aria-roledescription="carousel"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            touchStartX.current = null
            touchStartY.current = null
          }}
        >
          {hasFallbackImage ? (
            <BannerImage
              key={banner.id}
              desktopSrc={fallbackImageUrl}
              mobileSrc={hasSeparateMobileImage ? mobileImageUrl : undefined}
              alt={title || 'Promotional banner'}
              className={cn(
                'object-cover transition-opacity duration-200 motion-reduce:transition-none',
                isTransitioning ? 'opacity-0' : 'opacity-100'
              )}
            />
          ) : null}

          {/* Mobile: bottom scrim so the product reads on top and text sits in a contained band below. */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,18,15,0.16)_0%,rgba(23,18,15,0)_34%,rgba(23,18,15,0.58)_72%,rgba(23,18,15,0.9)_100%)] sm:hidden" />
          {/* Desktop: side scrim for left-aligned headline space. */}
          <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(23,18,15,0.7)_0%,rgba(23,18,15,0.36)_40%,rgba(23,18,15,0.04)_100%)] sm:block" />
          <div
            className={cn(
              'absolute inset-0 transition-opacity duration-200 motion-reduce:transition-none',
              isTransitioning ? 'opacity-0' : 'opacity-100'
            )}
          >
            <div className="container-site flex h-full items-end py-4 sm:items-center sm:py-8 lg:py-10">
              <div className="max-w-[19rem] sm:max-w-[32rem] sm:p-2">
                {title ? (
                  <h2 className={cn('line-clamp-2 text-[1.28rem] sm:line-clamp-none sm:text-[2.7rem] lg:text-[3.8rem]', heroTitleClass)}>
                    {title}
                  </h2>
                ) : null}
                {subtitle ? (
                  <p className={cn(title ? 'mt-2 sm:mt-3.5' : 'mt-0', 'line-clamp-2 sm:line-clamp-none', heroSubtitleClass)}>
                    {subtitle}
                  </p>
                ) : null}
                <div className="mt-3.5 flex flex-wrap items-center gap-3 sm:mt-6">
                  {banner.linkUrl ? (
                    <Link
                      href={banner.linkUrl}
                      className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--buttermilk))] px-4 py-2.5 text-xs font-semibold text-[#2d1b3d] transition-colors min-[1025px]:hover:bg-white sm:px-5 sm:text-sm"
                    >
                      Explore collection
                      <LocalIcon name="chevron-right" className="h-4 w-4" />
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
                className="absolute left-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/16 bg-black/20 text-white transition-colors min-[1025px]:hover:bg-black/30 sm:flex"
              >
                <LocalIcon name="arrow-left" className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                title="Next slide"
                onClick={next}
                className="absolute right-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/16 bg-black/20 text-white transition-colors min-[1025px]:hover:bg-black/30 sm:flex"
              >
                <LocalIcon name="chevron-right" className="h-5 w-5" />
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
                      'rounded-full transition-colors duration-150',
                      i === current
                        ? 'h-1.5 w-6 bg-[hsl(var(--buttermilk))] sm:h-2 sm:w-7'
                        : 'h-1.5 w-1.5 bg-white/45 min-[1025px]:hover:bg-white/74 sm:h-2 sm:w-2'
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
