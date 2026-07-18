'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { useCartStore } from '@/frontend/stores/cart'
import { useCompareStore } from '@/frontend/stores/compare'
import { useWishlistStore } from '@/frontend/stores/wishlist'
import { formatPrice, calculateDiscount, getStockStatus, cn } from '@/backend/utils'
import type { ProductDetailData, VariantData } from '@/backend/types'
import toast from '@/frontend/lib/toast'
import { useClientSession } from '@/frontend/hooks/useClientSession'
import { ProductRichContent } from './ProductRichContent'

type ProductDetailClientData = Omit<
  ProductDetailData,
  'attributes' | 'specifications' | 'reviews' | 'images'
> & {
  images: Array<{ url: string; alt?: string | null; isPrimary: boolean; sortOrder?: number }>
  attributes: Array<{ id?: string; name: string; value: string }>
  specifications: Array<{ group?: string | null; name: string; value: string; sortOrder?: number }>
  faqs: Array<{ question: string; answer: string; sortOrder?: number }>
  descriptionImages: Array<{ url: string; alt: string; sortOrder?: number }>
}

type VariantGroupOption = {
  value: string
}

const VIEW_TRACKING_STORAGE_KEY = 'boilabin_viewed_products_v1'
const VIEW_TRACKING_TTL_MS = 7 * 24 * 60 * 60 * 1000
const MAX_STORED_PRODUCT_VIEWS = 120
const STARS = [1, 2, 3, 4, 5]

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

function compactVariantLabel(value: string) {
  return value
    .replace(/\s+RAM\s*\/\s*/i, '/')
    .replace(/\s+Storage/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function ProductStars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {STARS.map((star) => (
        <LocalIcon
          key={star}
          name={star <= Math.round(rating) ? 'star-filled' : 'star'}
          className={cn('h-4 w-4', star <= Math.round(rating) ? 'star-filled' : 'star-empty')}
        />
      ))}
    </div>
  )
}

