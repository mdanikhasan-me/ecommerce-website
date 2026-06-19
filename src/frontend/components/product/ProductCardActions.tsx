'use client'

import type { MouseEvent } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { useCartStore } from '@/frontend/stores/cart'
import { useCompareStore } from '@/frontend/stores/compare'
import { useWishlistStore } from '@/frontend/stores/wishlist'
import { cn } from '@/backend/utils/cn'

type ProductCardActionProduct = {
  id: string
  name: string
  slug: string
  sku: string
  basePrice: number
  salePrice?: number | null
  stockQuantity: number
  isPreOrder?: boolean | null
  primaryImage?: string
}

type ProductCardActionsProps = {
  product: ProductCardActionProduct
  inStock: boolean
  layout: 'grid' | 'list'
}

async function hasSignedInSession() {
  const res = await fetch('/api/auth/session', {
    cache: 'no-store',
    credentials: 'same-origin',
  })
  if (!res.ok) return false
  const session = await res.json().catch(() => null)
  return Boolean(session?.user)
}

function getCurrentCallbackUrl() {
  if (typeof window === 'undefined') return '/'
  return `${window.location.pathname}${window.location.search}`
}

export function ProductCardActions({ product, inStock, layout }: ProductCardActionsProps) {
  const router = useRouter()
  const [checkingCompare, setCheckingCompare] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const toggleWishlist = useWishlistStore((state) => state.toggle)
  const isWished = useWishlistStore((state) => state.items.includes(product.id))
  const addCompare = useCompareStore((state) => state.add)
  const storedIsCompared = useCompareStore((state) => state.items.includes(product.id))
  const price = product.salePrice ?? product.basePrice
  const buyLabel = product.isPreOrder ? 'Pre-order' : 'Add to Cart'
  const wishlistActionLabel = isWished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
  const compareActionLabel = storedIsCompared ? `Open compare for ${product.name}` : `Compare ${product.name}`
  const addToCartActionLabel = product.isPreOrder ? `Pre-order ${product.name}` : `Add ${product.name} to cart`

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!inStock) return

    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price,
      originalPrice: product.basePrice,
      image: product.primaryImage ?? '',
      stockQuantity: product.stockQuantity,
      sku: product.sku,
    })
    toast.success('Added to cart')
  }

  const handleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    toggleWishlist(product.id)
    toast.success(isWished ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleCompare = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (checkingCompare) return

    setCheckingCompare(true)
    const signedIn = await hasSignedInSession().catch(() => false)
    setCheckingCompare(false)

    if (!signedIn) {
      toast.error('Please sign in before comparing products')
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(getCurrentCallbackUrl())}`)
      return
    }

    if (storedIsCompared) {
      router.push('/compare')
      return
    }

    const success = addCompare(product.id)
    if (!success) toast.error('Max 4 products for comparison')
    else toast.success('Added to compare')
  }

  if (layout === 'list') {
    return (
      <div className="flex flex-col items-end justify-between gap-2">
        <button
          type="button"
          aria-label={wishlistActionLabel}
          title={wishlistActionLabel}
          onClick={handleWishlist}
          className={cn('rounded-lg p-1.5 sm:transition-colors md:hover:bg-secondary', isWished && 'text-red-500')}
        >
          <LocalIcon name={isWished ? 'heart-filled' : 'heart'} className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={addToCartActionLabel}
          title={addToCartActionLabel}
          onClick={handleAddToCart}
          disabled={!inStock}
          className="product-card-add-button inline-flex items-center justify-center rounded-full border border-foreground/18 bg-transparent px-3 py-1.5 text-xs font-semibold text-foreground/85 md:transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          {buyLabel}
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-100 sm:gap-1.5">
        <button
          title={wishlistActionLabel}
          type="button"
          onClick={handleWishlist}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full border border-black/6 sm:transition-colors md:hover:bg-primary md:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isWished ? 'bg-red-50 text-red-500 md:hover:bg-red-500 md:hover:text-white' : 'bg-[hsl(var(--card)/0.94)]',
          )}
          aria-label={wishlistActionLabel}
        >
          <LocalIcon name={isWished ? 'heart-filled' : 'heart'} className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleCompare}
          disabled={checkingCompare}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full border border-black/6 bg-[hsl(var(--card)/0.94)] sm:transition-colors md:hover:bg-primary md:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60',
            storedIsCompared && 'bg-primary/10 text-primary',
          )}
          aria-label={compareActionLabel}
          title={compareActionLabel}
        >
          <LocalIcon name="compare" className="h-4 w-4" />
        </button>
      </div>

      {inStock && (
        <div className="bg-white px-3 py-2 sm:px-4 sm:py-2.5">
          <button
          type="button"
          onClick={handleAddToCart}
          aria-label={addToCartActionLabel}
            className="product-card-add-button flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-foreground/16 bg-transparent text-xs font-semibold text-foreground/88 md:transition-colors sm:gap-2 sm:text-sm md:focus-visible:outline-none md:focus-visible:ring-2 md:focus-visible:ring-ring"
          >
            <LocalIcon name="cart" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {buyLabel}
          </button>
        </div>
      )}
    </>
  )
}
