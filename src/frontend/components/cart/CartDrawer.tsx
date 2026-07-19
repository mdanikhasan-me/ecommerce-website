'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/frontend/stores/cart'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { formatPrice, calculateShipping, cn } from '@/backend/utils'
import { siteConfig } from '@/backend/config/site'

export function CartDrawer() {
  const items = useCartStore((state) => state.items)
  const isOpen = useCartStore((state) => state.isOpen)
  const closeCart = useCartStore((state) => state.closeCart)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const getSubtotal = useCartStore((state) => state.getSubtotal)
  const drawerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart() }
    if (isOpen) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, closeCart])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const subtotal = getSubtotal()
  const freeShippingMin = siteConfig.shipping.freeShippingMin
  const shipping = calculateShipping(subtotal, freeShippingMin, siteConfig.shipping.baseFee)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const freeShippingRemaining = Math.max(0, freeShippingMin - subtotal)
  const freeShippingProgress = freeShippingMin > 0
    ? Math.min(100, (subtotal / freeShippingMin) * 100)
    : 100
  const hasFreeShipping = freeShippingRemaining === 0

  // Don't render until client-side hydration is complete (Zustand persist reads localStorage)
  if (!mounted) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[70] bg-foreground/32 transition-opacity duration-150',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={cn(
          'fixed bottom-0 right-0 top-0 z-[70] flex w-full flex-col bg-background shadow-[-4px_0_16px_rgba(15,23,42,0.08)] transition-transform duration-150 ease-out sm:max-w-[29rem]',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex min-h-20 items-center justify-between border-b border-border px-5 py-4">
          <h2 id="cart-drawer-title" className="font-display text-xl font-semibold tracking-tight">
            Your Cart{itemCount > 0 ? ` (${itemCount})` : ''}
          </h2>
          <button
            type="button"
            aria-label="Close cart"
            title="Close cart"
            onClick={closeCart}
            className="rounded-lg p-2 transition-colors min-[1025px]:hover:bg-secondary"
          >
            <LocalIcon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border px-5 py-4">
          <div className="mb-2.5 flex items-center justify-between gap-4 text-xs sm:text-sm">
            <p className="font-medium">
              {hasFreeShipping
                ? 'Free delivery unlocked'
                : `You are ${formatPrice(freeShippingRemaining)} away from free delivery`}
            </p>
            <span className="shrink-0 text-muted-foreground">{Math.round(freeShippingProgress)}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Free delivery progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(freeShippingProgress)}
            className="h-1 overflow-hidden rounded-full bg-foreground/10"
          >
            <div
              className="h-full rounded-full bg-foreground"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-7 py-10 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
                <LocalIcon name="shopping-bag" className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">Your cart is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">Discover products and add them to your cart.</p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="mt-1 rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors min-[1025px]:hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border px-5">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 py-4 sm:gap-4">
                  {/* Image */}
                  <Link href={`/products/${item.slug}`} onClick={closeCart} className="shrink-0">
                    <div className="product-media-frame relative w-[5.25rem] overflow-hidden rounded-md bg-secondary sm:w-24">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-contain p-1" sizes="96px" />
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/products/${item.slug}`} onClick={closeCart}>
                          <p className="line-clamp-2 text-sm font-medium transition-colors min-[1025px]:hover:text-primary">
                            {item.name}
                          </p>
                        </Link>
                        {item.variantName && (
                          <p className="mt-1 text-xs text-muted-foreground">{item.variantName}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                        {item.price !== item.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through">{formatPrice(item.originalPrice * item.quantity)}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      {/* Qty */}
                      <div className="flex h-9 items-center overflow-hidden rounded-md border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          title="Decrease quantity"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                          className="flex h-full w-8 items-center justify-center transition-colors min-[1025px]:hover:bg-secondary"
                        >
                          <LocalIcon name="minus" className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          title="Increase quantity"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                          disabled={item.quantity >= item.stockQuantity}
                          className="flex h-full w-8 items-center justify-center transition-colors disabled:opacity-40 min-[1025px]:hover:bg-secondary"
                        >
                          <LocalIcon name="plus" className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        title={`Remove ${item.name}`}
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="rounded-md p-2 text-muted-foreground transition-colors min-[1025px]:hover:bg-destructive/10 min-[1025px]:hover:text-destructive"
                      >
                        <LocalIcon name="trash-2" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 space-y-4 border-t border-border bg-background px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
            {/* Subtotal */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-600 font-medium">Free</span>
                ) : (
                  <span className="font-medium">{formatPrice(shipping)}</span>
                )}
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(subtotal + shipping)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex min-h-11 items-center justify-center rounded-md bg-foreground px-4 text-sm font-semibold text-background transition-colors min-[1025px]:hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="flex min-h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold transition-colors min-[1025px]:hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
