'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type TouchEvent } from 'react'
import { cn } from '@/backend/utils'
import { BannerCreative } from '@/frontend/components/banner/BannerCreative'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import styles from './HeroBanner.module.css'

const HERO_AUTOMATIC_ROTATION_INTERVAL_MS = 9_000
const HERO_AUTOMATIC_ROTATION_AFTER_MANUAL_MS = 8_000
const HERO_ARROW_CONTROLS_IDLE_MS = 2_000
const HERO_MANUAL_NAVIGATION_COOLDOWN_MS = 900

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
  const [areArrowControlsVisible, setAreArrowControlsVisible] = useState(false)
  const [automaticRotationScheduleVersion, setAutomaticRotationScheduleVersion] = useState(0)
  const bannerRootRef = useRef<HTMLDivElement | null>(null)
  const automaticRotationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nextAutomaticRotationDelayMsRef = useRef(HERO_AUTOMATIC_ROTATION_INTERVAL_MS)
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const arrowControlsIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const arrowControlsVisibleRef = useRef(false)
  const isArrowControlHoveredRef = useRef(false)
  const lastPointerActivityRef = useRef(0)
  const lastManualNavigationAtRef = useRef<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const startTransition = useCallback(() => {
    if (prefersReducedMotion) {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
      transitionTimerRef.current = null
      setIsTransitioning(false)
      return
    }

    setIsTransitioning(true)
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false)
      transitionTimerRef.current = null
    }, 180)
  }, [prefersReducedMotion])

  const goTo = useCallback((index: number) => {
    if (banners.length <= 1) return
    setCurrent((index + banners.length) % banners.length)
    startTransition()
  }, [banners.length, startTransition])

  const moveBy = useCallback((offset: number) => {
    if (banners.length <= 1) return
    setCurrent((index) => (index + offset + banners.length) % banners.length)
    startTransition()
  }, [banners.length, startTransition])

  const clearAutomaticRotationTimer = useCallback(() => {
    if (automaticRotationTimerRef.current === null) return
    clearTimeout(automaticRotationTimerRef.current)
    automaticRotationTimerRef.current = null
  }, [])

  const claimManualNavigation = useCallback(() => {
    const now = performance.now()
    const lastNavigationAt = lastManualNavigationAtRef.current
    if (lastNavigationAt !== null && now - lastNavigationAt < HERO_MANUAL_NAVIGATION_COOLDOWN_MS) return false
    lastManualNavigationAtRef.current = now
    clearAutomaticRotationTimer()
    nextAutomaticRotationDelayMsRef.current = HERO_AUTOMATIC_ROTATION_AFTER_MANUAL_MS
    setAutomaticRotationScheduleVersion((version) => version + 1)
    return true
  }, [clearAutomaticRotationTimer])

  const previous = useCallback(() => {
    if (!claimManualNavigation()) return
    moveBy(-1)
  }, [claimManualNavigation, moveBy])

  const next = useCallback(() => {
    if (!claimManualNavigation()) return
    moveBy(1)
  }, [claimManualNavigation, moveBy])

  const rotateNext = useCallback(() => {
    nextAutomaticRotationDelayMsRef.current = HERO_AUTOMATIC_ROTATION_INTERVAL_MS
    moveBy(1)
  }, [moveBy])

  const selectBanner = useCallback((index: number) => {
    if (!claimManualNavigation()) return
    goTo(index)
  }, [claimManualNavigation, goTo])

  const updateArrowControlsVisibility = useCallback((visible: boolean) => {
    if (arrowControlsVisibleRef.current === visible) return
    arrowControlsVisibleRef.current = visible
    setAreArrowControlsVisible(visible)
  }, [])

  const clearArrowControlsIdleTimer = useCallback(() => {
    if (!arrowControlsIdleTimerRef.current) return
    clearTimeout(arrowControlsIdleTimerRef.current)
    arrowControlsIdleTimerRef.current = null
  }, [])

  const scheduleArrowControlsHide = useCallback(() => {
    if (arrowControlsIdleTimerRef.current) return

    const hideAfterIdle = () => {
      const remaining = HERO_ARROW_CONTROLS_IDLE_MS - (performance.now() - lastPointerActivityRef.current)
      if (remaining > 0) {
        arrowControlsIdleTimerRef.current = setTimeout(hideAfterIdle, remaining)
        return
      }

      arrowControlsIdleTimerRef.current = null
      if (isArrowControlHoveredRef.current) return
      updateArrowControlsVisibility(false)
    }

    arrowControlsIdleTimerRef.current = setTimeout(hideAfterIdle, HERO_ARROW_CONTROLS_IDLE_MS)
  }, [updateArrowControlsVisibility])

  const handlePointerActivity = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || banners.length <= 1) return
    lastPointerActivityRef.current = performance.now()
    updateArrowControlsVisibility(true)
    scheduleArrowControlsHide()
  }, [banners.length, scheduleArrowControlsHide, updateArrowControlsVisibility])

  const handlePointerLeave = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    isArrowControlHoveredRef.current = false
    clearArrowControlsIdleTimer()
    updateArrowControlsVisibility(false)
  }, [clearArrowControlsIdleTimer, updateArrowControlsVisibility])

  const handleArrowControlPointerEnter = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch') return
    isArrowControlHoveredRef.current = true
    clearArrowControlsIdleTimer()
    updateArrowControlsVisibility(true)
  }, [clearArrowControlsIdleTimer, updateArrowControlsVisibility])

  const handleArrowControlPointerLeave = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch') return
    isArrowControlHoveredRef.current = false
    lastPointerActivityRef.current = performance.now()
    scheduleArrowControlsHide()
  }, [scheduleArrowControlsHide])

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
    if (banners.length <= 1 || !bannerRootRef.current) return
    if (!('IntersectionObserver' in window)) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: '0px' },
    )

    observer.observe(bannerRootRef.current)
    return () => observer.disconnect()
  }, [banners.length])

  useEffect(() => {
    if (banners.length <= 1 || !isPageVisible || !isInView || prefersReducedMotion) return
    clearAutomaticRotationTimer()
    const timer = setTimeout(() => {
      if (automaticRotationTimerRef.current !== timer) return
      automaticRotationTimerRef.current = null
      rotateNext()
    }, nextAutomaticRotationDelayMsRef.current)
    automaticRotationTimerRef.current = timer

    return () => {
      clearTimeout(timer)
      if (automaticRotationTimerRef.current === timer) automaticRotationTimerRef.current = null
    }
  }, [automaticRotationScheduleVersion, banners.length, clearAutomaticRotationTimer, current, isInView, isPageVisible, prefersReducedMotion, rotateNext])

  useEffect(() => () => {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
    clearArrowControlsIdleTimer()
  }, [clearArrowControlsIdleTimer])

  if (!banners.length) return null

  const banner = banners[current]
  const linkUrl = banner.linkUrl?.replace(/^\/categories\//, '/category/')

  return (
    <section className="w-full">
      <div
        ref={bannerRootRef}
        data-arrow-controls-visible={areArrowControlsVisible ? 'true' : 'false'}
        className={cn(styles.root, 'relative overflow-hidden bg-foreground')}
        onPointerEnter={handlePointerActivity}
        onPointerMove={handlePointerActivity}
        onPointerLeave={handlePointerLeave}
      >
        <BannerCreative
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
                data-hero-arrow-control
                aria-label="Previous banner"
                onClick={previous}
                onPointerEnter={handleArrowControlPointerEnter}
                onPointerLeave={handleArrowControlPointerLeave}
                className={cn(styles.arrowControl, 'absolute left-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white sm:flex')}
              >
                <LocalIcon name="arrow-left" className="h-5 w-5" />
              </button>
              <button
                type="button"
                data-hero-arrow-control
                aria-label="Next banner"
                onClick={next}
                onPointerEnter={handleArrowControlPointerEnter}
                onPointerLeave={handleArrowControlPointerLeave}
                className={cn(styles.arrowControl, 'absolute right-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white sm:flex')}
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
                    onClick={() => selectBanner(index)}
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
