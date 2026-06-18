'use client'

import Image from 'next/image'
import { formatPrice } from '@/backend/utils'
import type { CartItem } from '@/frontend/stores/cart'

export function CheckoutReviewStep({
  items,
  submitting,
  onBack,
  onPlaceOrder,
}: {
  items: CartItem[]
  submitting: boolean
  onBack: () => void
  onPlaceOrder: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 shadow-[0_10px_24px_rgba(23,18,15,0.04)] sm:rounded-2xl sm:p-5">
        <h3 className="mb-3 text-base font-semibold">Order Items ({items.length})</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                {item.variantName ? <p className="text-xs text-muted-foreground">{item.variantName}</p> : null}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                <p className="text-xs text-muted-foreground">x{item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button type="button" onClick={onBack} className="btn-outline min-h-10 flex-1 px-4 py-2 text-sm">Back</button>
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={submitting}
          className="btn-primary flex min-h-10 flex-1 items-center justify-center gap-2 px-4 py-2 text-sm"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/40 border-t-background" />
              Placing Order...
            </>
          ) : (
            'Place Order'
          )}
        </button>
      </div>
    </div>
  )
}
