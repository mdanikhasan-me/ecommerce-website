'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { useCartStore } from '@/frontend/stores/cart'
import { useCompareStore } from '@/frontend/stores/compare'
import { useWishlistStore } from '@/frontend/stores/wishlist'
import { formatPrice, calculateDiscount, getStockStatus, cn } from '@/backend/utils'
import type { ProductDetailData, VariantData } from '@/backend/types'
import toast from 'react-hot-toast'

type ProductDetailClientData = Omit<ProductDetailData, 'attributes' | 'specifications' | 'reviews'> & {
  attributes: Array<{ id?: string; name: string; value: string }>
  specifications: Array<{ group?: string | null; name: string; value: string; sortOrder?: number }>
}

type VariantGroupOption = {
  value: string
  variant: VariantData
}

const VIEW_TRACKING_STORAGE_KEY = 'boilabin_viewed_products_v1'
const VIEW_TRACKING_TTL_MS = 7 * 24 * 60 * 60 * 1000
const MAX_STORED_PRODUCT_VIEWS = 120

function getStoredProductViews(now: number) {
  try {
    const raw = window.localStorage.getItem(VIEW_TRACKING_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, value]) => typeof value === 'number' && now - value < VIEW_TRACKING_TTL_MS)
        .sort(([, a], [, b]) => Number(b) - Number(a))
        .slice(0, MAX_STORED_PRODUCT_VIEWS),
    ) as Record<string, number>
  } catch {
    return {}
  }
}

function hasRecentProductView(productId: string) {
  const now = Date.now()
  const views = getStoredProductViews(now)
  return Boolean(views[productId])
}

function markProductView(productId: string) {
  try {
    const now = Date.now()
    const views = getStoredProductViews(now)
    views[productId] = now
    window.localStorage.setItem(VIEW_TRACKING_STORAGE_KEY, JSON.stringify(views))
  } catch {
    // View tracking is non-critical and should never affect product browsing.
  }
}

async function copyTextToClipboard(text: string) {
  if (!text) return false

  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall back to the legacy copy path below.
  }

  const textarea = document.createElement('textarea')

  try {
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '0'
    textarea.style.top = '0'
    textarea.style.opacity = '0'
    textarea.style.pointerEvents = 'none'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length)

    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}

