'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/frontend/components/product/ProductCard'

interface FlashSaleItem {
  product: any
  discountValue: number
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
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0 }); return }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-1.5 font-mono font-bold text-xl text-foreground">
      {[pad(timeLeft.h), pad(timeLeft.m), pad(timeLeft.s)].map((v, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="bg-foreground text-background rounded-lg px-2.5 py-1">{v}</span>
          {i < 2 && <span className="text-foreground/60">:</span>}
        </span>
      ))}
    </div>
  )
}

export function FlashSaleSection({ flashSale }: { flashSale: FlashSale }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl">
            <Zap className="h-5 w-5" />
            <span className="font-display font-bold text-lg">Flash Sale</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Ends in</p>
            <Countdown endsAt={flashSale.endsAt} />
          </div>
        </div>
        <Link href="/deals" className="flex items-center gap-1 text-sm text-primary font-medium hover:gap-2 transition-all">
          All Deals <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="sm:hidden mb-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Ends in</p>
        <Countdown endsAt={flashSale.endsAt} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {flashSale.items.map((item) => (
          <div key={item.product.id} className="relative">
            <ProductCard product={item.product} />
            {item.maxQuantity && (
              <div className="mt-1 px-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Sold: {item.soldQuantity}</span>
                  <span>{Math.round((item.soldQuantity / item.maxQuantity) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${Math.min((item.soldQuantity / item.maxQuantity) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
