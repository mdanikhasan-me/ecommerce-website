'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/frontend/stores'
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
      <div className="container-site py-20 flex flex-col items-center justify-center text-center">
        <div className="h-24 w-24 rounded-3xl bg-secondary flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2 mb-6">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/" className="btn-primary">Start Shopping</Link>
      </div>
    )
  }

  return (
    <div className="container-site py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Shopping Cart</span>
      </nav>

      <h1 className="font-display text-2xl font-bold mb-8">
        Shopping Cart <span className="text-muted-foreground font-normal">({items.length} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="bg-card border border-border rounded-2xl p-4 flex gap-4">
              <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-secondary">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`} className="font-medium hover:text-primary transition-colors line-clamp-2 text-sm">
                  {item.name}
                </Link>
                {item.variantName && <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>}
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.sku}</p>

                <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      type="button"
                      aria-label={`Decrease quantity for ${item.name}`}
                      title={`Decrease quantity for ${item.name}`}
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      className="p-2 hover:bg-secondary transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity for ${item.name}`}
                      title={`Increase quantity for ${item.name}`}
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      disabled={item.quantity >= item.stockQuantity}
                      className="p-2 hover:bg-secondary transition-colors disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
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
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
            <h2 className="font-display font-semibold text-lg mb-4">Order Summary</h2>

            <div className="mb-5">
              <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-primary" /> Coupon Code
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
                    <Check className="h-3.5 w-3.5" />
                    {appliedCoupon.name} applied, {formatPrice(discount)} off
                  </p>
                  <button type="button" onClick={clearAppliedCoupon} className="font-semibold hover:underline">
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
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Secure checkout with cash on delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