export function ProductDetailClient({ product }: { product: ProductDetailClientData }) {
  const router = useRouter()
  const { status: sessionStatus } = useSession()
  const [isHydrated, setIsHydrated] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<VariantData | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  const zoomFrameRef = useRef<HTMLDivElement | null>(null)
  const zoomOriginFrameRef = useRef<number | null>(null)
  const pendingZoomOriginRef = useRef<string | null>(null)
  const hasTrackedViewRef = useRef(false)

  const { addItem } = useCartStore()
  const { toggle, has } = useWishlistStore()
  const { add: addCompare, has: hasCompare } = useCompareStore()

  const price = selectedVariant?.salePrice ?? selectedVariant?.price ?? product.salePrice ?? product.basePrice
  const originalPrice = selectedVariant?.price ?? product.basePrice
  const stock = selectedVariant?.stockQuantity ?? product.stockQuantity
  const discount = calculateDiscount(originalPrice, price)
  const isPreOrder = product.isPreOrder ?? false
  const { label: stockLabel, color: stockColor, inStock } = getStockStatus(stock, isPreOrder)
  const isWished = isHydrated && has(product.id)
  const isCompared = sessionStatus === 'authenticated' && isHydrated && hasCompare(product.id)
  const galleryImages = product.images

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    return () => {
      if (zoomOriginFrameRef.current !== null) {
        window.cancelAnimationFrame(zoomOriginFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (hasTrackedViewRef.current) return
    if (hasRecentProductView(product.id)) return

    hasTrackedViewRef.current = true
    fetch(`/api/products/${product.id}/view`, {
      method: 'POST',
      credentials: 'same-origin',
      keepalive: true,
    })
      .then(() => markProductView(product.id))
      .catch(() => {
        hasTrackedViewRef.current = false
      })
  }, [product.id])

  useEffect(() => {
    if (!selectedVariant && product.variants.length > 0) {
      setSelectedVariant(product.variants[0])
    }
  }, [product.variants, selectedVariant])

  useEffect(() => {
    setQuantity((current) => Math.max(1, Math.min(current, Math.max(stock, 1))))
  }, [stock])

  const handleAddToCart = () => {
    if (!inStock) return

    addItem({
      id: product.id + (selectedVariant?.id ?? ''),
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      slug: product.slug,
      price,
      originalPrice,
      image: galleryImages[selectedImage]?.url ?? galleryImages[0]?.url ?? '',
      stockQuantity: stock,
      sku: selectedVariant?.sku ?? product.sku,
      variantName: selectedVariant?.name,
      quantity,
    })

    toast.success(`${product.name} added to cart!`)
  }

  const handleBuyNow = () => {
    if (!inStock) return
    handleAddToCart()
    router.push('/checkout')
  }

  const handleShare = async () => {
    const url = window.location.href

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: product.name,
          text: product.shortDescription?.trim() || product.name,
          url,
        })
        return
      }

      if (await copyTextToClipboard(url)) {
        toast.success('Link copied!')
        return
      }

      toast.error('Sharing is not available on this browser')
    } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        return
      }

      if (await copyTextToClipboard(url)) {
        toast.success('Link copied!')
        return
      }

      toast.error('Could not share this product')
    }
  }

  const requireCompareSignIn = () => {
    toast.error('Please sign in before comparing products')
    const callbackUrl = typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`
      : `/products/${product.slug}`
    router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    pendingZoomOriginRef.current = `${x}% ${y}%`

    if (zoomOriginFrameRef.current !== null) return

    zoomOriginFrameRef.current = window.requestAnimationFrame(() => {
      if (pendingZoomOriginRef.current) {
        zoomFrameRef.current?.style.setProperty('--zoom-origin', pendingZoomOriginRef.current)
      }
      pendingZoomOriginRef.current = null
      zoomOriginFrameRef.current = null
    })
  }

  const handleMouseLeave = () => {
    setIsZoomed(false)
    pendingZoomOriginRef.current = null
    if (zoomOriginFrameRef.current !== null) {
      window.cancelAnimationFrame(zoomOriginFrameRef.current)
      zoomOriginFrameRef.current = null
    }
  }

  const variantGroups: Record<string, VariantGroupOption[]> = {}
  for (const variant of product.variants) {
    for (const opt of variant.options) {
      if (!variantGroups[opt.name]) variantGroups[opt.name] = []
      variantGroups[opt.name].push({ value: opt.value, variant })
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(26rem,0.92fr)_minmax(30rem,1.08fr)] xl:items-start xl:gap-9">
      <div className="mx-auto flex w-full max-w-[42rem] flex-col gap-2.5 xl:mx-0 xl:max-w-none">
        <div
          ref={zoomFrameRef}
          className="relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[1.35rem] bg-secondary md:rounded-2xl"
          onMouseEnter={() => {
            zoomFrameRef.current?.style.setProperty('--zoom-origin', '50% 50%')
            setIsZoomed(true)
          }}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          {galleryImages[selectedImage] && (
            <Image
              src={galleryImages[selectedImage].url}
              alt={product.name}
              fill
              priority
              quality={90}
              className={cn('zoom-image object-contain', isZoomed && 'scale-[2]')}
              sizes="(max-width: 1279px) 100vw, 50vw"
            />
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {discount > 0 && <span className="badge-sale px-2 py-0.5 text-[11px] sm:px-2.5 sm:py-1 sm:text-xs">{discount}% off</span>}
            {product.isNew && <span className="badge-new px-2 py-0.5 text-[11px] sm:px-2.5 sm:py-1 sm:text-xs">New</span>}
            {product.isBestSeller && <span className="badge-bestseller px-2 py-0.5 text-[11px] sm:px-2.5 sm:py-1 sm:text-xs">Best Seller</span>}
          </div>
        </div>

        {galleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 [scroll-snap-type:x_mandatory]">
            {galleryImages.map((img, i) => (
              <button
                type="button"
                key={i}
                aria-label={`View image ${i + 1}`}
                title={`View image ${i + 1}`}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  'relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors [scroll-snap-align:start] sm:h-16 sm:w-16',
                  selectedImage === i ? 'border-primary' : 'border-border md:hover:border-primary/50'
                )}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                  quality={75}
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 md:rounded-[1.35rem] md:border md:border-border/80 md:bg-card/80 md:p-4 md:shadow-[0_12px_30px_rgba(23,18,15,0.035)] lg:p-5">
        <div>
          <h1 className="font-display text-[1.72rem] font-bold leading-[1.08] sm:text-2xl lg:text-3xl">
            {product.name}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <LocalIcon
                  key={s}
                  name={s <= Math.round(product.rating) ? 'star-filled' : 'star'}
                  className={cn('h-4 w-4', s <= Math.round(product.rating) ? 'star-filled' : 'star-empty')}
                />
              ))}
            </div>
            <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
            <a href="#reviews" className="text-sm text-muted-foreground transition-colors md:hover:text-primary">
              {product.reviewCount > 0 ? `${product.reviewCount} reviews` : 'No reviews yet'}
            </a>
            {product.soldCount > 0 && (
              <span className="text-sm text-muted-foreground">{product.soldCount} sold</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-border py-3.5">
          <span className="whitespace-nowrap font-display text-[1.9rem] font-bold leading-none sm:text-3xl">{formatPrice(price)}</span>
          {discount > 0 && (
            <>
              <span className="whitespace-nowrap text-base text-muted-foreground line-through sm:text-lg">{formatPrice(originalPrice)}</span>
              <span className="badge-sale px-2.5 py-1 text-xs sm:text-sm">Save {formatPrice(originalPrice - price)}</span>
            </>
          )}
        </div>

        {product.shortDescription && (
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{product.shortDescription}</p>
        )}

        {Object.entries(variantGroups).map(([groupName, opts]) => (
          <div key={groupName}>
            <p className="mb-2 text-sm font-semibold">
              {groupName}:
              {selectedVariant && (
                <span className="ml-1 font-normal text-muted-foreground">
                  {selectedVariant.options.find((o) => o.name === groupName)?.value}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {opts.map(({ value, variant }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setSelectedVariant(variant)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2',
                    selectedVariant?.id === variant.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border md:hover:border-primary/50'
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-2 text-sm font-semibold">Quantity</p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center overflow-hidden rounded-xl border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                title="Decrease quantity"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2.5 transition-colors md:hover:bg-secondary"
              >
                <LocalIcon name="minus" className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                title="Increase quantity"
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="p-2.5 transition-colors md:hover:bg-secondary"
              >
                <LocalIcon name="plus" className="h-4 w-4" />
              </button>
            </div>
            <span className={cn('text-sm font-medium', stockColor)}>{stockLabel}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className="store-add-to-cart-button flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-foreground/18 bg-transparent text-[15px] font-semibold text-foreground md:transition-colors md:hover:border-foreground/32 md:hover:bg-secondary/55 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LocalIcon name="shopping-cart" className="h-[18px] w-[18px]" />
            {isPreOrder ? 'Pre-order' : 'Add to Cart'}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!inStock}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-[15px] font-semibold text-background transition-colors md:hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPreOrder ? 'Pre-order Now' : 'Buy Now'}
            <LocalIcon name="arrow-right" className="h-[18px] w-[18px]" />
          </button>

          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => {
                const currentlyWished = has(product.id)
                toggle(product.id)
                toast.success(currentlyWished ? 'Removed from wishlist' : 'Added to wishlist')
              }}
              className={cn(
                'flex h-11 items-center justify-center gap-1.5 rounded-xl border text-[13px] font-medium transition-colors',
                isWished ? 'border-red-200 bg-red-50 text-red-500' : 'border-border md:hover:border-red-200 md:hover:text-red-500'
              )}
            >
              <LocalIcon name={isWished ? 'heart-filled' : 'heart'} className="h-4 w-4" />
              {isWished ? 'Saved' : 'Wishlist'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (sessionStatus !== 'authenticated') {
                  requireCompareSignIn()
                  return
                }

                if (isCompared) {
                  router.push('/compare')
                  return
                }

                const ok = addCompare(product.id)
                toast[ok ? 'success' : 'error'](ok ? 'Added to compare' : 'Max 4 products')
              }}
              className={cn(
                'flex h-11 items-center justify-center gap-1.5 rounded-xl border text-[13px] font-medium transition-colors md:hover:border-primary/50',
                isCompared ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border'
              )}
            >
              <LocalIcon name="bar-chart-2" className="h-4 w-4" />
              {isCompared ? 'Compared' : 'Compare'}
            </button>
            <button
              type="button"
              aria-label="Share product"
              title="Share product"
              onClick={handleShare}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border text-[13px] font-medium transition-colors md:hover:border-primary/50"
            >
              <LocalIcon name="share" className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        <div className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-secondary/40">
          <div className="flex items-start gap-3 p-3 text-sm sm:p-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-[0_1px_2px_rgba(23,18,15,0.05)]">
              <LocalIcon name="truck" className="h-4 w-4" />
            </span>
            <div>
              <span className="font-medium">Free delivery</span>
              <span className="text-muted-foreground"> on orders over Tk 2,000</span>
              <p className="mt-0.5 text-xs text-muted-foreground">Delivery timing varies by address and availability</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 text-sm sm:p-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-[0_1px_2px_rgba(23,18,15,0.05)]">
              <LocalIcon name="refresh-ccw" className="h-4 w-4" />
            </span>
            <div>
              <span className="font-medium">Seven day return policy</span>
              <p className="mt-0.5 text-xs text-muted-foreground">Return eligibility is reviewed against the policy</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 text-sm sm:p-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-[0_1px_2px_rgba(23,18,15,0.05)]">
              <LocalIcon name="credit-card" className="h-4 w-4" />
            </span>
            <div>
              <span className="font-medium">Checkout and payment</span>
              <p className="mt-0.5 text-xs text-muted-foreground">Cash on delivery is available for eligible orders.</p>
            </div>
          </div>
        </div>

        {product.attributes.length > 0 && (
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
            {product.attributes.map((attr) => (
              <div key={attr.id ?? `${attr.name}-${attr.value}`} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{attr.name}:</span>
                <span className="font-medium">{attr.value}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          SKU: <span className="font-mono">{product.sku}</span>
          {product.tags.length > 0 && (
            <> Tags: {product.tags.map((t: string) => (
              <Link key={t} href={`/search?q=${t}`} className="mr-1 transition-colors md:hover:text-primary">{t}</Link>
            ))}</>
          )}
        </p>
      </div>

      {product.description && (
        <div className="overflow-hidden rounded-2xl border border-border xl:col-span-2">
          <div className="border-b border-border bg-secondary px-4 py-3 sm:px-6 sm:py-4">
            <h3 className="font-display text-lg font-semibold">Product Description</h3>
          </div>
          <div className="prose prose-sm max-w-none px-4 py-4 leading-relaxed text-muted-foreground sm:px-6 sm:py-5">
            {product.description.split('\n').map((line: string, i: number) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
