'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/frontend/stores/cart'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { formatPrice, calculateShipping, cn } from '@/backend/utils'
import { siteConfig } from '@/backend/config/site'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore()
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

  // Don't render until client-side hydration is complete (Zustand persist reads localStorage)
  if (!mounted) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-foreground/32 transition-opacity duration-150',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          'fixed bottom-0 right-0 top-0 z-50 flex w-[min(20.75rem,calc(100vw-3.25rem))] flex-col bg-background shadow-[-8px_0_18px_rgba(20,18,16,0.1)] transition-transform duration-150 ease-out sm:w-full sm:max-w-md',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex items-center gap-2">
            <LocalIcon name="cart" className="h-5 w-5" />
            <h2 className="font-display font-semibold text-lg">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {items.reduce((a, i) => a + i.quantity, 0)}
              </span>
            )}
          </div>
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

        {/* Items */}
        <div
          className={cn(
            'overflow-y-auto',
            items.length > 0
              ? 'max-h-[calc(100dvh-15.5rem)] bg-secondary/25'
              : 'min-h-0 flex-1'
          )}
        >
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-7 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary sm:h-20 sm:w-20">
                <LocalIcon name="shopping-bag" className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />
              </div>
              <div>
                <p className="font-semibold text-lg">Your cart is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">Discover products and add them to your cart.</p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="btn-primary mt-1"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 p-2.5 sm:space-y-3 sm:p-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="grid grid-cols-[4rem_minmax(0,1fr)_auto] gap-2 rounded-xl border border-border bg-background p-2 shadow-sm sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:gap-3 sm:rounded-2xl sm:p-3">
                  {/* Image */}
                  <Link href={`/products/${item.slug}`} onClick={closeCart}>
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-secondary sm:h-20 sm:w-20 sm:rounded-xl">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.slug}`} onClick={closeCart}>
                      <p className="line-clamp-2 text-sm font-medium transition-colors min-[1025px]:hover:text-primary">
                        {item.name}
                      </p>
                    </Link>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      {/* Qty */}
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          title="Decrease quantity"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                          className="p-1.5 transition-colors min-[1025px]:hover:bg-secondary"
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
                          className="p-1.5 transition-colors disabled:opacity-40 min-[1025px]:hover:bg-secondary"
                        >
                          <LocalIcon name="plus" className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
                        {item.price !== item.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through">{formatPrice(item.originalPrice * item.quantity)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    title={`Remove ${item.name}`}
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="h-fit rounded-lg p-1.5 text-muted-foreground transition-colors min-[1025px]:hover:bg-destructive/10 min-[1025px]:hover:text-destructive"
                  >
                    <LocalIcon name="trash-2" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="space-y-3 border-t border-border p-4 sm:space-y-4 sm:p-5">
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
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground">
                  Add {formatPrice(freeShippingMin - subtotal)} more for free shipping
                </p>
              )}
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(subtotal + shipping)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-primary flex items-center justify-center gap-2"
              >
                Checkout <LocalIcon name="arrow-right" className="h-4 w-4" />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="btn-outline flex items-center justify-center gap-2"
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
