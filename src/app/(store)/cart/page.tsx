'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/frontend/stores/cart'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { formatPrice, calculateShipping } from '@/backend/utils'
import toast from '@/frontend/lib/toast'

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const appliedCoupon = useCartStore((state) => state.appliedCoupon)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const getSubtotal = useCartStore((state) => state.getSubtotal)
  const setAppliedCoupon = useCartStore((state) => state.setAppliedCoupon)
  const clearAppliedCoupon = useCartStore((state) => state.clearAppliedCoupon)
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code ?? '')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const subtotal = getSubtotal()
  const shippingFee = calculateShipping(subtotal)
  const discount = Math.min(appliedCoupon?.discount ?? 0, subtotal)
  const total = subtotal + shippingFee - discount

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) return
    setApplyingCoupon(true)
    try {
      const res = await fetch('/api/coupons/validate', {
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
      const data = await res.json()
      if (!res.ok || !data.success) {
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

  if (items.length === 0) {
    return (
      <div className="container-site py-5 sm:py-6 lg:py-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
          <Link href="/" className="min-[1025px]:hover:text-foreground">Home</Link>
          <LocalIcon name="chevron-right" className="h-3.5 w-3.5" />
          <span className="text-foreground">Shopping Cart</span>
        </nav>

        <section className="flex min-h-[360px] flex-col items-center justify-center pb-12 pt-10 text-center sm:min-h-[430px] sm:pb-16 sm:pt-12 lg:min-h-[480px]">
          <Image
            src="/assets/commerce/empty-states/empty-cart-true-vector.svg"
            alt=""
            width={160}
            height={160}
            priority
            className="mb-5 h-36 w-36 sm:mb-6 sm:h-40 sm:w-40"
          />
          <h1 className="font-display text-[clamp(1.75rem,2.2vw,2.25rem)] font-bold tracking-[-0.04em]">Your cart is empty</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground sm:text-base">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/" className="mt-7 inline-flex h-12 min-w-52 items-center justify-center rounded-sm bg-[#121212] px-7 text-sm font-semibold text-white">Start Shopping</Link>
        </section>
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

      <h1 className="mb-6 font-display text-2xl font-bold sm:mb-7 sm:text-3xl">
        Shopping Cart <span className="font-normal text-muted-foreground">({items.reduce((count, item) => count + item.quantity, 0)} items)</span>
      </h1>

      <div className="grid gap-9 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.47fr)] xl:gap-10">
        <section>
          <div className="hidden overflow-hidden border border-border lg:block">
            <div className="grid grid-cols-[minmax(16rem,1fr)_8rem_7rem_7rem_3rem] items-center bg-[#fafafa] px-4 py-4 text-xs font-semibold uppercase tracking-[0.045em] text-[#3f4753]">
              <span>Product</span><span className="text-center">Quantity</span><span className="text-right">Unit price</span><span className="text-right">Total</span><span className="text-right">Action</span>
            </div>
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="grid grid-cols-[minmax(16rem,1fr)_8rem_7rem_7rem_3rem] items-center border-t border-border px-4 py-5">
                <div className="flex min-w-0 items-center gap-4">
                  <Link href={`/products/${item.slug}`} className="shrink-0"><div className="relative h-24 w-24 overflow-hidden bg-secondary">{item.image ? <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="96px" /> : null}</div></Link>
                  <div className="min-w-0"><Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm font-semibold text-foreground">{item.name}</Link>{item.variantName ? <p className="mt-1 text-xs text-muted-foreground">{item.variantName}</p> : null}<p className="mt-1 text-xs text-muted-foreground">{item.sku}</p></div>
                </div>
                <div className="flex justify-center"><QuantityControl item={item} updateQuantity={updateQuantity} /></div>
                <div className="text-right text-sm font-medium tabular-nums">{formatPrice(item.price)}{item.price !== item.originalPrice ? <p className="mt-1 text-xs text-muted-foreground line-through">{formatPrice(item.originalPrice)}</p> : null}</div>
                <div className="text-right text-sm font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</div>
                <div className="flex justify-end"><RemoveButton item={item} removeItem={removeItem} /></div>
              </div>
            ))}
          </div>

          <div className="lg:hidden">{items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="border-t border-border py-4 first:border-t-0">
              <div className="flex min-w-0 gap-3"><Link href={`/products/${item.slug}`} className="shrink-0"><div className="relative h-20 w-20 overflow-hidden bg-secondary">{item.image ? <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="80px" /> : null}</div></Link><div className="min-w-0 flex-1"><Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm font-semibold text-foreground">{item.name}</Link>{item.variantName ? <p className="mt-1 text-xs text-muted-foreground">{item.variantName}</p> : null}<p className="mt-1 text-xs text-muted-foreground">{item.sku}</p><p className="mt-2 text-sm font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</p></div><RemoveButton item={item} removeItem={removeItem} /></div>
              <div className="mt-4 flex items-center justify-between"><QuantityControl item={item} updateQuantity={updateQuantity} /><span className="text-xs text-muted-foreground">Unit price {formatPrice(item.price)}</span></div>
            </div>
          ))}</div>

          <Link href="/" className="mt-8 inline-flex h-11 items-center gap-2 rounded-sm border border-border bg-white px-4 text-sm font-semibold text-foreground"><LocalIcon name="arrow-left" className="h-4 w-4" /> Continue Shopping</Link>
        </section>

        <aside className="border-t border-border pt-7 xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0">
          <h2 className="font-display text-xl font-semibold">Order Summary</h2>
          <div className="mt-5 border-b border-border pb-5">
            <p className="flex items-center gap-2 text-sm font-semibold"><LocalIcon name="tag" className="h-4 w-4" /> Coupon Code</p>
            <div className="mt-3 flex gap-2"><input aria-label="Enter code" title="Enter code" type="text" placeholder="Enter code" value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); if (appliedCoupon) clearAppliedCoupon() }} className="h-11 min-w-0 flex-1 rounded-sm border border-border bg-white px-3 text-sm outline-none placeholder:text-muted-foreground" /><button type="button" onClick={handleApplyCoupon} disabled={applyingCoupon || !couponCode} className="h-11 rounded-sm border border-border bg-white px-4 text-sm font-semibold text-foreground disabled:opacity-45">{applyingCoupon ? '...' : 'Apply'}</button></div>
            {appliedCoupon ? <div className="mt-3 flex items-center justify-between gap-3 text-xs text-green-700"><p className="flex min-w-0 items-center gap-1 font-medium"><LocalIcon name="check" className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{appliedCoupon.name} applied, {formatPrice(discount)} off</span></p><button type="button" onClick={clearAppliedCoupon} className="shrink-0 font-semibold">Remove</button></div> : null}
          </div>
          <div className="space-y-3 border-b border-border py-5 text-sm"><div className="flex justify-between gap-4"><span className="text-muted-foreground">Subtotal ({items.reduce((count, item) => count + item.quantity, 0)} items)</span><span className="font-medium tabular-nums">{formatPrice(subtotal)}</span></div><div className="flex justify-between gap-4"><span className="text-muted-foreground">Shipping</span>{shippingFee === 0 ? <span className="font-medium text-green-700">Free</span> : <span className="font-medium tabular-nums">{formatPrice(shippingFee)}</span>}</div>{discount > 0 ? <div className="flex justify-between gap-4 text-green-700"><span>Coupon discount</span><span className="tabular-nums">-{formatPrice(discount)}</span></div> : null}</div>
          <div className="flex items-center justify-between gap-4 py-4 text-lg font-bold"><span>Total</span><span className="tabular-nums">{formatPrice(total)}</span></div>
          <Link href="/checkout" className="flex h-12 w-full items-center justify-center gap-3 rounded-sm bg-[#121212] px-4 text-sm font-semibold text-white">Proceed to Checkout <LocalIcon name="arrow-right" className="h-4 w-4" /></Link>
          <p className="mt-3 text-center text-xs text-muted-foreground">Cash on delivery is available at checkout</p>
        </aside>
      </div>
    </div>
  )
}

