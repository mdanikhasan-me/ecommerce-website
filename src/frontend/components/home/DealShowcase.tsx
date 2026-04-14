'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock3, Zap } from 'lucide-react'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { ProductCardData } from '@/backend/types'

interface FlashSaleItem {
  product: ProductCardData
  maxQuantity?: number | null
  soldQuantity: number
}

interface FlashSale {
  id: string
  title: string
  endsAt: Date
  items: FlashSaleItem[]
}

function Countdown({ endsAt }: { endsAt: Date }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const updateCountdown = () => {
      const diff = new Date(endsAt).getTime() - Date.now()

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }

    updateCountdown()
    const intervalId = window.setInterval(updateCountdown, 1000)
    return () => window.clearInterval(intervalId)
  }, [endsAt])

  return (
    <div className="flex items-center gap-2">
      {[
        { label: 'Hrs', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Sec', value: timeLeft.seconds },
      ].map((segment) => (
        <div
          key={segment.label}
          className="min-w-[72px] rounded-[20px] border border-white/12 bg-white/10 px-3 py-3 text-center backdrop-blur"
        >
          <p className="font-mono text-2xl font-semibold text-white">{String(segment.value).padStart(2, '0')}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/54">{segment.label}</p>
        </div>
      ))}
    </div>
  )
}

export function DealShowcase({ flashSale }: { flashSale: FlashSale }) {
  return (
    <section className="container-site py-8">
      <div className="overflow-hidden rounded-[34px] bg-foreground shadow-[0_24px_70px_rgba(17,24,39,0.18)]">
        <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div className="flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                <Zap className="h-4 w-4 text-primary" />
                Flash sale live
              </div>
              <h2 className="mt-5 font-display text-4xl text-white sm:text-5xl">{flashSale.title || 'Today only deals'}</h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/68 sm:text-base">
                Short-window offers deserve a bolder frame. This section gives your best live discounts a
                stronger sense of urgency without falling into a cluttered bargain-basement look.
              </p>
            </div>

            <div className="mt-8">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/72">
                <Clock3 className="h-4 w-4 text-primary" />
                Offer ends soon
              </div>
              <Countdown endsAt={flashSale.endsAt} />
              <Link href="/deals" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-primary">
                Browse all active deals
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {flashSale.items.map((item) => (
              <div key={item.product.id} className="rounded-[28px] bg-background/96 p-3">
                <ProductCard product={item.product} />
                {item.maxQuantity && (
                  <div className="px-2 pb-2 pt-4">
                    <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>Sold {item.soldQuantity}</span>
                      <span>{Math.round((item.soldQuantity / item.maxQuantity) * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary/90">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${Math.min((item.soldQuantity / item.maxQuantity) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