export function ProductDetailClient({ product }: { product: ProductDetailClientData }) {
  const router = useRouter()
  const { status: sessionStatus } = useClientSession()
  const galleryTouchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<VariantData | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const hasGallery = product.images.length > 0

  const addItem = useCartStore((state) => state.addItem)
  const toggle = useWishlistStore((state) => state.toggle)
  const has = useWishlistStore((state) => state.has)
  const addCompare = useCompareStore((state) => state.add)
  const hasCompare = useCompareStore((state) => state.has)

  const price = selectedVariant?.salePrice ?? selectedVariant?.price ?? product.salePrice ?? product.basePrice
  const originalPrice = selectedVariant?.price ?? product.basePrice
  const stock = selectedVariant?.stockQuantity ?? product.stockQuantity
  const discount = calculateDiscount(originalPrice, price)
  const isPreOrder = product.isPreOrder ?? false
  const { label: stockLabel, color: stockColor, inStock } = getStockStatus(stock, isPreOrder)
  const isWished = isHydrated && has(product.id)
  const isCompared = sessionStatus === 'authenticated' && isHydrated && hasCompare(product.id)
  const galleryImages = product.images
  const activeImage = galleryImages[selectedImage] ?? galleryImages[0]
  const selectedImageUrl = activeImage?.url ?? ''
  const savings = Math.max(originalPrice - price, 0)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (hasTrackedViewRef(product.id)) return

    fetch(`/api/products/${product.id}/view`, {
      method: 'POST',
      credentials: 'same-origin',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrer: document.referrer || null,
        landingUrl: window.location.href,
      }),
    })
      .then(() => markProductView(product.id))
      .catch(() => {
        clearProductViewAttempt(product.id)
      })
  }, [product.id])

  useEffect(() => {
    const firstVariant = product.variants[0] ?? null
    setSelectedVariant(firstVariant)
    setSelectedOptions(Object.fromEntries(firstVariant?.options.map((option) => [option.name, option.value]) ?? []))
  }, [product.id, product.variants])

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
      image: selectedImageUrl,
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
          text: product.name,
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

  const handleWishlist = () => {
    const currentlyWished = has(product.id)
    toggle(product.id)
    toast.success(currentlyWished ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleCompare = () => {
    if (sessionStatus !== 'authenticated') {
      toast.error('Please sign in before comparing products')
      const callbackUrl = typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : `/products/${product.slug}`
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
      return
    }

    if (isCompared) {
      router.push('/compare')
      return
    }

    const ok = addCompare(product.id)
    toast[ok ? 'success' : 'error'](ok ? 'Added to compare' : 'Max 4 products')
  }

  const handleGalleryTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (galleryImages.length <= 1) return

    const touch = event.touches[0]
    galleryTouchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleGalleryTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (galleryImages.length <= 1 || !galleryTouchStartRef.current) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - galleryTouchStartRef.current.x
    const deltaY = touch.clientY - galleryTouchStartRef.current.y
    galleryTouchStartRef.current = null

    const horizontalDistance = Math.abs(deltaX)
    const verticalDistance = Math.abs(deltaY)
    if (horizontalDistance < 44 || horizontalDistance < verticalDistance * 1.15) return

    setSelectedImage((current) => {
      const lastIndex = galleryImages.length - 1
      return deltaX < 0
        ? current >= lastIndex ? 0 : current + 1
        : current <= 0 ? lastIndex : current - 1
    })
  }

  const variantGroups: Record<string, VariantGroupOption[]> = {}
  for (const variant of product.variants) {
    for (const opt of variant.options) {
      if (!variantGroups[opt.name]) variantGroups[opt.name] = []
      if (!variantGroups[opt.name].some((entry) => entry.value === opt.value)) {
        variantGroups[opt.name].push({ value: opt.value })
      }
    }
  }

  const selectVariantOption = (groupName: string, value: string) => {
    const nextOptions = { ...selectedOptions, [groupName]: value }
    const matchingVariant = product.variants.find((variant) => (
      Object.entries(nextOptions).every(([name, selectedValue]) => (
        variant.options.some((option) => option.name === name && option.value === selectedValue)
      ))
    )) ?? product.variants.find((variant) => (
      variant.options.some((option) => option.name === groupName && option.value === value)
    ))

    if (matchingVariant) {
      setSelectedVariant(matchingVariant)
      setSelectedOptions(Object.fromEntries(matchingVariant.options.map((option) => [option.name, option.value])))
      return
    }

    setSelectedOptions(nextOptions)
  }

  const isVariantOptionAvailable = (groupName: string, value: string) => product.variants.some((variant) => (
    variant.options.some((option) => option.name === groupName && option.value === value) &&
    Object.entries(selectedOptions).every(([name, selectedValue]) => (
      name === groupName || variant.options.some((option) => option.name === name && option.value === selectedValue)
    ))
  ))

  const specificationGroups: Array<{
    name: string | null
    items: ProductDetailClientData['specifications']
  }> = []
  for (const specification of product.specifications) {
    const groupName = specification.group?.trim() || null
    let group = specificationGroups.find((entry) => entry.name === groupName)
    if (!group) {
      group = { name: groupName, items: [] }
      specificationGroups.push(group)
    }
    group.items.push(specification)
  }

  const renderActionButtons = (compact = false) => (
    <div className={cn('grid gap-2', compact ? 'grid-cols-2' : 'grid-cols-1 min-[1160px]:grid-cols-2')}>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!inStock}
        className={cn(
          'store-add-to-cart-button flex items-center justify-center gap-2 rounded-xl border border-foreground/25 bg-background font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50',
          compact ? 'h-12 text-sm' : 'h-12 text-[15px] min-[1025px]:hover:border-foreground/40',
        )}
      >
        <LocalIcon name="shopping-bag" className="h-[18px] w-[18px]" />
        {isPreOrder ? 'Pre-order' : 'Add to Cart'}
      </button>
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={!inStock}
        className={cn(
          'flex items-center justify-center gap-2 rounded-xl bg-foreground font-semibold text-background disabled:cursor-not-allowed disabled:opacity-50',
          compact ? 'h-12 text-sm' : 'h-12 text-[15px] min-[1025px]:hover:bg-foreground/90',
        )}
      >
        {isPreOrder ? 'Pre-order Now' : 'Buy Now'}
        {!compact && <LocalIcon name="arrow-right" className="h-[18px] w-[18px]" />}
      </button>
    </div>
  )

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden pb-3 md:overflow-visible md:pb-0">
      <div className="grid min-w-0 gap-5 min-[980px]:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] min-[1280px]:gap-7">
        <section className="min-w-0 rounded-[1.35rem] bg-background">
          <div
            className={cn(
              'grid gap-3 rounded-[1.35rem] border border-border/70 bg-background p-2.5 sm:p-3 min-[768px]:p-4',
              galleryImages.length > 1 && 'min-[768px]:grid-cols-[5.4rem_minmax(0,1fr)]',
            )}
          >
            {galleryImages.length > 1 && (
              <div className="hidden min-[768px]:flex min-[768px]:flex-col min-[768px]:gap-3">
                {galleryImages.map((img, index) => (
                  <button
                    type="button"
                    key={img.url}
                    aria-label={`View image ${index + 1}`}
                    title={`View image ${index + 1}`}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'relative aspect-square overflow-hidden rounded-xl border bg-background',
                      selectedImage === index ? 'border-foreground' : 'border-border/65',
                    )}
                  >
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      className="object-contain p-1"
                      quality={75}
                      sizes="86px"
                    />
                  </button>
                ))}
              </div>
            )}

            <div
              className="relative flex aspect-[3/2] w-full touch-pan-y items-center justify-center overflow-hidden rounded-[1.15rem] bg-secondary/25"
              onTouchStart={handleGalleryTouchStart}
              onTouchEnd={handleGalleryTouchEnd}
              onTouchCancel={() => {
                galleryTouchStartRef.current = null
              }}
            >
              {hasGallery && activeImage ? (
                <Image
                  src={activeImage.url}
                  alt={activeImage.alt || product.name}
                  fill
                  priority
                  quality={90}
                  className="object-contain p-3 sm:p-5 min-[768px]:p-7"
                  sizes="(max-width: 767px) 100vw, (max-width: 979px) 80vw, 50vw"
                />
              ) : (
                <div className="text-sm text-muted-foreground">No product image</div>
              )}

              <div className="absolute left-3 top-3 flex flex-col gap-1.5 min-[768px]:hidden">
                {discount > 0 && <span className="badge-sale px-2 py-0.5 text-[11px]">{discount}% off</span>}
                {product.isNew && <span className="badge-new px-2 py-0.5 text-[11px]">New</span>}
                {product.isBestSeller && <span className="badge-bestseller px-2 py-0.5 text-[11px]">Best Seller</span>}
              </div>

              {selectedImageUrl && (
                <a
                  href={selectedImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open product image"
                  title="Open product image"
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background text-foreground min-[1025px]:hover:border-foreground/35"
                >
                  <LocalIcon name="eye" className="h-4 w-4" />
                </a>
              )}

              {galleryImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 min-[768px]:hidden">
                  {galleryImages.map((img, index) => (
                    <button
                      type="button"
                      key={`dot-${img.url}`}
                      aria-label={`View image ${index + 1}`}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        'h-2 w-2 rounded-full border border-background',
                        selectedImage === index ? 'bg-foreground' : 'bg-border',
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {galleryImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scroll-snap-type:x_mandatory] min-[768px]:hidden">
              {galleryImages.map((img, index) => (
                <button
                  type="button"
                  key={`mobile-${img.url}`}
                  aria-label={`View image ${index + 1}`}
                  title={`View image ${index + 1}`}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    'relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-background [scroll-snap-align:start]',
                    selectedImage === index ? 'border-foreground' : 'border-border/65',
                  )}
                >
                  <Image src={img.url} alt="" fill className="object-contain p-1" quality={75} sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="min-w-0 overflow-hidden rounded-[1.35rem] border border-border/70 bg-background p-4 sm:p-5 min-[1280px]:p-6">
          <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-[1.9rem] font-bold leading-[1.08] sm:text-3xl min-[1280px]:text-[2rem]">
                {product.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <ProductStars rating={product.rating} />
                <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                <a href="#reviews" className="text-sm text-muted-foreground min-[1025px]:hover:text-foreground">
                  {product.reviewCount > 0 ? `${product.reviewCount} reviews` : 'No reviews yet'}
                </a>
                {product.soldCount > 0 && (
                  <span className="text-sm text-muted-foreground">{product.soldCount} sold</span>
                )}
              </div>
            </div>

            {discount > 0 && (
              <span className="badge-sale hidden shrink-0 px-3 py-1.5 text-xs font-bold uppercase sm:inline-flex">
                {discount}% off
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-border py-3.5">
            <span className="whitespace-nowrap font-display text-[2rem] font-bold leading-none sm:text-3xl">
              {formatPrice(price)}
            </span>
            {discount > 0 && (
              <>
                <span className="whitespace-nowrap text-base text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </span>
                <span className="badge-sale px-2.5 py-1 text-xs">Save {formatPrice(savings)}</span>
              </>
            )}
          </div>

          {Object.entries(variantGroups).map(([groupName, opts]) => (
            <div key={groupName}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="font-semibold">
                  {groupName}:
                  {selectedOptions[groupName] && (
                    <span className="ml-1 font-normal text-muted-foreground">
                      {selectedOptions[groupName]}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex max-w-full flex-wrap gap-2">
                {opts.map(({ value }) => {
                  const available = isVariantOptionAvailable(groupName, value)
                  return (
                  <button
                    type="button"
                    key={`${groupName}-${value}`}
                    onClick={() => selectVariantOption(groupName, value)}
                    disabled={!available}
                    aria-pressed={selectedOptions[groupName] === value}
                    className={cn(
                      'min-h-10 rounded-lg border px-3 py-2 text-sm font-semibold leading-tight disabled:cursor-not-allowed disabled:opacity-40 sm:px-4',
                      selectedOptions[groupName] === value
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background text-foreground min-[1025px]:hover:border-foreground/35',
                    )}
                  >
                    <span className="sm:hidden">{compactVariantLabel(value)}</span>
                    <span className="hidden sm:inline">{value}</span>
                  </button>
                )})}
              </div>
            </div>
          ))}

          <div>
            <p className="mb-2 text-sm font-semibold">Quantity</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 items-center overflow-hidden rounded-xl border border-border bg-background">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  title="Decrease quantity"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-full w-11 items-center justify-center min-[1025px]:hover:bg-secondary"
                >
                  <LocalIcon name="minus" className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  title="Increase quantity"
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  className="flex h-full w-11 items-center justify-center min-[1025px]:hover:bg-secondary"
                >
                  <LocalIcon name="plus" className="h-4 w-4" />
                </button>
              </div>
              <span className={cn('text-sm font-semibold', stockColor)}>{stockLabel}</span>
            </div>
          </div>

          <div className="hidden md:block">{renderActionButtons()}</div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleWishlist}
              className={cn(
                'flex h-11 items-center justify-center gap-1.5 rounded-xl border text-[13px] font-medium',
                isWished
                  ? 'border-red-200 bg-red-50 text-red-500'
                  : 'border-border bg-background min-[1025px]:hover:border-red-200 min-[1025px]:hover:text-red-500',
              )}
            >
              <LocalIcon name={isWished ? 'bookmark-check' : 'bookmark-plus'} className="h-4 w-4" />
              {isWished ? 'Saved' : 'Wishlist'}
            </button>
            <button
              type="button"
              onClick={handleCompare}
              className={cn(
                'hidden h-11 items-center justify-center gap-1.5 rounded-xl border text-[13px] font-medium sm:flex',
                isCompared
                  ? 'border-primary/30 bg-primary/5 text-primary'
                  : 'border-border bg-background min-[1025px]:hover:border-foreground/35',
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
              className="col-span-2 flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-background text-[13px] font-medium sm:col-span-1 min-[1025px]:hover:border-foreground/35"
            >
              <LocalIcon name="share" className="h-4 w-4" />
              Share
            </button>
          </div>

          {product.attributes.length > 0 && (
            <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-sm">
              {product.attributes.slice(0, 6).map((attr) => (
                <div key={attr.id ?? `${attr.name}-${attr.value}`} className="min-w-0 break-words">
                  <span className="text-muted-foreground">{attr.name}: </span>
                  <span className="font-semibold">{attr.value}</span>
                </div>
              ))}
            </div>
          )}

          <p className="break-words text-xs leading-relaxed text-muted-foreground">
            SKU: <span className="font-mono">{selectedVariant?.sku ?? product.sku}</span>
          </p>
          </div>
        </section>
      </div>

      <div className="mt-5 min-w-0 space-y-5">
        {product.specifications.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-border bg-background">
            <div className="border-b border-border px-4 py-4 sm:px-6">
              <h2 className="font-display text-xl font-bold tracking-tight">Specifications</h2>
            </div>
            <div>
              {specificationGroups.map((group, groupIndex) => (
                <div key={group.name ?? `general-${groupIndex}`}>
                  {group.name && (
                    <h3 className="border-b border-border bg-secondary/45 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:px-6">
                      {group.name}
                    </h3>
                  )}
                  <div className="divide-y divide-border">
                    {group.items.map((specification, index) => (
                      <div
                        key={`${specification.name}-${index}`}
                        className="grid grid-cols-[minmax(7rem,0.38fr)_minmax(0,1fr)] gap-4 px-4 py-3 text-sm sm:px-6 sm:py-3.5"
                      >
                        <span className="font-medium text-muted-foreground">{specification.name}</span>
                        <span className="min-w-0 break-words font-semibold text-foreground">{specification.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {product.description && (
          <section className="overflow-hidden rounded-2xl border border-border bg-background">
            <div className="border-b border-border px-4 py-4 sm:px-6">
              <h2 className="font-display text-xl font-bold tracking-tight">Product description</h2>
            </div>
            <div className="px-4 py-5 sm:px-6 sm:py-6">
              <ProductRichContent content={product.description} />

              {product.descriptionImages.length > 0 && (
                <div className="mt-7 grid gap-5">
                  {product.descriptionImages.map((image, index) => (
                    <figure key={`${image.url}-${index}`} className="overflow-hidden rounded-xl bg-secondary/35">
                      <div className="aspect-[3/2] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.url} alt={image.alt} loading="lazy" decoding="async" className="h-full w-full object-contain" />
                      </div>
                      {image.alt && <figcaption className="px-4 py-3 text-xs text-muted-foreground">{image.alt}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {product.faqs.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-border bg-background">
            <div className="border-b border-border px-4 py-4 sm:px-6">
              <h2 className="font-display text-xl font-bold tracking-tight">Frequently asked questions</h2>
            </div>
            <div className="divide-y divide-border px-4 sm:px-6">
              {product.faqs.map((faq, index) => (
                <details key={`${faq.question}-${index}`} className="group py-4">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <span aria-hidden="true" className="text-xl font-normal text-muted-foreground group-open:rotate-45">+</span>
                  </summary>
                  <div className="pb-2 pr-8">
                    <ProductRichContent content={faq.answer} />
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 mt-5 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        {renderActionButtons(true)}
      </div>
    </div>
  )
}

const attemptedProductViews = new Set<string>()

function hasTrackedViewRef(productId: string) {
  if (attemptedProductViews.has(productId)) return true
  if (hasRecentProductView(productId)) return true

  attemptedProductViews.add(productId)
  return false
}

function clearProductViewAttempt(productId: string) {
  attemptedProductViews.delete(productId)
}
