'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart, Heart, BarChart2, Share2, Shield, Truck,
  RefreshCcw, Star, Plus, Minus, Check, Store, Zap
} from 'lucide-react'
import { useCartStore, useWishlistStore, useCompareStore } from '@/frontend/stores'
import { formatPrice, calculateDiscount, getStockStatus, cn } from '@/backend/utils'
import toast from 'react-hot-toast'

export function ProductDetailClient({ product }: { product: any }) {
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

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
    handleAddToCart()
    router.push('/checkout')
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  // Group variant options by name
  const variantGroups: Record<string, { value: string; variant: any }[]> = {}
  for (const variant of product.variants) {
    for (const opt of variant.options) {
      if (!variantGroups[opt.name]) variantGroups[opt.name] = []
      variantGroups[opt.name].push({ value: opt.value, variant })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* ─── Gallery ──────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Main Image */}
        <div
          className="relative aspect-square rounded-2xl overflow-hidden bg-secondary cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
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
              className="object-contain transition-transform duration-300"
              style={isZoomed ? {
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                transform: 'scale(2)',
              } : {}}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && <span className="badge-sale">{discount}% off</span>}
            {product.isNew && <span className="badge-new">New</span>}
            {product.isBestSeller && <span className="badge-bestseller">Best Seller</span>}
          </div>
        </div>

        {/* Thumbnails */}
        {galleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {galleryImages.map((img: any, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  'flex-shrink-0 relative h-16 w-16 rounded-xl overflow-hidden border-2 transition-all',
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

      {/* ─── Info ─────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div>
          {product.brand && (
            <Link href={`/brands/${product.brand.slug}`} className="text-sm text-primary font-semibold hover:underline">
              {product.brand.name}
            </Link>
          )}
          <h1 className="font-display text-2xl md:text-3xl font-bold mt-1 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={cn('h-4 w-4', s <= Math.round(product.rating) ? 'star-filled' : 'star-empty')} />
              ))}
            </div>
            <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
            <a href="#reviews" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {product.reviewCount} reviews
            </a>
            <span className="text-sm text-muted-foreground">• {product.soldCount} sold</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3 py-4 border-y border-border">
          <span className="font-display text-3xl font-bold">{formatPrice(price)}</span>
          {discount > 0 && (
            <>
              <span className="text-lg text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
              <span className="badge-sale text-sm px-2.5 py-1">Save {formatPrice(originalPrice - price)}</span>
            </>
          )}
        </div>

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-muted-foreground leading-relaxed">{product.shortDescription}</p>
        )}

        {/* Variants */}
        {Object.entries(variantGroups).map(([groupName, opts]) => (
          <div key={groupName}>
            <p className="text-sm font-semibold mb-2">
              {groupName}:
              {selectedVariant && (
                <span className="font-normal text-muted-foreground ml-1">
                  {selectedVariant.options.find((o: any) => o.name === groupName)?.value}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {opts.map(({ value, variant }) => (
                <button
                  key={value}
                  onClick={() => setSelectedVariant(variant)}
                  className={cn(
                    'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
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

        {/* Quantity */}
        <div>
          <p className="text-sm font-semibold mb-2">Quantity</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2.5 hover:bg-secondary transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="p-2.5 hover:bg-secondary transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className={cn('text-sm font-medium', stockColor)}>{stockLabel}</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="flex-1 btn-outline flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!inStock}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Buy Now
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              const currentlyWished = has(product.id)
              toggle(product.id)
              toast.success(currentlyWished ? 'Removed from wishlist' : 'Added to wishlist')
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
              isWished ? 'border-red-200 text-red-500 bg-red-50' : 'border-border hover:border-red-200 hover:text-red-500'
            )}
          >
            <Heart className={cn('h-4 w-4', isWished && 'fill-current')} />
            {isWished ? 'Wishlisted' : 'Wishlist'}
          </button>
          <button
            onClick={() => {
              if (isCompared) {
                router.push('/compare')
                return
              }

              const ok = addCompare(product.id)
              toast[ok ? 'success' : 'error'](ok ? 'Added to compare' : 'Max 4 products')
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:border-primary/50',
              isCompared ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border'
            )}
          >
            <BarChart2 className="h-4 w-4" />
            {isCompared ? 'Open compare' : 'Compare'}
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:border-primary/50 transition-all ml-auto"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Delivery & Trust */}
        <div className="bg-secondary rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <Truck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Free delivery</span>
              <span className="text-muted-foreground"> on orders over ৳2,000</span>
              <p className="text-muted-foreground text-xs mt-0.5">Estimated 1–3 business days</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <RefreshCcw className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">7-day return policy</span>
              <p className="text-muted-foreground text-xs mt-0.5">Easy returns and refunds</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Secure checkout</span>
              <p className="text-muted-foreground text-xs mt-0.5">bKash • Nagad • COD • Cards</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Store className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Sold directly by </span>
              <span className="font-semibold text-foreground">
                {product.seller?.storeName || 'Boilabin Official Store'}
              </span>
              <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                <Check className="h-2.5 w-2.5" /> Official Store
              </span>
            </div>
          </div>
        </div>

        {/* Attributes */}
        {product.attributes.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {product.attributes.map((attr: any) => (
              <div key={attr.id} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{attr.name}:</span>
                <span className="font-medium">{attr.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* SKU */}
        <p className="text-xs text-muted-foreground">
          SKU: <span className="font-mono">{product.sku}</span>
          {product.tags.length > 0 && (
            <> · Tags: {product.tags.map((t: string) => (
              <Link key={t} href={`/search?q=${t}`} className="hover:text-primary transition-colors mr-1">{t}</Link>
            ))}</>
          )}
        </p>
      </div>

      {/* Description (full width) */}
      {product.description && (
        <div className="lg:col-span-2 border border-border rounded-2xl overflow-hidden">
          <div className="bg-secondary px-6 py-4 border-b border-border">
            <h3 className="font-display font-semibold text-lg">Product Description</h3>
          </div>
          <div className="px-6 py-5 prose prose-sm max-w-none text-muted-foreground leading-relaxed">
            {product.description.split('\n').map((line: string, i: number) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
