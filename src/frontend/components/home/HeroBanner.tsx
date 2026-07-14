'use client'

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react'
import { cn } from '@/backend/utils'
import { BannerCreative } from '@/frontend/components/banner/BannerCreative'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

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
  titleStyle?: string | null
  textPosition?: string | null
  textTone?: string | null
  overlayStrength?: string | null
  textShadow?: boolean | null
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
  const linkUrl = banner.linkUrl?.replace(/^\/categories\//, '/category/')

  return (
    <section className="w-full">
      <div className="relative overflow-hidden bg-foreground">
        <BannerCreative
          ref={bannerRootRef}
          key={banner.id}
          title={banner.title}
          subtitle={banner.subtitle}
          desktopImageUrl={banner.imageUrl}
          tabletImageUrl={banner.tabletImageUrl}
          mobileImageUrl={banner.mobileImageUrl}
          linkUrl={linkUrl}
          buttonLabel={banner.buttonLabel}
          buttonStyle={banner.buttonStyle}
          titleStyle={banner.titleStyle}
          textPosition={banner.textPosition}
          textTone={banner.textTone}
          imageShade={banner.overlayStrength}
          textEdge={banner.textShadow}
          mode="responsive"
          priority
          role="region"
          aria-label="Homepage banner carousel"
          aria-roledescription="carousel"
          className={cn(
            'transition-opacity [transition-duration:180ms] motion-reduce:transition-none',
            isTransitioning ? 'opacity-0' : 'opacity-100',
          )}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            touchStartX.current = null
            touchStartY.current = null
          }}
        />

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
    </section>
  )
}
