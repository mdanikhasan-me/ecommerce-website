'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Heart,
  BarChart2,
  Share2,
  Shield,
  Truck,
  RefreshCcw,
  Star,
  Plus,
  Minus,
  Zap,
} from 'lucide-react'
import { useCartStore, useWishlistStore, useCompareStore } from '@/frontend/stores'
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

export function ProductDetailClient({ product }: { product: ProductDetailClientData }) {
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<VariantData | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  const zoomFrameRef = useRef<HTMLDivElement | null>(null)
  const hasTrackedViewRef = useRef(false)

  const { addItem, openCart } = useCartStore()
  const { toggle, has } = useWishlistStore()
  const { add: addCompare, has: hasCompare } = useCompareStore()

  const price = selectedVariant?.salePrice ?? selectedVariant?.price ?? product.salePrice ?? product.basePrice
  const originalPrice = selectedVariant?.price ?? product.basePrice
  const stock = selectedVariant?.stockQuantity ?? product.stockQuantity
  const discount = calculateDiscount(originalPrice, price)
  const { label: stockLabel, color: stockColor, inStock } = getStockStatus(stock)
  const isWished = isHydrated && has(product.id)
  const isCompared = isHydrated && hasCompare(product.id)
  const galleryImages = product.images

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (hasTrackedViewRef.current) return

    hasTrackedViewRef.current = true
    fetch(`/api/products/${product.id}/view`, {
      method: 'POST',
      credentials: 'same-origin',
      keepalive: true,
    }).catch(() => {})
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
    openCart()
  }

  const handleBuyNow = () => {
    if (!inStock) return
    handleAddToCart()
    router.push('/checkout')
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    zoomFrameRef.current?.style.setProperty('--zoom-origin', `${x}% ${y}%`)
  }

  const variantGroups: Record<string, VariantGroupOption[]> = {}
  for (const variant of product.variants) {
    for (const opt of variant.options) {
      if (!variantGroups[opt.name]) variantGroups[opt.name] = []
      variantGroups[opt.name].push({ value: opt.value, variant })
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:items-start md:gap-6 lg:gap-9">
      <div className="flex flex-col gap-2.5 md:sticky md:top-24">
        <div
          ref={zoomFrameRef}
          className="relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-[1.35rem] bg-secondary md:rounded-2xl"
          onMouseEnter={() => {
            zoomFrameRef.current?.style.setProperty('--zoom-origin', '50% 50%')
            setIsZoomed(true)
          }}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          {galleryImages[selectedImage] && (
            <Image
              src={galleryImages[selectedImage].url}
              alt={product.name}
              fill
              priority
              quality={90}
              className={cn('zoom-image object-contain transition-transform duration-300', isZoomed && 'scale-[2]')}
              sizes="(max-width: 1024px) 100vw, 50vw"
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
                  'relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all [scroll-snap-align:start] sm:h-16 sm:w-16',
                  selectedImage === i ? 'border-primary' : 'border-border hover:border-primary/50'
                )}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                  quality={82}
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
                <Star key={s} className={cn('h-4 w-4', s <= Math.round(product.rating) ? 'star-filled' : 'star-empty')} />
              ))}
            </div>
            <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
            <a href="#reviews" className="text-sm text-muted-foreground transition-colors hover:text-primary">
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
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-all sm:px-4 sm:py-2',
                    selectedVariant?.id === variant.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50'
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
                className="p-2.5 transition-colors hover:bg-secondary"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                title="Increase quantity"
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="p-2.5 transition-colors hover:bg-secondary"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className={cn('text-sm font-medium', stockColor)}>{stockLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className="btn-outline flex items-center justify-center gap-2 py-2.5"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!inStock}
            className="btn-primary flex items-center justify-center gap-2 py-2.5"
          >
            <Zap className="h-4 w-4" />
            Buy Now
          </button>
        </div>

        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <button
            type="button"
            onClick={() => {
              const currentlyWished = has(product.id)
              toggle(product.id)
              toast.success(currentlyWished ? 'Removed from wishlist' : 'Added to wishlist')
            }}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all',
              isWished ? 'border-red-200 bg-red-50 text-red-500' : 'border-border hover:border-red-200 hover:text-red-500'
            )}
          >
            <Heart className={cn('h-4 w-4', isWished && 'fill-current')} />
            {isWished ? 'Wishlisted' : 'Wishlist'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (isCompared) {
                router.push('/compare')
                return
              }

              const ok = addCompare(product.id)
              toast[ok ? 'success' : 'error'](ok ? 'Added to compare' : 'Max 4 products')
            }}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all hover:border-primary/50',
              isCompared ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border'
            )}
          >
            <BarChart2 className="h-4 w-4" />
            {isCompared ? 'Open compare' : 'Compare'}
          </button>
          <button
            type="button"
            aria-label="Copy product link"
            title="Copy product link"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              toast.success('Link copied!')
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium transition-all hover:border-primary/50"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2.5 rounded-2xl bg-secondary p-3.5 sm:p-4">
          <div className="flex items-start gap-3 text-sm">
            <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <div>
              <span className="font-medium">Free delivery</span>
              <span className="text-muted-foreground"> on orders over Tk 2,000</span>
              <p className="mt-0.5 text-xs text-muted-foreground">Delivery timing varies by address and availability</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <RefreshCcw className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <div>
              <span className="font-medium">Seven day return policy</span>
              <p className="mt-0.5 text-xs text-muted-foreground">Return eligibility is reviewed against the policy</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
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
              <Link key={t} href={`/search?q=${t}`} className="mr-1 transition-colors hover:text-primary">{t}</Link>
            ))}</>
          )}
        </p>
      </div>

      {product.description && (
        <div className="overflow-hidden rounded-2xl border border-border md:col-span-2">
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
