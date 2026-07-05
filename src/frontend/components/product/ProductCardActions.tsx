import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

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

function WishlistActionIcons() {
  return (
    <>
      <span data-wishlist-icon="outline" className="inline-flex">
        <LocalIcon name="bookmark-plus" className="h-4 w-4" />
      </span>
      <span data-wishlist-icon="filled" className="wishlist-filled-icon">
        <LocalIcon name="bookmark-check" className="h-4 w-4" />
      </span>
    </>
  )
}

export function ProductCardActions({ product, inStock, layout }: ProductCardActionsProps) {
  const price = product.salePrice ?? product.basePrice
  const isPreOrder = product.isPreOrder ?? false
  const buyLabel = isPreOrder ? 'Pre-order' : 'Add to Cart'
  const addToCartActionLabel = isPreOrder ? `Pre-order ${product.name}` : `Add ${product.name} to cart`
  const buyButtonClassName = isPreOrder
    ? 'product-card-preorder-button'
    : 'product-card-add-button border-[hsl(270_18%_8%)] bg-[hsl(270_18%_8%)] text-primary-foreground'
  const productData = JSON.stringify({
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

  if (layout === 'list') {
    return (
      <div className="flex flex-col items-end justify-between gap-2" data-product-actions data-product={productData}>
        <button
          type="button"
          data-product-action={inStock ? 'cart' : 'wishlist'}
          data-kind={inStock ? undefined : 'wishlist'}
          data-product-id={inStock ? undefined : product.id}
          data-product-name={inStock ? undefined : product.name}
          aria-label={inStock ? addToCartActionLabel : `Add ${product.name} to wishlist`}
          title={inStock ? addToCartActionLabel : `Add ${product.name} to wishlist`}
          className={inStock
            ? `inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold md:transition-colors ${buyButtonClassName}`
            : 'product-card-wishlist-button inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold'}
        >
          {inStock ? (
            buyLabel
          ) : (
            <>
              <WishlistActionIcons />
              <span data-wishlist-label="add">Add to Wishlist</span>
              <span data-wishlist-label="saved">In Wishlist</span>
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="min-w-0" data-product-actions data-product={productData}>
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1 opacity-100 sm:gap-1.5">
        <button
          type="button"
          data-product-action="compare"
          data-kind="compare"
          data-product-id={product.id}
          data-product-name={product.name}
          className="product-card-action-button flex h-9 w-9 items-center justify-center rounded-full border border-black/6 bg-[hsl(var(--card)/0.94)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          aria-label={`Compare ${product.name}`}
          title={`Compare ${product.name}`}
        >
          <LocalIcon name="compare" className="h-4 w-4" />
        </button>
      </div>

      {inStock ? (
        <div className="min-w-0 bg-white px-3 pb-3 pt-2 sm:px-3.5 sm:pb-3.5 sm:pt-2">
          <button
            type="button"
            data-product-action="cart"
            aria-label={addToCartActionLabel}
            className={`flex h-9 w-full min-w-0 items-center justify-center gap-1.5 rounded-md border text-xs font-semibold md:transition-colors sm:h-10 sm:gap-2 sm:text-sm md:focus-visible:outline-none md:focus-visible:ring-2 md:focus-visible:ring-ring ${buyButtonClassName}`}
          >
            <LocalIcon name="cart" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {buyLabel}
          </button>
        </div>
      ) : (
        <div className="min-w-0 bg-white px-3 pb-3 pt-2 sm:px-3.5 sm:pb-3.5 sm:pt-2">
          <button
            type="button"
            data-product-action="wishlist"
            data-kind="wishlist"
            data-product-id={product.id}
            data-product-name={product.name}
            aria-label={`Add ${product.name} to wishlist`}
            title={`Add ${product.name} to wishlist`}
            className="product-card-wishlist-button flex h-9 w-full min-w-0 items-center justify-center gap-1.5 rounded-md border text-xs font-semibold sm:h-10 sm:gap-2 sm:text-sm md:focus-visible:outline-none md:focus-visible:ring-2 md:focus-visible:ring-ring"
          >
            <WishlistActionIcons />
            <span data-wishlist-label="add">Add to Wishlist</span>
            <span data-wishlist-label="saved">In Wishlist</span>
          </button>
        </div>
      )}
    </div>
  )
}
