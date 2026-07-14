'use client'

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react'
import Link from 'next/link'
import { cn } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

type BannerTextPosition = 'left' | 'center' | 'right'
type BannerTextTone = 'light' | 'dark'
type BannerOverlayStrength = 'none' | 'soft' | 'medium' | 'strong'
type BannerButtonStyle = 'light' | 'dark' | 'outline'

const HERO_ROTATION_INTERVAL_MS = 7_000

interface Banner {
  id: string
  title: string
  subtitle?: string | null
  imageUrl: string
  tabletImageUrl?: string | null
  mobileImageUrl?: string | null
  linkUrl?: string | null
  buttonLabel?: string | null
  buttonStyle?: string | null
  textPosition?: string | null
  textTone?: string | null
  overlayStrength?: string | null
  textShadow?: boolean | null
}

function BannerImage({
  desktopSrc,
  tabletSrc,
  mobileSrc,
  alt,
  className,
}: {
  desktopSrc: string
  tabletSrc?: string
  mobileSrc?: string
  alt: string
  className: string
}) {
  const imageClassName = cn('absolute inset-0 h-full w-full max-w-none', className)
  const resolvedTabletSrc = tabletSrc || desktopSrc
  const resolvedMobileSrc = mobileSrc || resolvedTabletSrc

  if (resolvedTabletSrc === desktopSrc && resolvedMobileSrc === desktopSrc) {
    return <img src={desktopSrc} alt={alt} className={imageClassName} decoding="sync" fetchPriority="high" />
  }

  return (
    <picture className="absolute inset-0 block h-full w-full">
      <source media="(max-width: 639px)" srcSet={resolvedMobileSrc} />
      <source media="(max-width: 1279px)" srcSet={resolvedTabletSrc} />
      <img src={desktopSrc} alt={alt} className={imageClassName} decoding="sync" fetchPriority="high" />
    </picture>
  )
}

function normalizeOption<T extends string>(value: string | null | undefined, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? value as T : fallback
}

function overlayStyles(strength: BannerOverlayStrength, tone: BannerTextTone, position: BannerTextPosition) {
  const alpha = { none: 0, soft: 0.24, medium: 0.46, strong: 0.68 }[strength]
  if (!alpha) return { mobile: undefined, desktop: undefined }
  const rgb = tone === 'light' ? '15,23,42' : '255,255,255'
  const direction = position === 'right' ? '270deg' : '90deg'
  return {
    mobile: { background: `linear-gradient(180deg, rgba(${rgb},0) 18%, rgba(${rgb},${alpha}) 100%)` },
    desktop: position === 'center'
      ? { background: `rgba(${rgb},${Math.max(0.12, alpha * 0.55)})` }
      : { background: `linear-gradient(${direction}, rgba(${rgb},${alpha}) 0%, rgba(${rgb},${alpha * 0.48}) 42%, rgba(${rgb},0) 100%)` },
  }
}

