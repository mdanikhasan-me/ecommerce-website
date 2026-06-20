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
import { formatPrice, calculateShipping, applyCoupon, cn } from '@/backend/utils'
import type { StorefrontIconName } from '@/shared/storefront-icons'
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

type SavedAddress = {
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

const DIVISIONS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh']
const STEPS = ['Delivery', 'Payment', 'Review']
const DELIVERY_FORM_ID = 'checkout-delivery-form'

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

function CheckoutSteps({ step }: { step: number }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 sm:gap-3">
      {STEPS.map((label, index) => (
        <div key={label} className="contents">
          <div
            className={cn(
              'flex h-10 min-w-0 items-center justify-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors sm:h-10 sm:justify-start sm:px-4 sm:text-sm',
              index === step
                ? 'border-primary bg-primary text-primary-foreground'
                : index < step
                  ? 'border-primary/30 bg-primary/5 text-primary'
                  : 'border-border bg-card text-muted-foreground',
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold sm:h-6 sm:w-6 sm:text-xs',
                index === step ? 'bg-background text-primary' : 'bg-muted text-foreground',
              )}
            >
              {index < step ? <LocalIcon name="check" className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : index + 1}
            </span>
            <span className="hidden truncate sm:inline">{label}</span>
          </div>
          {index < STEPS.length - 1 ? (
            <span className={cn('h-px w-4 bg-border sm:w-10', index < step && 'bg-primary/50')} />
          ) : null}
        </div>
      ))}
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: StorefrontIconName; title: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:h-10 sm:w-10">
          <LocalIcon name={icon} className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground sm:text-lg">{title}</h2>
      </div>
      <LocalIcon name="chevron-up" className="h-4 w-4 text-muted-foreground" />
    </div>
  )
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
    <div className="space-y-2.5 text-xs sm:text-sm">
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Shipping</span>
        {shippingFee === 0 ? <span className="font-medium text-green-600">Free</span> : <span>{formatPrice(shippingFee)}</span>}
      </div>
      {discount > 0 ? (
        <div className="flex justify-between gap-4 text-green-600">
          <span>Coupon Discount</span>
          <span>-{formatPrice(discount)}</span>
        </div>
      ) : null}
      <div className="flex justify-between gap-4 border-t border-border pt-3 text-base font-semibold sm:text-lg">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
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
    <div className="border-t border-border pt-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
        <LocalIcon name="tag" className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
        Have coupon code?
      </p>
      <div className="flex gap-2">
        <input
          aria-label="Coupon code"
          type="text"
          placeholder="Optional"
          value={couponCode}
          onChange={(event) => onCouponCodeChange(event.target.value.toUpperCase())}
          className="input-base h-10 text-xs sm:text-sm"
        />
        <button
          type="button"
          onClick={onApplyCoupon}
          disabled={applyingCoupon || !couponCode.trim()}
          className="btn-outline min-h-10 shrink-0 px-4 py-2 text-xs sm:text-sm"
        >
          {applyingCoupon ? '...' : 'Apply'}
        </button>
      </div>
      {appliedCoupon ? (
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-green-600">
          <p className="flex min-w-0 items-center gap-1 font-medium">
            <LocalIcon name="check" className="h-3.5 w-3.5" />
            <span className="truncate">{appliedCoupon.name} applied, {formatPrice(discount)} off</span>
          </p>
          <button type="button" onClick={onRemoveCoupon} className="font-semibold">
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
  title,
  showEditCart,
  showCheckoutCta = false,
  showBenefits = false,
  showSecureLine = false,
  couponCode,
  appliedCoupon,
  applyingCoupon = false,
  onContinue,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
}: {
  items: CartItem[]
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  compact?: boolean
  title?: string
  showEditCart?: boolean
  showCheckoutCta?: boolean
  showBenefits?: boolean
  showSecureLine?: boolean
  couponCode?: string
  appliedCoupon?: CartCoupon | null
  applyingCoupon?: boolean
  onContinue?: () => void
  onCouponCodeChange?: (value: string) => void
  onApplyCoupon?: () => void
  onRemoveCoupon?: () => void
}) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const visibleItems = compact ? items.slice(0, 2) : items
  const summaryTitle = title ?? (compact ? 'Order Summary' : 'Your Order')
  const shouldShowEditCart = showEditCart ?? !compact
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-[0_10px_24px_rgba(23,18,15,0.04)] sm:rounded-2xl sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold sm:text-lg">{summaryTitle}</h2>
        {shouldShowEditCart ? (
          <Link href="/cart" className="inline-flex items-center gap-1 text-xs font-medium text-primary sm:text-sm">
            Edit Cart <LocalIcon name="pencil" className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <div className="mb-3 flex items-center justify-between border-b border-border pb-3 text-xs sm:text-sm">
        <span>Items ({itemCount})</span>
        {compact && items.length > visibleItems.length ? (
          <span className="text-muted-foreground">+{items.length - visibleItems.length} more</span>
        ) : null}
      </div>

      <div className="divide-y divide-border">
        {visibleItems.map((item) => (
          <div key={`${item.productId}-${item.variantId ?? 'base'}`} className="flex items-center gap-3 py-2.5 first:pt-0">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary sm:h-14 sm:w-14">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
              ) : (
                <LocalIcon name="package" className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-xs font-medium sm:text-sm">{item.name}</p>
              {item.variantName ? <p className="line-clamp-1 text-xs text-muted-foreground">{item.variantName}</p> : null}
              <p className="mt-1 text-xs sm:text-sm">Qty: {item.quantity}</p>
            </div>
            <p className="shrink-0 text-xs font-medium sm:text-sm">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      {onCouponCodeChange && onApplyCoupon && onRemoveCoupon ? (
        <div className="mt-4">
          <CouponCodeField
            couponCode={couponCode ?? ''}
            appliedCoupon={appliedCoupon ?? null}
            discount={discount}
            applyingCoupon={applyingCoupon}
            onCouponCodeChange={onCouponCodeChange}
            onApplyCoupon={onApplyCoupon}
            onRemoveCoupon={onRemoveCoupon}
          />
        </div>
      ) : null}

      <div className="mt-4 border-t border-border pt-4">
        <SummaryRows subtotal={subtotal} shippingFee={shippingFee} discount={discount} total={total} />
      </div>

      {!showBenefits ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary/5 p-3 text-xs text-primary sm:text-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <LocalIcon name="truck" className="h-4 w-4" />
          </span>
          <span>Delivery timing depends on address and availability.</span>
        </div>
      ) : null}

      {showCheckoutCta ? (
        <button type="button" onClick={onContinue} className="btn-primary mt-4 min-h-10 w-full gap-2 px-4 py-2 text-xs sm:text-sm">
          Continue to Payment <LocalIcon name="arrow-right" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      ) : null}

      {showSecureLine ? (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <LocalIcon name="shield" className="h-3.5 w-3.5" />
          Your data is secure and encrypted
        </div>
      ) : null}
    </section>
  )
}

function SavedAddressSelectionCard({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  onContinue,
}: {
  addresses: SavedAddress[]
  selectedAddressId: string | null
  onSelectAddress: (id: string) => void
  onAddNewAddress: () => void
  onContinue: () => void
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-[0_10px_24px_rgba(23,18,15,0.04)] sm:rounded-2xl sm:p-5 lg:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground sm:h-11 sm:w-11">
            <LocalIcon name="map-pin" className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <span className="min-w-0">
            <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground sm:text-lg">Delivery Address</h2>
            <span className="mt-1 block text-xs text-muted-foreground sm:text-sm">Choose or add a delivery address</span>
          </span>
        </div>

        <button type="button" onClick={onAddNewAddress} className="btn-outline min-h-9 gap-2 px-3 py-2 text-xs sm:w-auto sm:text-sm">
          <LocalIcon name="plus" className="h-3.5 w-3.5" />
          Add new address
        </button>
      </div>

      <div className="space-y-3">
        {addresses.map((address) => {
          const isSelected = address.id === selectedAddressId

          return (
            <button
              key={address.id}
              type="button"
              onClick={() => onSelectAddress(address.id)}
              className={cn(
                'grid w-full grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-xl border p-3 text-left transition-colors sm:p-4',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border bg-background/70',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                  isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card',
                )}
              >
                {isSelected ? <LocalIcon name="check" className="h-3 w-3" /> : null}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{address.fullName}</span>
                <span className="mt-1.5 block text-xs leading-5 text-muted-foreground sm:text-sm">{address.addressLine1}</span>
                {address.addressLine2 ? (
                  <span className="block text-xs leading-5 text-muted-foreground sm:text-sm">{address.addressLine2}</span>
                ) : null}
                <span className="block text-xs leading-5 text-muted-foreground sm:text-sm">
                  {address.city}, {address.district}, {address.division}
                  {address.postalCode ? ` ${address.postalCode}` : ''}
                </span>
                <span className="block text-xs leading-5 text-muted-foreground sm:text-sm">{address.phone}</span>
              </span>
            </button>
          )
        })}
      </div>

      <button type="button" onClick={onContinue} className="btn-primary mt-5 hidden min-h-10 w-full gap-2 px-4 py-2 text-sm lg:flex">
        Continue to Payment <LocalIcon name="arrow-right" className="h-4 w-4" />
      </button>

      <div className="mt-4 hidden items-center justify-center gap-2 text-xs text-muted-foreground lg:flex">
        <LocalIcon name="shield" className="h-3.5 w-3.5" />
        Your data is secure and encrypted
      </div>
    </section>
  )
}

function TrustRow() {
  const items: { icon: StorefrontIconName; title: string; text: string }[] = [
    { icon: 'shield', title: 'Secure Checkout', text: 'Your data is protected' },
    { icon: 'truck', title: 'Fast & Reliable Delivery', text: 'Quick delivery to your doorstep' },
    { icon: 'refresh-ccw', title: 'Easy Returns', text: 'Hassle-free returns' },
  ]

  return (
    <div className="hidden rounded-xl border border-border bg-card p-4 shadow-[0_10px_22px_rgba(23,18,15,0.035)] lg:grid lg:grid-cols-3">
      {items.map((item, index) => (
        <div key={item.title} className={cn('flex items-center gap-3 px-4', index > 0 && 'border-l border-border')}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LocalIcon name={item.icon} className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-xs font-semibold">{item.title}</span>
            <span className="block text-xs text-muted-foreground">{item.text}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

export function CheckoutClient() {
  const router = useRouter()
  const { items, appliedCoupon, getSubtotal, setAppliedCoupon, clearAppliedCoupon, clearCart } = useCartStore()
  const [step, setStep] = useState(0)
  const [selectedPayment, setSelectedPayment] = useState('CASH_ON_DELIVERY')
  const [submitting, setSubmitting] = useState(false)
  const [orderNote, setOrderNote] = useState('')
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code ?? '')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('new')
  const [addressesLoading, setAddressesLoading] = useState(true)
  const [saveNewAddress, setSaveNewAddress] = useState(true)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  })

  const subtotal = getSubtotal()
  const shippingFee = calculateShipping(subtotal)
  const discount = appliedCoupon ? applyCoupon(subtotal, appliedCoupon) : 0
  const total = subtotal + shippingFee - discount
  const selectedSavedAddress = deliveryMode === 'saved'
    ? savedAddresses.find((address) => address.id === selectedAddressId) ?? null
    : null
  const isSavedAddressStep = step === 0 && !addressesLoading && savedAddresses.length > 0 && deliveryMode === 'saved'

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart')
    }
  }, [items.length, router])

  useEffect(() => {
    if (appliedCoupon?.code) {
      setCouponCode(appliedCoupon.code)
    }
  }, [appliedCoupon?.code])

  useEffect(() => {
    let active = true

    async function loadSavedAddresses() {
      setAddressesLoading(true)
      try {
        const response = await fetch('/api/account/addresses', { credentials: 'same-origin' })
        if (!response.ok) throw new Error('Could not load saved addresses')
        const data = await response.json()
        const addresses = Array.isArray(data.addresses) ? data.addresses as SavedAddress[] : []

        if (!active) return
        setSavedAddresses(addresses)

        if (addresses.length > 0) {
          const preferredAddress = addresses.find((address) => address.isDefault) ?? addresses[0]
          setSelectedAddressId(preferredAddress.id)
          setDeliveryMode('saved')
          setSaveNewAddress(false)
        } else {
          setSelectedAddressId(null)
          setDeliveryMode('new')
          setSaveNewAddress(true)
        }
      } catch {
        if (!active) return
        setSavedAddresses([])
        setSelectedAddressId(null)
        setDeliveryMode('new')
        setSaveNewAddress(true)
      } finally {
        if (active) setAddressesLoading(false)
      }
    }

    loadSavedAddresses()

    return () => {
      active = false
    }
  }, [])

  if (items.length === 0) return null

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
      const productIds = items.map((item) => item.productId).join(',')
      const response = await fetch(
        `/api/coupons/validate?code=${encodeURIComponent(code)}&amount=${subtotal}&productIds=${encodeURIComponent(productIds)}`,
      )
      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.error || 'Invalid coupon')
        return
      }

      setAppliedCoupon(data.coupon)
      setCouponCode(data.coupon.code)
      toast.success(`Coupon applied. You save ${formatPrice(applyCoupon(subtotal, data.coupon))}`)
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
          notes: orderNote,
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
    <div className="container-site py-5 pb-24 sm:py-6 lg:py-8 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-5">
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-foreground sm:text-3xl">
          Checkout
        </h1>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,21rem)] lg:items-start">
          <div className="space-y-4">
            <CheckoutSteps step={step} />

            {step === 0 ? (
              addressesLoading ? (
                <section className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-[0_10px_24px_rgba(23,18,15,0.04)]">
                  Loading saved addresses...
                </section>
              ) : savedAddresses.length > 0 && deliveryMode === 'saved' ? (
                <SavedAddressSelectionCard
                  addresses={savedAddresses}
                  selectedAddressId={selectedAddressId}
                  onSelectAddress={setSelectedAddressId}
                  onAddNewAddress={() => {
                    setDeliveryMode('new')
                    setSaveNewAddress(false)
                  }}
                  onContinue={continueWithSavedAddress}
                />
              ) : (
                <form id={DELIVERY_FORM_ID} onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                  {savedAddresses.length > 0 ? (
                    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-[0_8px_20px_rgba(23,18,15,0.035)] sm:flex-row sm:items-center sm:justify-between sm:p-4">
                      <p className="text-xs text-muted-foreground sm:text-sm">Enter a different delivery address for this order.</p>
                      <button
                        type="button"
                        onClick={() => setDeliveryMode('saved')}
                        className="btn-outline min-h-9 px-4 py-2 text-xs sm:w-auto sm:text-sm"
                      >
                        Use saved address
                      </button>
                    </div>
                  ) : null}

                  <section className="rounded-xl border border-border bg-card p-4 shadow-[0_10px_24px_rgba(23,18,15,0.04)] sm:rounded-2xl sm:p-5">
                    <SectionHeader icon="user" title="Contact Details" />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="checkout-full-name" className="mb-1.5 block text-xs font-medium sm:text-sm">Full Name *</label>
                        <input id="checkout-full-name" {...register('fullName')} placeholder="Arif Rahman" className="input-base h-10 sm:h-11" />
                        <FieldError message={errors.fullName?.message} />
                      </div>
                      <div>
                        <label htmlFor="checkout-phone" className="mb-1.5 block text-xs font-medium sm:text-sm">Phone *</label>
                        <input id="checkout-phone" {...register('phone')} placeholder="01712345678" className="input-base h-10 sm:h-11" />
                        <FieldError message={errors.phone?.message} />
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-border bg-card p-4 shadow-[0_10px_24px_rgba(23,18,15,0.04)] sm:rounded-2xl sm:p-5">
                    <SectionHeader icon="map-pin" title="Delivery Address" />
                    <div className="space-y-3.5">
                      <div>
                        <label htmlFor="checkout-address-line-1" className="mb-1.5 block text-xs font-medium sm:text-sm">Address Line 1 *</label>
                        <input id="checkout-address-line-1" {...register('addressLine1')} placeholder="House/Flat number, Road, Area" className="input-base h-10 sm:h-11" />
                        <FieldError message={errors.addressLine1?.message} />
                      </div>

                      <div>
                        <label htmlFor="checkout-address-line-2" className="mb-1.5 block text-xs font-medium sm:text-sm">Address Line 2 (optional)</label>
                        <input id="checkout-address-line-2" {...register('addressLine2')} placeholder="Landmark (optional)" className="input-base h-10 sm:h-11" />
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label htmlFor="checkout-division" className="mb-1.5 block text-xs font-medium sm:text-sm">Division *</label>
                          <select id="checkout-division" {...register('division')} className="input-base h-10 sm:h-11">
                            <option value="">Select Division</option>
                            {DIVISIONS.map((division) => <option key={division} value={division}>{division}</option>)}
                          </select>
                          <FieldError message={errors.division?.message} />
                        </div>
                        <div>
                          <label htmlFor="checkout-district" className="mb-1.5 block text-xs font-medium sm:text-sm">District *</label>
                          <input id="checkout-district" {...register('district')} placeholder="e.g. Dhaka" className="input-base h-10 sm:h-11" />
                          <FieldError message={errors.district?.message} />
                        </div>
                        <div>
                          <label htmlFor="checkout-city" className="mb-1.5 block text-xs font-medium sm:text-sm">City *</label>
                          <input id="checkout-city" {...register('city')} placeholder="e.g. Dhaka City" className="input-base h-10 sm:h-11" />
                          <FieldError message={errors.city?.message} />
                        </div>
                      </div>

                      <label htmlFor="checkout-save-address" className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background/70 p-3">
                        <input
                          id="checkout-save-address"
                          type="checkbox"
                          checked={saveNewAddress}
                          onChange={(event) => setSaveNewAddress(event.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                        />
                        <span>
                          <span className="block text-xs font-medium sm:text-sm">Save this address for next time</span>
                          <span className="block text-xs leading-5 text-muted-foreground">
                            Keep it in My Account so checkout can use it automatically later.
                          </span>
                        </span>
                      </label>

                      <button type="submit" className="btn-primary mt-1 hidden min-h-10 w-full px-4 py-2 text-sm lg:flex">
                        Continue to Payment
                      </button>
                    </div>
                  </section>
                </form>
              )
            ) : null}

            {step === 1 ? (
              <CheckoutPaymentStep
                selectedPayment={selectedPayment}
                orderNote={orderNote}
                onSelectedPaymentChange={setSelectedPayment}
                onOrderNoteChange={setOrderNote}
                onBack={() => setStep(0)}
                onReview={() => setStep(2)}
              />
            ) : null}

            {step === 2 ? (
              <CheckoutReviewStep
                items={items}
                submitting={submitting}
                onBack={() => setStep(1)}
                onPlaceOrder={placeOrder}
              />
            ) : null}

            {step === 0 ? (
              <div className="lg:hidden">
                <OrderSummaryCard
                  items={items}
                  subtotal={subtotal}
                  shippingFee={shippingFee}
                  discount={discount}
                  total={total}
                  compact
                  showCheckoutCta={isSavedAddressStep}
                  showSecureLine={isSavedAddressStep}
                  onContinue={continueWithSavedAddress}
                  couponCode={couponCode}
                  appliedCoupon={appliedCoupon}
                  applyingCoupon={applyingCoupon}
                  onCouponCodeChange={updateCouponCode}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={removeCheckoutCoupon}
                />
              </div>
            ) : null}
          </div>

          <aside className="hidden lg:block">
            <OrderSummaryCard
              items={items}
              subtotal={subtotal}
              shippingFee={shippingFee}
              discount={discount}
              total={total}
              title="Order Summary"
              showEditCart={false}
              showBenefits={isSavedAddressStep}
              couponCode={couponCode}
              appliedCoupon={appliedCoupon}
              applyingCoupon={applyingCoupon}
              onCouponCodeChange={updateCouponCode}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={removeCheckoutCoupon}
            />
          </aside>
        </div>

        <TrustRow />
      </div>

      {step === 0 && !isSavedAddressStep ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-10px_30px_rgba(23,18,15,0.08)] lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-semibold tracking-[-0.02em]">{formatPrice(total)}</p>
            </div>
            <button type="button" onClick={continueDelivery} className="btn-primary min-h-11 flex-[1.7] px-4 py-2 text-sm">
              Continue to Payment
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
