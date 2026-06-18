'use client'

import Image from 'next/image'
import { PAYMENT_GATEWAYS } from '@/backend/config/payment'
import { cn } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import toast from 'react-hot-toast'

const PAYMENT_LOGO_CLASSES: Record<string, string> = {
  'Cash on Delivery': 'h-4 w-auto max-w-[3.5rem]',
  bKash: 'h-7 w-auto max-w-[4rem]',
  Nagad: 'h-6 w-auto max-w-[3.8rem]',
  Visa: 'h-5 w-auto max-w-[3.2rem]',
  Mastercard: 'h-5 w-auto max-w-[1.8rem]',
}

export function CheckoutPaymentStep({
  selectedPayment,
  orderNote,
  onSelectedPaymentChange,
  onOrderNoteChange,
  onBack,
  onReview,
}: {
  selectedPayment: string
  orderNote: string
  onSelectedPaymentChange: (paymentId: string) => void
  onOrderNoteChange: (note: string) => void
  onBack: () => void
  onReview: () => void
}) {
  const selectedGateway = PAYMENT_GATEWAYS.find((gateway) => gateway.id === selectedPayment)
  const hasAvailablePaymentGateway = PAYMENT_GATEWAYS.some((gateway) => gateway.isAvailable)

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[0_10px_24px_rgba(23,18,15,0.04)] sm:rounded-2xl sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold sm:text-lg">
        <LocalIcon name="credit-card" className="h-4 w-4 text-primary sm:h-5 sm:w-5" /> Payment Method
      </h2>

      <div className="space-y-3">
        {PAYMENT_GATEWAYS.map((gateway) => (
          <label
            key={gateway.id}
            className={cn(
              'grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border-2 p-3 transition-colors sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:p-4',
              gateway.isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70',
              selectedPayment === gateway.id && gateway.isAvailable
                ? 'border-primary bg-primary/5'
                : 'border-border',
              !gateway.isAvailable && 'bg-muted/25',
            )}
          >
            <input
              aria-label={gateway.name}
              type="radio"
              name="payment"
              value={gateway.id}
              checked={selectedPayment === gateway.id}
              onChange={() => {
                if (gateway.isAvailable) onSelectedPaymentChange(gateway.id)
              }}
              disabled={!gateway.isAvailable}
              className="sr-only"
            />
            <div
              className={cn(
                'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                selectedPayment === gateway.id && gateway.isAvailable
                  ? 'border-primary'
                  : 'border-muted-foreground/60',
              )}
            >
              {selectedPayment === gateway.id && gateway.isAvailable ? (
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{gateway.name}</p>
                {gateway.badge ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                    {gateway.badge}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{gateway.description}</p>
              {!gateway.isAvailable && gateway.disabledReason ? (
                <p className="mt-1 text-[11px] font-medium text-amber-700">
                  {gateway.disabledReason}
                </p>
              ) : null}
            </div>
            <div className="col-start-2 flex items-center gap-2 sm:col-start-auto">
              {gateway.logos?.length ? (
                <div
                  className={cn(
                    'flex h-10 w-16 flex-shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border/70 bg-background/80 px-2 shadow-sm sm:w-20',
                    !gateway.isAvailable && 'grayscale',
                  )}
                >
                  {gateway.logos.map((logo) => (
                    <Image
                      key={`${gateway.id}-${logo.alt}`}
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.width}
                      height={logo.height}
                      unoptimized
                      className={cn(
                        'block object-contain',
                        PAYMENT_LOGO_CLASSES[logo.alt] ?? 'h-5 w-auto max-w-[3.5rem]',
                      )}
                    />
                  ))}
                </div>
              ) : null}
              {selectedPayment === gateway.id && gateway.isAvailable ? (
                <LocalIcon name="check" className="h-4 w-4 flex-shrink-0 text-primary" />
              ) : null}
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <label htmlFor="checkout-order-note" className="mb-1 block text-xs font-medium sm:text-sm">Order Note (optional)</label>
        <textarea
          id="checkout-order-note"
          value={orderNote}
          onChange={(event) => onOrderNoteChange(event.target.value)}
          placeholder="Any special instructions..."
          rows={3}
          className="input-base resize-none"
        />
      </div>

      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row">
        <button type="button" onClick={onBack} className="btn-outline min-h-10 flex-1 px-4 py-2 text-sm">Back</button>
        <button
          type="button"
          onClick={() => {
            if (!selectedGateway?.isAvailable) {
              toast.error(selectedGateway?.disabledReason || 'This payment method is not ready yet')
              return
            }
            onReview()
          }}
          disabled={!hasAvailablePaymentGateway}
          className="btn-primary min-h-10 flex-1 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          Review Order
        </button>
      </div>
    </div>
  )
}
