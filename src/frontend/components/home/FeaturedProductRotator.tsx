'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import { ProductCardData } from '@/backend/types/product'
import { calculateDiscount, formatPrice } from '@/backend/utils'
import { cn } from '@/backend/utils'

interface FeaturedProductRotatorProps {
  products: ProductCardData[]
  intervalMs?: number
}

export function FeaturedProductRotator({ products, intervalMs = 4500 }: FeaturedProductRotatorProps) {
  const pool = products.filter((p) => p.images.length > 0)
  const [index, setIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    if (pool.length <= 1) return
    const tick = setInterval(() => {
      setTransitioning(true)
      setTimeout(() => {
        setIndex((i) => (i + 1) % pool.length)
        setTransitioning(false)
      }, 180)
    }, intervalMs)
    return () => clearInterval(tick)
  }, [pool.length, intervalMs])

  if (pool.length === 0) return null

  const product = pool[index]
  const image = product.images.find((img) => img.isPrimary)?.url ?? product.images[0]?.url
  const price = product.salePrice ?? product.basePrice
  const discount = calculateDiscount(product.basePrice, product.salePrice ?? 0)

  return (
    <div className="relative w-full max-w-[24rem]">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/40 shadow-[0_18px_34px_rgba(0,0,0,0.24)]">
        {image ? (
          <Image
            key={product.id}
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 90vw, 24rem"
            className={cn(
              'object-cover transition-opacity duration-200',
              transitioning ? 'opacity-0' : 'opacity-100',
            )}
            quality={90}
          />
        ) : null}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_42%,rgba(0,0,0,0.78)_100%)]" />

        {discount > 0 ? (
          <span className="absolute left-4 top-4 rounded-full bg-foreground px-3 py-1 text-[11px] font-bold text-white">
            {discount}% off
          </span>
        ) : null}
        <span className="absolute right-4 top-4 rounded-full bg-[hsl(var(--buttermilk))] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#231629]">
          Featured
        </span>

        <div
          className={cn(
            'absolute inset-x-0 bottom-0 p-5 transition-opacity duration-200',
            transitioning ? 'opacity-0' : 'opacity-100',
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/72">
            {product.category.name}
          </p>
          <p className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-5 text-white">
            {product.name}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[17px] font-bold text-white">{formatPrice(price)}</span>
            {product.salePrice ? (
              <span className="text-[11px] text-white/55 line-through">
                {formatPrice(product.basePrice)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
