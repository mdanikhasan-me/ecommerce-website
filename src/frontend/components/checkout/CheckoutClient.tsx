'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartStore, type CartCoupon, type CartItem } from '@/frontend/stores/cart'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { formatPrice, calculateShipping, cn } from '@/backend/utils'
import toast from '@/frontend/lib/toast'

const CheckoutPaymentStep = dynamic(
  () => import('@/frontend/components/checkout/CheckoutPaymentStep').then((mod) => mod.CheckoutPaymentStep),
  { loading: () => null, ssr: false },
)

const CheckoutReviewStep = dynamic(
  () => import('@/frontend/components/checkout/CheckoutReviewStep').then((mod) => mod.CheckoutReviewStep),
  { loading: () => null, ssr: false },
)

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

export type SavedAddress = {
  id: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  district: string
  division: string
  postalCode: string | null
  isDefault: boolean
}

type DeliveryMode = 'saved' | 'new'
type DeliveryHandoff = 'hand-to-me' | 'call-first' | 'reception'

const DIVISIONS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh']
const DELIVERY_FORM_ID = 'checkout-delivery-form'
const CHECKOUT_STEPS = [
  {
    title: 'Where should we deliver?',
    description: 'Choose an address and delivery speed before moving to payment.',
    nextTitle: 'Next: Payment',
    nextDescription: 'Review follows after payment details',
  },
  {
    title: 'How would you like to pay?',
    description: 'Choose a secure payment method before reviewing your order.',
    nextTitle: 'Next: Review',
    nextDescription: 'Confirm every detail before placing the order',
  },
  {
    title: 'Review and place your order',
    description: 'Check the delivery, payment and item details one final time.',
    nextTitle: 'Final step',
    nextDescription: 'Place the order when everything looks right',
  },
] as const

