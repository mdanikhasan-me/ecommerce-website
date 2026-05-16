import Link from 'next/link'
import { Zap, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/frontend/components/product/ProductCard'
import { CountdownTimer } from '@/frontend/components/ui/CountdownTimer'

interface FlashSaleItem {
  product: any
  discountType: 'PERCENTAGE' | 'FIXED'
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

export function FlashSaleSection({ flashSale }: { flashSale: FlashSale }) {
  const getFlashSaleProduct = (item: FlashSaleItem) => {
    const currentPrice = item.product.salePrice ?? item.product.basePrice
    const salePrice =
      item.discountType === 'PERCENTAGE'
        ? Math.max(0, currentPrice - (currentPrice * item.discountValue) / 100)
        : Math.max(0, currentPrice - item.discountValue)

    return { ...item.product, salePrice }
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#b74b67]/14 bg-[rgba(174,40,67,0.08)] px-4 py-2 text-[#9f2344]">
            <Zap className="h-5 w-5" />
            <span className="font-display font-bold text-lg">Flash Sale</span>
          </div>
          <div className="hidden sm:block">
            <p className="section-kicker mb-1 text-[11px]">Ends in</p>
            <CountdownTimer
              endsAt={flashSale.endsAt}
              className="flex items-center gap-1.5 font-mono text-xl font-bold text-foreground"
              valueClassName="rounded-xl bg-foreground px-2.5 py-1 text-background"
              separatorClassName="text-foreground/56"
            />
          </div>
        </div>
        <Link href="/deals" className="editorial-link group w-fit">
          All deals <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="sm:hidden mb-4">
        <p className="section-kicker mb-1 text-[11px]">Ends in</p>
        <CountdownTimer
          endsAt={flashSale.endsAt}
          className="flex items-center gap-1.5 font-mono text-xl font-bold text-foreground"
          valueClassName="rounded-xl bg-foreground px-2.5 py-1 text-background"
          separatorClassName="text-foreground/56"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {flashSale.items.map((item) => (
          <div key={item.product.id} className="relative">
            <ProductCard product={getFlashSaleProduct(item)} />
            {item.maxQuantity && item.soldQuantity > 0 && (
              <div className="mt-1 px-3">
                {(() => {
                  const soldPct = Math.min((item.soldQuantity / item.maxQuantity) * 100, 100)

                  return (
                    <>
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Sold: {item.soldQuantity}</span>
                        <span>{Math.round(soldPct)}%</span>
                      </div>
                      <progress
                        className="progress-track progress-red"
                        value={soldPct}
                        max={100}
                        aria-label={`${item.product.name} flash sale sell-through`}
                      />
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
