'use client'

import { formatPrice } from '@/backend/utils'
import { PAYMENT_GATEWAYS } from '@/backend/config/payment'
import type { CartItem } from '@/frontend/stores/cart'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

export function CheckoutReviewStep({
  items,
  deliveryAddress,
  paymentMethod,
  deliveryHandoff,
  shippingFee,
  submitting,
  onBack,
  onPlaceOrder,
}: {
  items: CartItem[]
  deliveryAddress: {
    fullName: string
    phone: string
    addressLine1: string
    addressLine2?: string | null
    city: string
    district: string
    division: string
    postalCode?: string | null
  }
  paymentMethod: string
  deliveryHandoff: string
  shippingFee: number
  submitting: boolean
  onBack: () => void
  onPlaceOrder: () => void
}) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const paymentName = PAYMENT_GATEWAYS.find((gateway) => gateway.id === paymentMethod)?.name ?? paymentMethod

  return (
    <div className="space-y-4">
      <section className="rounded-[1.25rem] border border-black/10 bg-card p-4 shadow-[0_18px_42px_rgba(24,24,22,0.06)] sm:p-6">
        <h2 className="text-lg font-semibold tracking-[-0.015em] sm:text-xl">Review details</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">Confirm the delivery and payment details for {itemCount} {itemCount === 1 ? 'item' : 'items'}.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1rem] bg-[#f7f7f5] p-4 sm:col-span-2">
            <div className="flex items-start gap-3">
              <LocalIcon name="map-pin" className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 text-sm">
                <p className="font-semibold">{deliveryAddress.fullName}</p>
                <p className="mt-1 leading-5 text-muted-foreground">{deliveryAddress.addressLine1}{deliveryAddress.addressLine2 ? `, ${deliveryAddress.addressLine2}` : ''}</p>
                <p className="leading-5 text-muted-foreground">{deliveryAddress.city}, {deliveryAddress.district}, {deliveryAddress.division}{deliveryAddress.postalCode ? ` ${deliveryAddress.postalCode}` : ''} · {deliveryAddress.phone}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[1rem] bg-[#f7f7f5] p-4 text-sm">
            <p className="text-xs text-muted-foreground">Payment</p>
            <p className="mt-1 font-semibold">{paymentName}</p>
          </div>
          <div className="rounded-[1rem] bg-[#f7f7f5] p-4 text-sm">
            <p className="text-xs text-muted-foreground">Standard delivery</p>
            <p className="mt-1 font-semibold">{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{deliveryHandoff}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button type="button" onClick={onBack} className="min-h-12 flex-1 rounded-[0.875rem] border border-black/15 bg-background px-4 py-2 text-sm font-semibold focus-visible:bg-secondary/70">Back</button>
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={submitting}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[0.875rem] bg-[#121212] px-4 py-2 text-sm font-semibold text-white focus-visible:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/40 border-t-background motion-reduce:animate-none" />
              Placing order…
            </>
          ) : (
            'Place order'
          )}
        </button>
      </div>
    </div>
  )
}
