'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/frontend/stores/cart'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { formatPrice, calculateShipping, applyCoupon } from '@/backend/utils'
import toast from 'react-hot-toast'

export default function CartPage() {
  const {
    items,
    appliedCoupon,
    removeItem,
    updateQuantity,
    getSubtotal,
    setAppliedCoupon,
    clearAppliedCoupon,
  } = useCartStore()
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code ?? '')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const subtotal = getSubtotal()
  const shippingFee = calculateShipping(subtotal)
  const discount = appliedCoupon ? applyCoupon(subtotal, appliedCoupon) : 0
  const total = subtotal + shippingFee - discount

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) return
    setApplyingCoupon(true)
    try {
      const productIds = items.map((item) => item.productId).join(',')
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}&amount=${subtotal}&productIds=${encodeURIComponent(productIds)}`)
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Invalid coupon')
        return
      }
      setAppliedCoupon(data.coupon)
      setCouponCode(data.coupon.code)
      toast.success(`Coupon applied! You save ${formatPrice(applyCoupon(subtotal, data.coupon))}`)
    } catch {
      toast.error('Failed to validate coupon')
    } finally {
      setApplyingCoupon(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-site flex flex-col items-center justify-center py-12 text-center sm:py-16 lg:py-20">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary sm:h-24 sm:w-24">
          <LocalIcon name="shopping-bag" className="h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
        </div>
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="mb-5 mt-2 max-w-sm text-muted-foreground">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/" className="btn-primary">Start Shopping</Link>
      </div>
    )
  }

  return (
    <div className="container-site py-5 sm:py-6 lg:py-8">
      <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground sm:mb-5 sm:text-sm">
        <Link href="/" className="min-[1025px]:hover:text-foreground">Home</Link>
        <LocalIcon name="chevron-right" className="h-3.5 w-3.5" />
        <span className="text-foreground">Shopping Cart</span>
      </nav>

      <h1 className="mb-5 font-display text-2xl font-bold sm:mb-6">
        Shopping Cart <span className="text-muted-foreground font-normal">({items.length} items)</span>
      </h1>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)] md:items-start lg:grid-cols-3 lg:gap-8">
        <div className="space-y-3 lg:col-span-2 lg:space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 rounded-2xl border border-border bg-card p-3 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center sm:p-4">
              <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                <div className="relative h-[5.5rem] w-[5.5rem] overflow-hidden rounded-xl bg-secondary sm:h-24 sm:w-24">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`} className="font-medium min-[1025px]:hover:text-primary transition-colors line-clamp-2 text-sm">
                  {item.name}
                </Link>
                {item.variantName && <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>}
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.sku}</p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      type="button"
                      aria-label={`Decrease quantity for ${item.name}`}
                      title={`Decrease quantity for ${item.name}`}
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      className="p-2 min-[1025px]:hover:bg-secondary transition-colors"
                    >
                      <LocalIcon name="minus" className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity for ${item.name}`}
                      title={`Increase quantity for ${item.name}`}
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      disabled={item.quantity >= item.stockQuantity}
                      className="p-2 min-[1025px]:hover:bg-secondary transition-colors disabled:opacity-40"
                    >
                      <LocalIcon name="plus" className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 sm:hidden">
                    <div className="text-left">
                      <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                      {item.price !== item.originalPrice && (
                        <p className="text-xs text-muted-foreground line-through">{formatPrice(item.originalPrice * item.quantity)}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${item.name} from cart`}
                      title={`Remove ${item.name} from cart`}
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors min-[1025px]:hover:bg-destructive/10 min-[1025px]:hover:text-destructive"
                    >
                      <LocalIcon name="trash-2" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="hidden items-center gap-4 sm:flex">
                <div className="text-right">
                  <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                  {item.price !== item.originalPrice && (
                    <p className="text-xs text-muted-foreground line-through">{formatPrice(item.originalPrice * item.quantity)}</p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.name} from cart`}
                  title={`Remove ${item.name} from cart`}
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors min-[1025px]:hover:bg-destructive/10 min-[1025px]:hover:text-destructive"
                >
                  <LocalIcon name="trash-2" className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-4 sm:p-5">
            <h2 className="font-display font-semibold text-lg mb-4">Order Summary</h2>

            <div className="mb-5">
              <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <LocalIcon name="tag" className="h-4 w-4 text-primary" /> Coupon Code
              </p>
              <div className="flex gap-2">
                <input
                  aria-label="Enter code"
                  title="Enter code"
                  type="text"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase())
                    if (appliedCoupon) clearAppliedCoupon()
                  }}
                  className="input-base"
                />
                <button type="button" onClick={handleApplyCoupon} disabled={applyingCoupon || !couponCode} className="btn-outline px-3 flex-shrink-0 text-sm">
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {appliedCoupon && (
                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-green-600">
                  <p className="flex items-center gap-1 font-medium">
                    <LocalIcon name="check" className="h-3.5 w-3.5" />
                    {appliedCoupon.name} applied, {formatPrice(discount)} off
                  </p>
                  <button type="button" onClick={clearAppliedCoupon} className="font-semibold min-[1025px]:hover:underline">
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                {shippingFee === 0 ? <span className="text-green-600 font-medium">Free</span> : <span>{formatPrice(shippingFee)}</span>}
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-3 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
              Proceed to Checkout <LocalIcon name="arrow-right" className="h-4 w-4" />
            </Link>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Cash on delivery is available at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