const HANDOFF_LABELS: Record<DeliveryHandoff, string> = {
  'hand-to-me': 'Hand it to me',
  'call-first': 'Call before arrival',
  reception: 'Leave with reception',
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function addressFormFromSavedAddress(address: SavedAddress): AddressForm {
  return {
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? '',
    city: address.city,
    district: address.district,
    division: address.division,
    postalCode: address.postalCode ?? '',
    email: '',
  }
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

function SummaryRows({
  subtotal,
  shippingFee,
  discount,
  total,
}: {
  subtotal: number
  shippingFee: number
  discount: number
  total: number
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-semibold">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Standard delivery</span>
        {shippingFee === 0 ? <span className="font-semibold">Free</span> : <span className="font-semibold">{formatPrice(shippingFee)}</span>}
      </div>
      <div className={cn('flex justify-between gap-4', discount > 0 && 'text-green-700')}>
        <span className={discount > 0 ? undefined : 'text-muted-foreground'}>Coupon discount</span>
        <span className="font-semibold">{discount > 0 ? `-${formatPrice(discount)}` : '—'}</span>
      </div>
      <div className="flex items-end justify-between gap-4 border-t border-border pt-4">
        <span>
          <span className="block text-base font-semibold">Total</span>
          <span className="block text-xs text-muted-foreground">Taxes included where applicable</span>
        </span>
        <span className="text-2xl font-bold tracking-[-0.025em]">{formatPrice(total)}</span>
      </div>
    </div>
  )
}

function CouponCodeField({
  couponCode,
  appliedCoupon,
  discount,
  applyingCoupon,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
}: {
  couponCode: string
  appliedCoupon: CartCoupon | null
  discount: number
  applyingCoupon: boolean
  onCouponCodeChange: (value: string) => void
  onApplyCoupon: () => void
  onRemoveCoupon: () => void
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-center gap-2">
        <p className="text-sm font-semibold">Have a coupon?</p>
        <p className="text-xs text-muted-foreground">(optional)</p>
      </div>
      <div className="flex gap-2">
        <input
          aria-label="Coupon code"
          type="text"
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(event) => onCouponCodeChange(event.target.value.toUpperCase())}
          className="input-base h-11 text-sm"
        />
        <button
          type="button"
          onClick={onApplyCoupon}
          disabled={applyingCoupon || !couponCode.trim()}
          className="min-h-11 shrink-0 rounded-lg border border-foreground bg-background px-5 py-2 text-sm font-semibold text-foreground focus-visible:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {applyingCoupon ? '...' : 'Apply'}
        </button>
      </div>
      {appliedCoupon ? (
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-green-700">
          <p className="flex min-w-0 items-center gap-1 font-medium">
            <LocalIcon name="check" className="h-3.5 w-3.5" />
            <span className="truncate">{appliedCoupon.name} applied, {formatPrice(discount)} off</span>
          </p>
          <button type="button" onClick={onRemoveCoupon} className="min-h-8 rounded-md px-2 font-semibold focus-visible:bg-green-100">
            Remove
          </button>
        </div>
      ) : null}
    </div>
  )
}

function OrderSummaryCard({
  items,
  subtotal,
  shippingFee,
  discount,
  total,
  compact = false,
  showCheckoutCta = false,
  onContinue,
  onUpdateQuantity,
}: {
  items: CartItem[]
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  compact?: boolean
  showCheckoutCta?: boolean
  onContinue?: () => void
  onUpdateQuantity?: (item: CartItem, quantity: number) => void
}) {
  const visibleItems = compact ? items.slice(0, 2) : items
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <section data-checkout-summary-card className="checkout-order-summary-card flex flex-col overflow-hidden rounded-xl border border-black/10 bg-card shadow-[0_12px_30px_rgba(15,23,42,0.045)]">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 py-3.5 sm:px-5">
        <h2 className="text-lg font-semibold tracking-[-0.015em] sm:text-xl">Order summary</h2>
        <span className="text-xs text-muted-foreground sm:text-sm">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
      </div>

      <div data-checkout-summary-items className="min-h-0 divide-y divide-black/10 px-4 sm:px-5 min-[1280px]:max-h-[22rem] min-[1280px]:overflow-y-auto min-[1280px]:overscroll-contain">
        {visibleItems.map((item) => (
          <div key={`${item.productId}-${item.variantId ?? 'base'}`} className="flex items-center gap-3 py-3.5">
            <div className="relative aspect-[5/4] w-16 shrink-0 overflow-hidden rounded-md border border-black/10 bg-black/[0.025] sm:w-[4.5rem]">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="84px" />
              ) : (
                <LocalIcon name="package" className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold leading-5">{item.name}</p>
              {item.variantName ? <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{item.variantName}</p> : null}
              {onUpdateQuantity ? (
                <div className="mt-2 inline-flex h-11 items-center overflow-hidden rounded-lg border border-black/10 bg-background sm:h-8">
                  <button
                    type="button"
                    aria-label={`Decrease quantity for ${item.name}`}
                    disabled={item.quantity <= 1}
                    onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                    className="flex h-full w-11 items-center justify-center text-sm focus-visible:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-35 sm:w-8"
                  >
                    <LocalIcon name="minus" className="h-3.5 w-3.5" />
                  </button>
                  <span className="flex h-full min-w-11 items-center justify-center border-x border-black/10 px-2 text-xs font-semibold sm:min-w-8">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Increase quantity for ${item.name}`}
                    disabled={item.quantity >= item.stockQuantity}
                    onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                    className="flex h-full w-11 items-center justify-center text-sm focus-visible:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-35 sm:w-8"
                  >
                    <LocalIcon name="plus" className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Quantity {item.quantity}</p>
              )}
            </div>
            <p className="shrink-0 self-start pt-0.5 text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}
        {compact && items.length > visibleItems.length ? (
          <p className="py-3 text-center text-xs text-muted-foreground">+{items.length - visibleItems.length} more items</p>
        ) : null}
      </div>

      <div data-checkout-summary-totals className="shrink-0 border-t border-black/10 px-4 py-4 sm:px-5">
        <SummaryRows subtotal={subtotal} shippingFee={shippingFee} discount={discount} total={total} />
        {showCheckoutCta ? (
          <button
            type="button"
            onClick={onContinue}
            className="mt-3 hidden min-h-[3.25rem] w-full items-center justify-center gap-3 rounded-lg bg-[#121212] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(18,18,18,0.12)] focus-visible:bg-black/80 min-[1280px]:flex"
          >
            Continue to payment <LocalIcon name="arrow-right" className="h-4 w-4" />
          </button>
        ) : null}

      </div>
    </section>
  )
}

function SavedAddressSelectionCard({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
}: {
  addresses: SavedAddress[]
  selectedAddressId: string | null
  onSelectAddress: (id: string) => void
  onAddNewAddress: () => void
}) {
  const [isChoosingAddress, setIsChoosingAddress] = useState(false)
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) ?? addresses[0]

  return (
    <section data-checkout-address className="rounded-xl border border-black/10 bg-card p-4 shadow-[0_12px_30px_rgba(15,23,42,0.045)] sm:p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <span>
          <h2 className="text-lg font-semibold tracking-[-0.015em] sm:text-xl">Delivery address</h2>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground sm:text-sm">
            Your selected address stays compact, even when it is your only saved address.
          </span>
        </span>
          <Link href="/account/addresses" className="min-h-11 rounded-lg px-1 py-2 text-sm font-semibold underline underline-offset-4 focus-visible:bg-secondary/70 sm:min-h-9">
          Manage addresses
        </Link>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-lg border border-black/10 bg-black/[0.025] p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-md border border-black/10 bg-background">
          <LocalIcon name="map-pin" className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{selectedAddress.fullName}</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground sm:text-sm">
            {selectedAddress.addressLine1}
            {selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''}
          </span>
          <span className="block text-xs leading-5 text-muted-foreground sm:text-sm">
            {selectedAddress.city}, {selectedAddress.district}, {selectedAddress.division}
            {selectedAddress.postalCode ? ` ${selectedAddress.postalCode}` : ''} · {selectedAddress.phone}
          </span>
        </span>
        <span className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-1 sm:flex">
          <Link href="/account/addresses" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-black/15 bg-background px-4 text-sm font-semibold focus-visible:bg-secondary/70">
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setIsChoosingAddress((current) => !current)}
            aria-expanded={isChoosingAddress}
            className="min-h-11 rounded-lg border border-black/15 bg-background px-4 text-sm font-semibold focus-visible:bg-secondary/70"
          >
            Change
          </button>
        </span>
      </div>

      {isChoosingAddress ? (
        <div className="mt-4 grid gap-2 border-t border-black/10 pt-4" aria-label="Choose a delivery address">
          {addresses.map((address) => {
            const isSelected = address.id === selectedAddress.id
            return (
              <button
                key={address.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  onSelectAddress(address.id)
                  setIsChoosingAddress(false)
                }}
                className={cn(
                  'flex min-h-12 w-full items-center justify-between gap-4 rounded-lg px-4 py-3 text-left text-sm focus-visible:bg-black/[0.04]',
                  isSelected ? 'bg-black/[0.045] font-semibold' : 'bg-black/[0.025]',
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate">{address.fullName}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">{address.addressLine1}, {address.city}</span>
                </span>
                {isSelected ? <LocalIcon name="check" className="h-4 w-4 shrink-0" /> : null}
              </button>
            )
          })}
          <button
            type="button"
            onClick={onAddNewAddress}
            className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-black/[0.035] px-4 text-sm font-semibold focus-visible:bg-black/[0.06]"
          >
            <LocalIcon name="plus" className="h-4 w-4" />
            Use a new address
          </button>
        </div>
      ) : null}
    </section>
  )
}

function DeliveryMethodCard({ shippingFee }: { shippingFee: number }) {
  return (
    <fieldset data-checkout-delivery-method className="rounded-xl border border-black/10 bg-card p-4 shadow-[0_12px_30px_rgba(15,23,42,0.045)] sm:p-5">
      <legend className="sr-only">Delivery method</legend>
      <h2 className="text-lg font-semibold tracking-[-0.015em] sm:text-xl">Delivery method</h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">Choose the available delivery service for this order.</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="grid min-h-[8.25rem] cursor-default grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-lg border-2 border-foreground bg-black/[0.025] p-4 focus-within:bg-black/[0.045]">
          <input type="radio" name="delivery-method" checked readOnly className="sr-only" />
          <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">Standard delivery</span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground sm:text-sm">Estimated arrival: 2–4 business days</span>
            <span className="block text-xs leading-5 text-muted-foreground sm:text-sm">Tracked delivery to your door</span>
          </span>
          <span className="text-sm font-semibold">{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span>
        </label>

        <div aria-disabled="true" className="grid min-h-[8.25rem] grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-lg border border-black/15 bg-black/[0.015] p-4 text-muted-foreground">
          <span className="mt-0.5 h-5 w-5 rounded-full border border-black/25" />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">Express delivery</span>
              <span className="rounded-full border border-black/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Eligible areas</span>
            </span>
              <span className="mt-1 block text-xs leading-5 sm:text-sm">Faster delivery is not available for this order yet.</span>
          </span>
          <span className="text-right text-xs font-semibold leading-4">Currently<br />unavailable</span>
        </div>
      </div>
    </fieldset>
  )
}

function DeliveryInstructionsCard({
  orderNote,
  handoff,
  onOrderNoteChange,
  onHandoffChange,
}: {
  orderNote: string
  handoff: DeliveryHandoff
  onOrderNoteChange: (note: string) => void
  onHandoffChange: (handoff: DeliveryHandoff) => void
}) {
  return (
    <section data-checkout-delivery-instructions className="rounded-xl border border-black/10 bg-card p-4 shadow-[0_12px_30px_rgba(15,23,42,0.045)] sm:p-5">
      <h2 className="text-lg font-semibold tracking-[-0.015em] sm:text-xl">
        Delivery instructions <span className="text-xs font-normal text-muted-foreground sm:text-sm">(optional)</span>
      </h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">Add a note for the courier or choose how the order should be handed over.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_15.5rem]">
        <label className="sr-only" htmlFor="checkout-delivery-note">Delivery note</label>
        <input
          id="checkout-delivery-note"
          value={orderNote}
          onChange={(event) => onOrderNoteChange(event.target.value)}
          maxLength={440}
          placeholder="Example: Call before arrival or leave with reception"
          className="input-base h-12"
        />
        <label className="sr-only" htmlFor="checkout-handoff">Delivery handoff</label>
        <select
          id="checkout-handoff"
          value={handoff}
          onChange={(event) => onHandoffChange(event.target.value as DeliveryHandoff)}
          className="input-base h-12 font-semibold"
        >
          <option value="hand-to-me">Hand it to me</option>
          <option value="call-first">Call before arrival</option>
          <option value="reception">Leave with reception</option>
        </select>
      </div>
    </section>
  )
}

export function CheckoutClient({ initialAddresses = [] }: { initialAddresses?: SavedAddress[] }) {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const appliedCoupon = useCartStore((state) => state.appliedCoupon)
  const getSubtotal = useCartStore((state) => state.getSubtotal)
  const setAppliedCoupon = useCartStore((state) => state.setAppliedCoupon)
  const clearAppliedCoupon = useCartStore((state) => state.clearAppliedCoupon)
  const clearCart = useCartStore((state) => state.clearCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const [step, setStep] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState('CASH_ON_DELIVERY')
  const [submitting, setSubmitting] = useState(false)
  const [orderNote, setOrderNote] = useState('')
  const [deliveryHandoff, setDeliveryHandoff] = useState<DeliveryHandoff>('hand-to-me')
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code ?? '')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [cartHydrated, setCartHydrated] = useState(false)
  const preferredInitialAddress = initialAddresses.find((address) => address.isDefault) ?? initialAddresses[0] ?? null
  const [savedAddresses] = useState<SavedAddress[]>(initialAddresses)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(preferredInitialAddress?.id ?? null)
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(preferredInitialAddress ? 'saved' : 'new')
  const [saveNewAddress, setSaveNewAddress] = useState(!preferredInitialAddress)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  })

  const subtotal = getSubtotal()
  const shippingFee = calculateShipping(subtotal)
  const discount = Math.min(appliedCoupon?.discount ?? 0, subtotal)
  const total = subtotal + shippingFee - discount
  const selectedSavedAddress = deliveryMode === 'saved'
    ? savedAddresses.find((address) => address.id === selectedAddressId) ?? null
    : null
  const stepContent = CHECKOUT_STEPS[step]

  useEffect(() => {
    const unsubscribe = useCartStore.persist.onFinishHydration(() => setCartHydrated(true))
    if (useCartStore.persist.hasHydrated()) setCartHydrated(true)
    return unsubscribe
  }, [])

  useEffect(() => {
    if (cartHydrated && items.length === 0) {
      router.replace('/cart')
    }
  }, [cartHydrated, items.length, router])

  useEffect(() => {
    if (appliedCoupon?.code) {
      setCouponCode(appliedCoupon.code)
    }
  }, [appliedCoupon?.code])

  if (!cartHydrated || items.length === 0) return null

  const onAddressSubmit = () => {
    setStep(1)
  }

  const updateCouponCode = (value: string) => {
    setCouponCode(value.toUpperCase())
    if (appliedCoupon) clearAppliedCoupon()
  }

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) return

    setApplyingCoupon(true)
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId ?? null,
            quantity: item.quantity,
          })),
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Invalid coupon')
        return
      }

      setAppliedCoupon(data.coupon)
      setCouponCode(data.coupon.code)
      toast.success(`Coupon applied. You save ${formatPrice(data.coupon.discount)}`)
    } catch {
      toast.error('Failed to validate coupon')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const removeCheckoutCoupon = () => {
    clearAppliedCoupon()
    setCouponCode('')
  }

  const continueWithSavedAddress = () => {
    if (!selectedSavedAddress) {
      toast.error('Select a delivery address')
      return
    }

    setStep(1)
  }

  const continueDelivery = () => {
    if (deliveryMode === 'saved') {
      continueWithSavedAddress()
      return
    }

    void handleSubmit(onAddressSubmit)()
  }

  const placeOrder = async () => {
    const addressData = selectedSavedAddress ? addressFormFromSavedAddress(selectedSavedAddress) : getValues()
    if (deliveryMode === 'saved' && !selectedSavedAddress) {
      toast.error('Select a delivery address')
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
          addressId: selectedSavedAddress?.id,
          address: addressData,
          saveAddress: selectedSavedAddress ? true : saveNewAddress,
          paymentMethod: selectedPayment,
          subtotal,
          shippingFee,
          couponCode: appliedCoupon?.code,
          total,
          notes: [orderNote.trim(), `Delivery handoff: ${HANDOFF_LABELS[deliveryHandoff]}`].filter(Boolean).join('\n'),
          isGuestOrder: false,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to place order')

      clearCart()
      router.push(`/order/${data.orderNumber}/confirmation`)
      toast.success('Order placed successfully!')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to place order'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div data-checkout-page className="checkout-frame pb-[7.5rem] pt-8 sm:pt-10 min-[1280px]:pb-16">
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[2rem] font-bold leading-[1.08] tracking-[-0.035em] sm:text-[2.35rem] lg:text-[2.5rem]">
              {stepContent.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{stepContent.description}</p>
          </div>
          <div className="shrink-0 border-t border-black/10 pt-3 text-left sm:border-0 sm:pt-0 sm:text-right">
            <p className="text-sm font-semibold">{stepContent.nextTitle}</p>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{stepContent.nextDescription}</p>
          </div>
        </div>

        <div data-checkout-layout className="checkout-layout-grid grid gap-5 min-[1280px]:items-start min-[1280px]:gap-8">
          <div data-checkout-main className="min-w-0 space-y-5">
            {step === 0 ? (
              <>
                {savedAddresses.length > 0 && deliveryMode === 'saved' ? (
                  <SavedAddressSelectionCard
                    addresses={savedAddresses}
                    selectedAddressId={selectedAddressId}
                    onSelectAddress={setSelectedAddressId}
                    onAddNewAddress={() => {
                      setDeliveryMode('new')
                      setSaveNewAddress(false)
                    }}
                  />
                ) : (
                  <form
                    id={DELIVERY_FORM_ID}
                    onSubmit={handleSubmit(onAddressSubmit)}
                    className="rounded-xl border border-black/10 bg-card p-4 shadow-[0_12px_30px_rgba(15,23,42,0.045)] sm:p-5"
                  >
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                      <span>
                        <h2 className="text-lg font-semibold tracking-[-0.015em] sm:text-xl">Delivery address</h2>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground sm:text-sm">Enter the contact and location details for this order.</span>
                      </span>
                      {savedAddresses.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setDeliveryMode('saved')}
                          className="min-h-10 rounded-lg border border-black/15 bg-background px-4 text-sm font-semibold focus-visible:bg-secondary/70"
                        >
                          Use saved address
                        </button>
                      ) : null}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="checkout-full-name" className="mb-1.5 block text-sm font-medium">Full name *</label>
                        <input
                          id="checkout-full-name"
                          {...register('fullName')}
                          autoComplete="name"
                          placeholder="Arif Rahman"
                          className="input-base h-11"
                        />
                        <FieldError message={errors.fullName?.message} />
                      </div>
                      <div>
                        <label htmlFor="checkout-phone" className="mb-1.5 block text-sm font-medium">Phone *</label>
                        <input
                          id="checkout-phone"
                          {...register('phone')}
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="01712345678"
                          className="input-base h-11"
                        />
                        <FieldError message={errors.phone?.message} />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="checkout-address-line-1" className="mb-1.5 block text-sm font-medium">Address line 1 *</label>
                        <input
                          id="checkout-address-line-1"
                          {...register('addressLine1')}
                          autoComplete="street-address"
                          placeholder="House/Flat number, Road, Area"
                          className="input-base h-11"
                        />
                        <FieldError message={errors.addressLine1?.message} />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="checkout-address-line-2" className="mb-1.5 block text-sm font-medium">Address line 2 (optional)</label>
                        <input id="checkout-address-line-2" {...register('addressLine2')} placeholder="Landmark (optional)" className="input-base h-11" />
                      </div>
                      <div>
                        <label htmlFor="checkout-division" className="mb-1.5 block text-sm font-medium">Division *</label>
                        <select id="checkout-division" {...register('division')} autoComplete="address-level1" className="input-base h-11">
                          <option value="">Select division</option>
                          {DIVISIONS.map((division) => <option key={division} value={division}>{division}</option>)}
                        </select>
                        <FieldError message={errors.division?.message} />
                      </div>
                      <div>
                        <label htmlFor="checkout-district" className="mb-1.5 block text-sm font-medium">District *</label>
                        <input id="checkout-district" {...register('district')} autoComplete="address-level2" placeholder="e.g. Dhaka" className="input-base h-11" />
                        <FieldError message={errors.district?.message} />
                      </div>
                      <div>
                        <label htmlFor="checkout-city" className="mb-1.5 block text-sm font-medium">City *</label>
                        <input id="checkout-city" {...register('city')} autoComplete="address-level2" placeholder="e.g. Dhaka City" className="input-base h-11" />
                        <FieldError message={errors.city?.message} />
                      </div>
                      <div>
                        <label htmlFor="checkout-postal-code" className="mb-1.5 block text-sm font-medium">Postal code (optional)</label>
                        <input id="checkout-postal-code" {...register('postalCode')} inputMode="numeric" autoComplete="postal-code" placeholder="1207" className="input-base h-11" />
                      </div>
                    </div>

                    <label htmlFor="checkout-save-address" className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg bg-black/[0.025] p-3">
                      <input
                        id="checkout-save-address"
                        type="checkbox"
                        checked={saveNewAddress}
                        onChange={(event) => setSaveNewAddress(event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-input accent-foreground"
                      />
                      <span>
                        <span className="block text-sm font-medium">Save this address for next time</span>
                        <span className="block text-xs leading-5 text-muted-foreground">Keep it in My Account so checkout can use it automatically later.</span>
                      </span>
                    </label>
                  </form>
                )}

                <DeliveryMethodCard shippingFee={shippingFee} />
                <DeliveryInstructionsCard
                  orderNote={orderNote}
                  handoff={deliveryHandoff}
                  onOrderNoteChange={setOrderNote}
                  onHandoffChange={setDeliveryHandoff}
                />
              </>
            ) : null}

            {step === 1 ? (
              <CheckoutPaymentStep
                selectedPayment={selectedPayment}
                onSelectedPaymentChange={setSelectedPayment}
                onBack={() => setStep(0)}
                onReview={() => setStep(2)}
              />
            ) : null}

            {step === 2 ? (
              <CheckoutReviewStep
                items={items}
                deliveryAddress={selectedSavedAddress ? addressFormFromSavedAddress(selectedSavedAddress) : getValues()}
                paymentMethod={selectedPayment}
                deliveryHandoff={HANDOFF_LABELS[deliveryHandoff]}
                shippingFee={shippingFee}
                submitting={submitting}
                onBack={() => setStep(1)}
                onPlaceOrder={placeOrder}
              />
            ) : null}

            <div data-checkout-coupon-area>
              <div data-checkout-coupon-card className="mx-auto max-w-2xl rounded-lg border border-black/10 bg-card p-3 shadow-[0_8px_20px_rgba(15,23,42,0.035)] sm:p-4">
                <CouponCodeField
                  couponCode={couponCode}
                  appliedCoupon={appliedCoupon}
                  discount={discount}
                  applyingCoupon={applyingCoupon}
                  onCouponCodeChange={updateCouponCode}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={removeCheckoutCoupon}
                />
              </div>
            </div>

          </div>

          <aside data-checkout-summary className="min-w-0 min-[1280px]:sticky min-[1280px]:top-6">
            <OrderSummaryCard
              items={items}
              subtotal={subtotal}
              shippingFee={shippingFee}
              discount={discount}
              total={total}
              showCheckoutCta={step === 0}
              onContinue={continueDelivery}
              onUpdateQuantity={(item, quantity) => updateQuantity(item.productId, quantity, item.variantId)}
            />
          </aside>
        </div>

        {step === 0 ? (
          <div data-checkout-sticky-payment className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-card/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6 min-[1280px]:hidden" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
            <div className="mx-auto flex max-w-3xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Total</span>
                <span className="block truncate text-base font-bold tracking-[-0.02em]">{formatPrice(total)}</span>
              </div>
              <button
                type="button"
                onClick={continueDelivery}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#121212] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(18,18,18,0.14)] focus-visible:bg-black/80"
              >
                Payment <LocalIcon name="arrow-right" className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
