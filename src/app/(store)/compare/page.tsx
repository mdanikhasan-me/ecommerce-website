'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from '@/frontend/lib/toast'
import { useCartStore } from '@/frontend/stores/cart'
import { useCompareStore } from '@/frontend/stores/compare'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { calculateDiscount, cn, formatPrice } from '@/backend/utils'
import { useClientSession } from '@/frontend/hooks/useClientSession'

type CompareProduct = {
  id: string
  sku: string
  name: string
  slug: string
  description: string
  shortDescription?: string | null
  basePrice: number
  salePrice?: number | null
  rating: number
  reviewCount: number
  stockQuantity: number
  images: { url: string; isPrimary: boolean }[]
  category: { name: string; slug: string }
  attributes?: { id?: string; name: string; value: string }[]
  specifications?: { group?: string | null; name: string; value: string }[]
}

type Attribute = {
  label: string
  block?: boolean
  render: (product: CompareProduct) => ReactNode
}

function getCompareDescription(product: CompareProduct) {
  const raw = product.shortDescription?.trim() || product.description?.trim() || ''
  const cleaned = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return cleaned || 'No description added yet.'
}

function getCompareSpecs(product: CompareProduct) {
  const specs = (product.specifications ?? []).map((s) => ({ name: s.name, value: s.value }))
  const attrs = (product.attributes ?? []).map((a) => ({ name: a.name, value: a.value }))
  return [...specs, ...attrs].filter((row) => row.name && row.value).slice(0, 8)
}

// Label column + one flexible column per product. Static strings so Tailwind generates them.
// Compare is capped at 4 products by the store.
const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-[minmax(7rem,9.5rem)_minmax(0,1fr)]',
  2: 'grid-cols-[minmax(7rem,9.5rem)_repeat(2,minmax(0,1fr))]',
  3: 'grid-cols-[minmax(7rem,9.5rem)_repeat(3,minmax(0,1fr))]',
  4: 'grid-cols-[minmax(7rem,9.5rem)_repeat(4,minmax(0,1fr))]',
}

const ATTRIBUTES: Attribute[] = [
  {
    label: 'Price',
    render: (product) => {
      const current = product.salePrice ?? product.basePrice
      const discount = calculateDiscount(product.basePrice, product.salePrice ?? 0)
      return (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-lg font-bold text-foreground">{formatPrice(current)}</span>
          {product.salePrice ? (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.basePrice)}</span>
          ) : null}
          {discount > 0 ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{discount}% off</span>
          ) : null}
        </div>
      )
    },
  },
  {
    label: 'Rating',
    render: (product) => (
      <div className="flex items-center gap-1.5">
        <LocalIcon name="star-filled" className="h-4 w-4 star-filled" />
        <span className="text-sm font-semibold text-foreground">{product.rating.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
      </div>
    ),
  },
  {
    label: 'Specifications',
    block: true,
    render: (product) => {
      const specs = getCompareSpecs(product)
      if (specs.length === 0) {
        return <span className="text-sm text-muted-foreground">Not specified</span>
      }
      return (
        <ul className="space-y-1">
          {specs.map((spec, index) => (
            <li key={`${spec.name}-${index}`} className="flex gap-2 text-sm">
              <span className="shrink-0 text-muted-foreground">{spec.name}:</span>
              <span className="font-medium text-foreground">{spec.value}</span>
            </li>
          ))}
        </ul>
      )
    },
  },
  {
    label: 'Description',
    block: true,
    render: (product) => (
      <p className="text-sm leading-6 text-muted-foreground">{getCompareDescription(product)}</p>
    ),
  },
]