function QuantityControl({ item, updateQuantity }: { item: { productId: string; variantId?: string; name: string; quantity: number; stockQuantity: number }; updateQuantity: (productId: string, quantity: number, variantId?: string) => void }) {
  return <div className="flex h-11 items-center overflow-hidden rounded-sm border border-border"><button type="button" aria-label={`Decrease quantity for ${item.name}`} title={`Decrease quantity for ${item.name}`} onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)} className="flex h-full w-10 items-center justify-center"><LocalIcon name="minus" className="h-3.5 w-3.5" /></button><span className="flex h-full min-w-10 items-center justify-center border-x border-border px-2 text-sm font-semibold">{item.quantity}</span><button type="button" aria-label={`Increase quantity for ${item.name}`} title={`Increase quantity for ${item.name}`} onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)} disabled={item.quantity >= item.stockQuantity} className="flex h-full w-10 items-center justify-center disabled:opacity-40"><LocalIcon name="plus" className="h-3.5 w-3.5" /></button></div>
}

function RemoveButton({ item, removeItem }: { item: { productId: string; variantId?: string; name: string }; removeItem: (productId: string, variantId?: string) => void }) {
  return <button type="button" aria-label={`Remove ${item.name} from cart`} title={`Remove ${item.name} from cart`} onClick={() => removeItem(item.productId, item.variantId)} className="flex h-10 w-10 items-center justify-center text-muted-foreground"><LocalIcon name="trash-2" className="h-4 w-4" /></button>
}
