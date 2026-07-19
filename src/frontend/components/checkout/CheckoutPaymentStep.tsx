'use client'

import Image from 'next/image'
import { PAYMENT_GATEWAYS } from '@/backend/config/payment'
import { cn } from '@/backend/utils'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import toast from '@/frontend/lib/toast'

const PAYMENT_LOGO_CLASSES: Record<string, string> = {
  'Cash on Delivery': 'h-4 w-auto max-w-[3.5rem]',
  bKash: 'h-7 w-auto max-w-[4rem]',
  Nagad: 'h-6 w-auto max-w-[3.8rem]',
  Visa: 'h-5 w-auto max-w-[3.2rem]',
  Mastercard: 'h-5 w-auto max-w-[1.8rem]',
}

export function CheckoutPaymentStep({
  selectedPayment,
  onSelectedPaymentChange,
  onBack,
  onReview,
}: {
  selectedPayment: string
  onSelectedPaymentChange: (paymentId: string) => void
  onBack: () => void
  onReview: () => void
}) {
  const selectedGateway = PAYMENT_GATEWAYS.find((gateway) => gateway.id === selectedPayment)
  const hasAvailablePaymentGateway = PAYMENT_GATEWAYS.some((gateway) => gateway.isAvailable)

  return (
    <fieldset className="rounded-[1.25rem] border border-black/10 bg-card p-4 shadow-[0_18px_42px_rgba(24,24,22,0.06)] sm:p-6">
      <legend className="sr-only">Payment method</legend>
      <h2 className="text-lg font-semibold tracking-[-0.015em] sm:text-xl">Payment method</h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">Choose one available way to pay for this order.</p>

      <div className="mt-5 space-y-3">
        {PAYMENT_GATEWAYS.map((gateway) => (
          <label
            key={gateway.id}
            className={cn(
              'grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[1rem] border p-3 focus-within:border-foreground focus-within:bg-[#ececea] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:p-4',
              gateway.isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70',
              selectedPayment === gateway.id && gateway.isAvailable
                ? 'border-foreground bg-[#f7f7f5]'
                : 'border-black/10',
              !gateway.isAvailable && 'bg-[#f7f7f5]',
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
                'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border',
                selectedPayment === gateway.id && gateway.isAvailable
                  ? 'border-foreground'
                  : 'border-muted-foreground/50',
              )}
            >
              {selectedPayment === gateway.id && gateway.isAvailable ? (
                <div className="h-2.5 w-2.5 rounded-full bg-foreground" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{gateway.name}</p>
                {gateway.badge ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800">
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
                    'flex h-10 w-16 flex-shrink-0 items-center justify-center gap-1.5 rounded-lg border border-black/10 bg-background px-2 sm:w-20',
                    !gateway.isAvailable && 'opacity-60',
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
                <LocalIcon name="check" className="h-4 w-4 flex-shrink-0 text-foreground" />
              ) : null}
            </div>
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
        <button type="button" onClick={onBack} className="min-h-12 flex-1 rounded-[0.875rem] border border-black/15 bg-background px-4 py-2 text-sm font-semibold focus-visible:bg-secondary/70">Back</button>
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
          className="min-h-12 flex-1 rounded-[0.875rem] bg-[#121212] px-4 py-2 text-sm font-semibold text-white focus-visible:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue to review
        </button>
      </div>
    </fieldset>
  )
}