export default function ComparePage() {
  const router = useRouter()
  const { status: sessionStatus } = useClientSession()
  const items = useCompareStore((state) => state.items)
  const remove = useCompareStore((state) => state.remove)
  const clear = useCompareStore((state) => state.clear)
  const addItem = useCartStore((state) => state.addItem)
  const [isHydrated, setIsHydrated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<CompareProduct[]>([])
  const hasRedirectedGuestRef = useRef(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    if (sessionStatus === 'unauthenticated') {
      if (!hasRedirectedGuestRef.current) {
        hasRedirectedGuestRef.current = true
        clear()
        toast.error('Please sign in before comparing products')
        router.replace(`/auth/login?callbackUrl=${encodeURIComponent('/compare')}`)
      }
      setProducts([])
      setLoading(false)
      return
    }

    if (sessionStatus !== 'authenticated') return

    if (items.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    const fetchProducts = async () => {
      setLoading(true)
      const response = await fetch(`/api/products?ids=${items.join(',')}&limit=50&details=1`)
      const data = await response.json()
      setProducts(data.items ?? [])
      setLoading(false)
    }

    fetchProducts()
  }, [clear, isHydrated, items, router, sessionStatus])

  const orderedProducts = useMemo(() => {
    const productMap = new Map(products.map((product) => [product.id, product]))
    return items.map((id) => productMap.get(id)).filter(Boolean) as CompareProduct[]
  }, [items, products])

  const addToCart = (product: CompareProduct) => {
    const primaryImage = product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url ?? ''
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.salePrice ?? product.basePrice,
      originalPrice: product.basePrice,
      image: primaryImage,
      stockQuantity: product.stockQuantity,
      sku: product.sku,
    })
    toast.success('Added to cart')
  }

  const removeProduct = (product: CompareProduct) => {
    remove(product.id)
    toast.success('Removed from compare')
  }

  const gridColsClass = GRID_COLS[orderedProducts.length] ?? GRID_COLS[4]

  return (
    <div className="container-site py-7 sm:py-9">
      <div className="mb-6 flex flex-col gap-3 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Compare products</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
            Pricing, ratings, stock, and category side by side.
          </p>
        </div>
        {orderedProducts.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              clear()
              toast.success('Compare list cleared')
            }}
            className="btn-outline shrink-0 self-start sm:self-auto"
          >
            <LocalIcon name="trash-2" className="mr-2 h-4 w-4" />
            Clear all
          </button>
        ) : null}
      </div>

      {!isHydrated || sessionStatus === 'loading' || loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[320px] animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      ) : orderedProducts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LocalIcon name="compare" className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-foreground">Your compare list is empty</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Add products from any product card, then come back to compare them side by side.
          </p>
          <Link href="/" className="btn-primary mt-5 inline-flex">Browse products</Link>
        </div>
      ) : (
        <>
          {/* Mobile: one card per product, stacked. */}
          <div className="space-y-4 md:hidden">
            {orderedProducts.map((product) => (
              <MobileCompareCard
                key={product.id}
                product={product}
                onAdd={() => addToCart(product)}
                onRemove={() => removeProduct(product)}
              />
            ))}
          </div>

          {/* Desktop: aligned attribute rows, flexible product columns. */}
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
            <div className={cn('grid items-stretch', gridColsClass)}>
              <div className="bg-secondary/40" />
              {orderedProducts.map((product) => {
                const primaryImage = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url
                const discount = calculateDiscount(product.basePrice, product.salePrice ?? 0)
                return (
                  <div key={product.id} className="relative border-l border-border bg-secondary/40 p-4">
                    <button
                      type="button"
                      onClick={() => removeProduct(product)}
                      aria-label={`Remove ${product.name} from compare`}
                      title="Remove from compare"
                      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors min-[1025px]:hover:border-destructive/30 min-[1025px]:hover:text-destructive"
                    >
                      <LocalIcon name="trash-2" className="h-4 w-4" />
                    </button>
                    <Link href={`/products/${product.slug}`} className="group block">
                      <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-xl bg-card">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={product.name}
                            fill
                            className="object-contain p-2"
                            sizes="240px"
                            quality={75}
                          />
                        ) : null}
                        {discount > 0 ? (
                          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                            {discount}% off
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        {product.category.name}
                      </p>
                      <h2 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-5 text-foreground transition-colors min-[1025px]:hover:text-primary">
                        {product.name}
                      </h2>
                    </Link>
                  </div>
                )
              })}

              {ATTRIBUTES.map((attribute, rowIndex) => (
                <div key={attribute.label} className="contents">
                  <div
                    className={cn(
                      'flex items-start border-t border-border px-4 py-3.5 text-sm font-semibold text-muted-foreground',
                      rowIndex % 2 === 1 && 'bg-secondary/25',
                    )}
                  >
                    {attribute.label}
                  </div>
                  {orderedProducts.map((product) => (
                    <div
                      key={`${attribute.label}-${product.id}`}
                      className={cn(
                        'flex items-start border-l border-t border-border px-4 py-3.5',
                        rowIndex % 2 === 1 && 'bg-secondary/25',
                      )}
                    >
                      {attribute.render(product)}
                    </div>
                  ))}
                </div>
              ))}

              <div className="border-t border-border px-4 py-4" />
              {orderedProducts.map((product) => (
                <div key={`actions-${product.id}`} className="flex flex-col gap-2 border-l border-t border-border p-4">
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="store-add-to-cart-button flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-foreground/18 bg-transparent text-sm font-semibold text-foreground md:transition-colors min-[1025px]:hover:border-foreground/32 min-[1025px]:hover:bg-secondary/55"
                  >
                    <LocalIcon name="cart" className="h-4 w-4" />
                    Add to cart
                  </button>
                  <Link
                    href={`/products/${product.slug}`}
                    className="flex h-10 w-full items-center justify-center rounded-lg border border-border text-sm font-medium transition-colors min-[1025px]:hover:border-primary/40 min-[1025px]:hover:text-primary"
                  >
                    View product
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MobileCompareCard({
  product,
  onAdd,
  onRemove,
}: {
  product: CompareProduct
  onAdd: () => void
  onRemove: () => void
}) {
  const primaryImage = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url
  const discount = calculateDiscount(product.basePrice, product.salePrice ?? 0)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex gap-3 border-b border-border p-3">
        <Link
          href={`/products/${product.slug}`}
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary/60"
        >
          {primaryImage ? (
            <Image src={primaryImage} alt={product.name} fill className="object-contain p-1.5" sizes="96px" quality={75} />
          ) : null}
          {discount > 0 ? (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {discount}% off
            </span>
          ) : null}
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {product.category.name}
          </p>
          <Link href={`/products/${product.slug}`} className="mt-0.5 block">
            <h2 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">{product.name}</h2>
          </Link>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${product.name} from compare`}
          title="Remove from compare"
          className="flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-full border border-border text-muted-foreground transition-colors min-[1025px]:hover:border-destructive/30 min-[1025px]:hover:text-destructive"
        >
          <LocalIcon name="trash-2" className="h-4 w-4" />
        </button>
      </div>

      <dl className="divide-y divide-border/70">
        {ATTRIBUTES.map((attribute) =>
          attribute.block ? (
            <div key={attribute.label} className="px-3.5 py-2.5">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{attribute.label}</dt>
              <dd className="mt-1.5">{attribute.render(product)}</dd>
            </div>
          ) : (
            <div key={attribute.label} className="flex items-center justify-between gap-4 px-3.5 py-2.5">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{attribute.label}</dt>
              <dd className="text-right">{attribute.render(product)}</dd>
            </div>
          ),
        )}
      </dl>

      <div className="grid grid-cols-2 gap-2 p-3">
        <button
          type="button"
          onClick={onAdd}
          className="store-add-to-cart-button flex h-10 items-center justify-center gap-2 rounded-lg border border-foreground/18 bg-transparent text-sm font-semibold text-foreground md:transition-colors min-[1025px]:hover:border-foreground/32 min-[1025px]:hover:bg-secondary/55"
        >
          <LocalIcon name="cart" className="h-4 w-4" />
          Add to cart
        </button>
        <Link
          href={`/products/${product.slug}`}
          className="flex h-10 items-center justify-center rounded-lg border border-border text-sm font-medium transition-colors min-[1025px]:hover:border-primary/40 min-[1025px]:hover:text-primary"
        >
          View product
        </Link>
      </div>
    </div>
  )
}
