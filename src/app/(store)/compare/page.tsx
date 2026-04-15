'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BarChart2, ShoppingCart, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore, useCompareStore } from '@/frontend/stores'
import { calculateDiscount, formatPrice, getStockStatus } from '@/backend/utils'

type CompareProduct = {
  id: string
  name: string
  slug: string
  basePrice: number
  salePrice?: number | null
  rating: number
  reviewCount: number
  stockQuantity: number
  images: { url: string; isPrimary: boolean }[]
  brand?: { name: string; slug: string } | null
  category: { name: string; slug: string }
}

export default function ComparePage() {
  const { items, remove, clear } = useCompareStore()
  const { addItem, openCart } = useCartStore()
  const [isHydrated, setIsHydrated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<CompareProduct[]>([])

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    if (items.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    const fetchProducts = async () => {
      setLoading(true)
      const response = await fetch(`/api/products?ids=${items.join(',')}&limit=50`)
      const data = await response.json()
      setProducts(data.items ?? [])
      setLoading(false)
    }

    fetchProducts()
  }, [isHydrated, items])

  const orderedProducts = useMemo(() => {
    const productMap = new Map(products.map((product) => [product.id, product]))
    return items.map((id) => productMap.get(id)).filter(Boolean) as CompareProduct[]
  }, [items, products])

  return (
    <div className="container-site py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Product compare
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Compare products</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            See pricing, ratings, stock, and category details side by side before you choose.
          </p>
        </div>
        {orderedProducts.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              clear()
              toast.success('Compare list cleared')
            }}
            className="btn-outline"
          >
            Clear compare
          </button>
        ) : null}
      </div>

      {!isHydrated || loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[360px] animate-pulse rounded-[28px] bg-secondary" />
          ))}
        </div>
      ) : orderedProducts.length === 0 ? (
        <div className="rounded-[32px] border border-border bg-card px-6 py-16 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BarChart2 className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold text-foreground">
            Your compare list is empty
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            Add products from any product card, then come back here to compare the most important
            details side by side.
          </p>
          <Link href="/" className="btn-primary mt-6 inline-flex">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[32px] border border-border bg-card shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <div className="min-w-[920px]">
              <div
                className="grid border-b border-border bg-secondary/45"
                style={{ gridTemplateColumns: `180px repeat(${orderedProducts.length}, minmax(240px, 1fr))` }}
              >
                <div className="px-6 py-5 text-sm font-semibold text-muted-foreground">Products</div>
                {orderedProducts.map((product) => {
                  const primaryImage =
                    product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url
                  const discount = calculateDiscount(product.basePrice, product.salePrice ?? 0)

                  return (
                    <div key={product.id} className="border-l border-border px-5 py-5">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/products/${product.slug}`} className="block flex-1">
                          <div className="relative aspect-[1.08] overflow-hidden rounded-[22px] bg-secondary">
                            {primaryImage ? (
                              <Image
                                src={primaryImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="240px"
                                quality={84}
                              />
                            ) : null}
                            {discount > 0 ? (
                              <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                                {discount}% off
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                            {product.brand?.name ?? product.category.name}
                          </p>
                          <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-foreground">
                            {product.name}
                          </h2>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            remove(product.id)
                            toast.success('Removed from compare')
                          }}
                          className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-destructive/20 hover:text-destructive"
                          aria-label={`Remove ${product.name} from compare`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <CompareRow
                label="Price"
                products={orderedProducts}
                renderValue={(product) => {
                  const currentPrice = product.salePrice ?? product.basePrice
                  return (
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-foreground">{formatPrice(currentPrice)}</p>
                      {product.salePrice ? (
                        <p className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.basePrice)}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Regular price</p>
                      )}
                    </div>
                  )
                }}
              />

              <CompareRow
                label="Savings"
                products={orderedProducts}
                renderValue={(product) => {
                  const discount = calculateDiscount(product.basePrice, product.salePrice ?? 0)
                  return (
                    <span className="text-sm font-semibold text-foreground">
                      {discount > 0 ? `${discount}% off` : 'No active deal'}
                    </span>
                  )
                }}
              />

              <CompareRow
                label="Rating"
                products={orderedProducts}
                renderValue={(product) => (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{product.rating.toFixed(1)} / 5</p>
                    <p className="text-sm text-muted-foreground">{product.reviewCount} reviews</p>
                  </div>
                )}
              />

              <CompareRow
                label="Category"
                products={orderedProducts}
                renderValue={(product) => (
                  <span className="text-sm font-medium text-foreground">{product.category.name}</span>
                )}
              />

              <CompareRow
                label="Stock"
                products={orderedProducts}
                renderValue={(product) => {
                  const { label, color } = getStockStatus(product.stockQuantity)
                  return <span className={`text-sm font-semibold ${color}`}>{label}</span>
                }}
              />

              <CompareRow
                label="Actions"
                products={orderedProducts}
                renderValue={(product) => {
                  const primaryImage =
                    product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url ?? ''
                  const currentPrice = product.salePrice ?? product.basePrice

                  return (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          addItem({
                            id: product.id,
                            productId: product.id,
                            name: product.name,
                            slug: product.slug,
                            price: currentPrice,
                            originalPrice: product.basePrice,
                            image: primaryImage,
                            stockQuantity: product.stockQuantity,
                            sku: `SKU-${product.id.slice(0, 6)}`,
                          })
                          toast.success('Added to cart')
                          openCart()
                        }}
                        className="btn-primary"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to cart
                      </button>
                      <Link href={`/products/${product.slug}`} className="btn-outline">
                        View product
                      </Link>
                    </div>
                  )
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CompareRow({
  label,
  products,
  renderValue,
}: {
  label: string
  products: CompareProduct[]
  renderValue: (product: CompareProduct) => ReactNode
}) {
  return (
    <div
      className="grid border-t border-border"
      style={{ gridTemplateColumns: `180px repeat(${products.length}, minmax(240px, 1fr))` }}
    >
      <div className="px-6 py-5 text-sm font-semibold text-muted-foreground">{label}</div>
      {products.map((product) => (
        <div key={`${label}-${product.id}`} className="border-l border-border px-5 py-5">
          {renderValue(product)}
        </div>
      ))}
    </div>
  )
}
