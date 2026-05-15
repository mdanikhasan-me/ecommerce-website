'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, CreditCard, Truck, Check, Loader2 } from 'lucide-react'
import { useCartStore } from '@/frontend/stores'
import { formatPrice, calculateShipping, cn } from '@/backend/utils'
import { PAYMENT_GATEWAYS } from '@/backend/config/payment'
import toast from 'react-hot-toast'

const addressSchema = z.object({
  fullName: z.string().min(3, 'Full name required'),
  phone: z.string().min(11, 'Valid phone number required'),
  addressLine1: z.string().min(5, 'Address required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  district: z.string().min(2, 'District required'),
  division: z.string().min(2, 'Division required'),
  postalCode: z.string().optional(),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
})

type AddressForm = z.infer<typeof addressSchema>

const DIVISIONS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh']
const STEPS = ['Delivery', 'Payment', 'Review']
const PAYMENT_GATEWAY_OPTIONS = PAYMENT_GATEWAYS

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, getSubtotal, clearCart } = useCartStore()
  const [step, setStep] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState(
    () => PAYMENT_GATEWAY_OPTIONS.find((gateway) => gateway.isAvailable)?.id ?? 'CASH_ON_DELIVERY'
  )
  const [submitting, setSubmitting] = useState(false)
  const [orderNote, setOrderNote] = useState('')

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  })

  const subtotal = getSubtotal()
  const shippingFee = calculateShipping(subtotal)
  const total = subtotal + shippingFee
  const paymentGateways = PAYMENT_GATEWAY_OPTIONS
  const selectedGateway = paymentGateways.find((gateway) => gateway.id === selectedPayment)
  const hasAvailablePaymentGateway = paymentGateways.some((gateway) => gateway.isAvailable)

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart')
    }
  }, [items.length, router])

  if (items.length === 0) return null

  const onAddressSubmit = (data: AddressForm) => {
    if (!session && !data.email) {
      toast.error('Email is required for guest checkout')
      return
    }

    setStep(1)
  }

  const placeOrder = async () => {
    const addressData = getValues()
    if (!selectedGateway?.isAvailable) {
      toast.error(selectedGateway?.disabledReason || 'This payment method is not ready yet')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            price: i.price,
            productName: i.name,
            productSku: i.sku,
            variantName: i.variantName,
            imageUrl: i.image,
          })),
          address: addressData,
          paymentMethod: selectedPayment,
          subtotal,
          shippingFee,
          total,
          notes: orderNote,
          isGuestOrder: !session,
          guestEmail: !session ? addressData.email : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      clearCart()
      router.push(`/order/${data.orderNumber}/confirmation`)
      toast.success('Order placed successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-site py-8">
      <div className="max-w-5xl">
        <h1 className="font-display text-2xl font-bold mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  i < step ? 'bg-primary text-white' : i === step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                )}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn('text-sm font-medium hidden sm:block', i <= step ? 'text-foreground' : 'text-muted-foreground')}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-4 transition-colors', i < step ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 0: Delivery */}
            {step === 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Delivery Address
                </h2>

                <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="checkout-full-name" className="text-sm font-medium mb-1 block">Full Name *</label>
                      <input id="checkout-full-name" {...register('fullName')} placeholder="Arif Rahman" className="input-base" />
                      {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="checkout-phone" className="text-sm font-medium mb-1 block">Phone *</label>
                      <input id="checkout-phone" {...register('phone')} placeholder="01712345678" className="input-base" />
                      {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>

                  {!session && (
                    <div>
                      <label htmlFor="checkout-email" className="text-sm font-medium mb-1 block">Email *</label>
                      <input id="checkout-email" {...register('email')} type="email" placeholder="you@example.com" className="input-base" />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                    </div>
                  )}

                  <div>
                    <label htmlFor="checkout-address-line-1" className="text-sm font-medium mb-1 block">Address Line 1 *</label>
                    <input id="checkout-address-line-1" {...register('addressLine1')} placeholder="House/Flat number, Road, Area" className="input-base" />
                    {errors.addressLine1 && <p className="text-xs text-destructive mt-1">{errors.addressLine1.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="checkout-address-line-2" className="text-sm font-medium mb-1 block">Address Line 2</label>
                    <input id="checkout-address-line-2" {...register('addressLine2')} placeholder="Landmark (optional)" className="input-base" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="checkout-division" className="text-sm font-medium mb-1 block">Division *</label>
                      <select id="checkout-division" {...register('division')} className="input-base">
                        <option value="">Select Division</option>
                        {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      {errors.division && <p className="text-xs text-destructive mt-1">{errors.division.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="checkout-district" className="text-sm font-medium mb-1 block">District *</label>
                      <input id="checkout-district" {...register('district')} placeholder="e.g. Dhaka" className="input-base" />
                      {errors.district && <p className="text-xs text-destructive mt-1">{errors.district.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="checkout-city" className="text-sm font-medium mb-1 block">City *</label>
                      <input id="checkout-city" {...register('city')} placeholder="e.g. Dhaka City" className="input-base" />
                      {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
                    </div>
                  </div>

                  <button type="submit" className="btn-primary w-full mt-2">
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-display font-semibold text-lg mb-5 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Payment Method
                </h2>

                <div className="space-y-3">
                  {paymentGateways.map((gateway) => (
                    <label
                      key={gateway.id}
                      className={cn(
                        'flex items-center gap-4 rounded-xl border-2 p-4 transition-all',
                        gateway.isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70',
                        selectedPayment === gateway.id && gateway.isAvailable
                          ? 'border-primary bg-primary/5'
                          : 'border-border',
                        gateway.isAvailable ? 'hover:border-primary/30' : 'bg-muted/25'
                      )}
                    >
                      <input aria-label={gateway.name}
                        type="radio"
                        name="payment"
                        value={gateway.id}
                        checked={selectedPayment === gateway.id}
                        onChange={() => {
                          if (gateway.isAvailable) setSelectedPayment(gateway.id)
                        }}
                        disabled={!gateway.isAvailable}
                        className="sr-only"
                      />
                      <div className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                        selectedPayment === gateway.id && gateway.isAvailable
                          ? 'border-primary'
                          : 'border-muted-foreground/60'
                      )}>
                        {selectedPayment === gateway.id && gateway.isAvailable && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-sm">{gateway.name}</p>
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
                      {gateway.logos?.length ? (
                        <div className="ml-auto flex flex-shrink-0 items-center">
                          <div className="flex min-h-12 min-w-[4.9rem] items-center justify-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 shadow-sm sm:min-w-[6rem]">
                            {gateway.logos.map((logo) => (
                              <Image
                                key={`${gateway.id}-${logo.alt}`}
                                src={logo.src}
                                alt={logo.alt}
                                width={logo.width}
                                height={logo.height}
                                unoptimized
                                className={cn(
                                  'block w-auto object-contain',
                                  logo.alt === 'Cash on Delivery' && 'h-5',
                                  logo.alt === 'bKash' && 'h-5.5',
                                  logo.alt === 'Nagad' && 'h-6',
                                  logo.alt === 'Visa' && 'h-4.5',
                                  logo.alt === 'Mastercard' && 'h-5'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {selectedPayment === gateway.id && <Check className="h-4 w-4 flex-shrink-0 text-primary" />}
                    </label>
                  ))}
                </div>

                <div className="mt-4">
                  <label htmlFor="checkout-order-note" className="text-sm font-medium mb-1 block">Order Note (optional)</label>
                  <textarea id="checkout-order-note"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Any special instructions..."
                    rows={3}
                    className="input-base resize-none"
                  />
                </div>

                <div className="flex gap-3 mt-5">
                  <button type="button" onClick={() => setStep(0)} className="btn-outline flex-1">Back</button>
                  <button type="button"
                    onClick={() => {
                      if (!selectedGateway?.isAvailable) {
                        toast.error(selectedGateway?.disabledReason || 'This payment method is not ready yet')
                        return
                      }
                      setStep(2)
                    }}
                    disabled={!hasAvailablePaymentGateway}
                    className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-semibold mb-3">Order Items ({items.length})</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                          {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                          {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                          <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                  <button type="button" onClick={placeOrder} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order...</> : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
              <h3 className="font-display font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  {shippingFee === 0 ? <span className="text-green-600 font-medium">Free</span> : <span>{formatPrice(shippingFee)}</span>}
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-xl text-green-700 text-xs text-center font-medium">
                <Truck className="h-4 w-4 inline mr-1.5" />
                Estimated delivery: 1 to 3 business days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
