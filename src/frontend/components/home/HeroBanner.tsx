'use client'

import { useState, useEffect, useCallback } from 'react'
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

  const prev = useCallback(() => goTo((current - 1 + banners.length) % banners.length), [current, banners.length, goTo])
  const next = useCallback(() => goTo((current + 1) % banners.length), [current, banners.length, goTo])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, banners.length])

  if (!banners.length) {
    return (
      <div className="w-full aspect-[21/8] md:aspect-[21/7] bg-gradient-to-r from-brand-900 to-brand-700 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="font-display text-4xl md:text-6xl font-bold">Welcome to Boilabin</h1>
          <p className="mt-3 text-lg text-white/70">Premium Shopping Experience</p>
          <Link href="/search" className="mt-6 inline-block bg-white text-brand-700 px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors">
            Shop Now
          </Link>
        </div>
      </div>
    )
  }

  const banner = banners[current]

  return (
    <div className="relative overflow-hidden bg-foreground group">
      {/* Image */}
      <div className="relative w-full aspect-[21/9] md:aspect-[21/7]">
        <Image
          key={banner.id}
          src={banner.imageUrl}
          alt={banner.title}
          fill
          priority
          quality={92}
          className={cn(
            'object-cover transition-all duration-700',
            isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          )}
          sizes="100vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/20 to-transparent" />

        {/* Content */}
        <div className={cn(
          'absolute inset-0 flex items-center transition-all duration-700',
          isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
        )}>
          <div className="container-site">
            <div className="max-w-xl">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">
                Premium Quality
              </p>
              <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="mt-3 text-base md:text-lg text-white/75 leading-relaxed">
                  {banner.subtitle}
                </p>
              )}
              {banner.linkUrl && (
                <Link
                  href={banner.linkUrl}
                  className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:gap-3 active:scale-95"
                >
                  Shop Now
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === current ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