export function HeroBanner({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [isPageVisible, setIsPageVisible] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const bannerRootRef = useRef<HTMLDivElement | null>(null)
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const goTo = useCallback((index: number) => {
    if (banners.length <= 1 || isTransitioning) return
    const nextIndex = (index + banners.length) % banners.length

    if (prefersReducedMotion) {
      setCurrent(nextIndex)
      return
    }

    setIsTransitioning(true)
    setCurrent(nextIndex)
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false)
      transitionTimerRef.current = null
    }, 180)
  }, [banners.length, isTransitioning, prefersReducedMotion])

  const previous = useCallback(() => goTo(current - 1), [current, goTo])
  const next = useCallback(() => goTo(current + 1), [current, goTo])

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
    else previous()
  }, [banners.length, next, previous])

  useEffect(() => {
    setCurrent((previous) => banners.length ? previous % banners.length : 0)
  }, [banners.length])

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
    if (banners.length <= 1 || !bannerRootRef.current || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: '0px' },
    )

    observer.observe(bannerRootRef.current)
    return () => observer.disconnect()
  }, [banners.length])

  useEffect(() => {
    if (banners.length <= 1 || !isPageVisible || !isInView || prefersReducedMotion) return
    const timer = setInterval(next, HERO_ROTATION_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [banners.length, isInView, isPageVisible, next, prefersReducedMotion])

  useEffect(() => () => {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
  }, [])

  if (!banners.length) return null

  const banner = banners[current]
  const title = banner.title.trim()
  const subtitle = banner.subtitle?.trim() ?? ''
  const desktopImageUrl = banner.imageUrl?.trim() ?? ''
  const tabletImageUrl = banner.tabletImageUrl?.trim() ?? ''
  const mobileImageUrl = banner.mobileImageUrl?.trim() ?? ''
  const fallbackImageUrl = desktopImageUrl || tabletImageUrl || mobileImageUrl
  const desktopImageSrc = desktopImageUrl || fallbackImageUrl
  const tabletImageSrc = tabletImageUrl || desktopImageSrc
  const mobileImageSrc = mobileImageUrl || tabletImageSrc
  const linkUrl = banner.linkUrl?.replace(/^\/categories\//, '/category/')
  const buttonLabel = banner.buttonLabel?.trim() || 'Explore collection'
  const textPosition = normalizeOption(banner.textPosition, ['left', 'center', 'right'] as const, 'left')
  const textTone = normalizeOption(banner.textTone, ['light', 'dark'] as const, 'light')
  const overlayStrength = normalizeOption(banner.overlayStrength, ['none', 'soft', 'medium', 'strong'] as const, 'medium')
  const buttonStyle = normalizeOption(banner.buttonStyle, ['light', 'dark', 'outline'] as const, 'light')
  const hasTextShadow = banner.textShadow !== false
  const overlays = overlayStyles(overlayStrength, textTone, textPosition)
  const positionClass = {
    left: 'items-start text-left',
    center: 'mx-auto items-center text-center',
    right: 'ml-auto items-end text-right',
  }[textPosition]
  const toneClass = textTone === 'light' ? 'text-[hsl(var(--buttermilk))]' : 'text-[#111827]'
  const titleShadow = hasTextShadow ? (textTone === 'light' ? '[text-shadow:0_4px_18px_rgba(15,23,42,0.48)]' : '[text-shadow:0_3px_14px_rgba(255,255,255,0.5)]') : ''
  const buttonClass = buttonStyle === 'dark'
    ? 'bg-[#111827] text-white'
    : buttonStyle === 'outline'
      ? textTone === 'light' ? 'border border-white/75 bg-transparent text-white' : 'border border-[#111827]/55 bg-transparent text-[#111827]'
      : 'bg-[hsl(var(--buttermilk))] text-[#2d1b3d]'

  return (
    <section className="w-full">
      <div ref={bannerRootRef} className="relative overflow-hidden bg-foreground">
        <div
          className="relative aspect-[5/4] w-full sm:aspect-video xl:aspect-[21/9]"
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
          {fallbackImageUrl ? (
            <BannerImage
              key={banner.id}
              desktopSrc={desktopImageSrc}
              tabletSrc={tabletImageSrc}
              mobileSrc={mobileImageSrc}
              alt={title || 'Promotional banner'}
              className={cn(
                'object-cover transition-opacity duration-[180ms] motion-reduce:transition-none',
                isTransitioning ? 'opacity-0' : 'opacity-100',
              )}
            />
          ) : null}
          <div className="absolute inset-0 sm:hidden" style={overlays.mobile} />
          <div className="absolute inset-0 hidden sm:block" style={overlays.desktop} />

          <div className={cn('absolute inset-0 transition-opacity duration-[180ms] motion-reduce:transition-none', isTransitioning ? 'opacity-0' : 'opacity-100')}>
            <div className="storefront-frame flex h-full items-end py-6 sm:items-center sm:py-8 lg:py-10">
              <div className={cn('flex max-w-[50%] flex-col sm:max-w-[34rem] lg:max-w-[36rem]', positionClass, toneClass)}>
                {title ? (
                  <h2 className={cn('line-clamp-2 font-display text-[1.28rem] font-bold leading-[0.9] sm:line-clamp-none sm:text-[2.7rem] lg:text-[3.8rem]', titleShadow)}>
                    {title}
                  </h2>
                ) : null}
                {subtitle ? (
                  <p className={cn(title ? 'mt-2 sm:mt-3.5' : 'mt-0', 'line-clamp-2 max-w-xl text-sm leading-6 sm:line-clamp-none sm:text-base sm:leading-7', hasTextShadow && titleShadow)}>
                    {subtitle}
                  </p>
                ) : null}
                {linkUrl ? (
                  <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-6">
                    <Link href={linkUrl} prefetch={false} className={cn('inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold sm:px-5 sm:text-sm', buttonClass)}>
                      {buttonLabel}
                      <LocalIcon name="chevron-right" className="h-4 w-4" />
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {banners.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous banner"
                onClick={previous}
                className="absolute left-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white sm:flex"
              >
                <LocalIcon name="arrow-left" className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next banner"
                onClick={next}
                className="absolute right-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white sm:flex"
              >
                <LocalIcon name="arrow-right" className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3.5 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-5">
                {banners.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Show banner ${index + 1}`}
                    aria-current={index === current ? 'true' : undefined}
                    onClick={() => goTo(index)}
                    className={cn(
                      'rounded-full bg-white/45',
                      index === current ? 'h-1.5 w-6 bg-[hsl(var(--buttermilk))] sm:h-2 sm:w-7' : 'h-1.5 w-1.5 sm:h-2 sm:w-2',
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
