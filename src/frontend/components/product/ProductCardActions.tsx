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

function ProductActionIcons() {
  return (
    <>
      <span data-wishlist-icon="outline" className="inline-flex">
        <LocalIcon name="heart" className="h-4 w-4" />
      </span>
      <span data-wishlist-icon="filled" className="wishlist-filled-icon">
        <LocalIcon name="heart-filled" className="h-4 w-4" />
      </span>
    </>
  )
}

export function ProductCardActions({ product, inStock, layout }: ProductCardActionsProps) {
  const price = product.salePrice ?? product.basePrice
  const buyLabel = product.isPreOrder ? 'Pre-order' : 'Add to Cart'
  const addToCartActionLabel = product.isPreOrder ? `Pre-order ${product.name}` : `Add ${product.name} to cart`
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
          data-product-action="wishlist"
          data-kind="wishlist"
          data-product-id={product.id}
          data-product-name={product.name}
          aria-label={`Add ${product.name} to wishlist`}
          title={`Add ${product.name} to wishlist`}
          className="rounded-lg p-1.5 sm:transition-colors min-[1025px]:hover:bg-secondary"
        >
          <ProductActionIcons />
        </button>
        <button
          type="button"
          data-product-action="cart"
          aria-label={addToCartActionLabel}
          title={addToCartActionLabel}
          disabled={!inStock}
          className="product-card-add-button inline-flex items-center justify-center rounded-full border border-foreground/18 bg-transparent px-3 py-1.5 text-xs font-semibold text-foreground/85 md:transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          {buyLabel}
        </button>
      </div>
    )
  }

  return (
    <div className="min-w-0" data-product-actions data-product={productData}>
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1 opacity-100 sm:gap-1.5">
        <button
          title={`Add ${product.name} to wishlist`}
          type="button"
          data-product-action="wishlist"
          data-kind="wishlist"
          data-product-id={product.id}
          data-product-name={product.name}
          className="product-card-action-button flex h-9 w-9 items-center justify-center rounded-full border border-black/6 bg-[hsl(var(--card)/0.94)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Add ${product.name} to wishlist`}
        >
          <ProductActionIcons />
        </button>
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
        <div className="min-w-0 bg-white px-4 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-2.5">
          <button
            type="button"
            data-product-action="cart"
            aria-label={addToCartActionLabel}
            className="product-card-add-button flex h-10 w-full min-w-0 items-center justify-center gap-1.5 rounded-lg border border-foreground/16 bg-transparent text-xs font-semibold text-foreground/88 md:transition-colors sm:h-11 sm:gap-2 sm:text-sm md:focus-visible:outline-none md:focus-visible:ring-2 md:focus-visible:ring-ring"
          >
            <LocalIcon name="cart" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {buyLabel}
          </button>
        </div>
      ) : null}
    </div>
  )
}
