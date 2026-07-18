import { db } from '@/backend/database'
import Link from 'next/link'
import { formatPrice } from '@/backend/utils'
import { InventoryAdjustmentPanel } from '@/frontend/components/admin/InventoryAdjustmentPanel'

export const metadata = { title: 'Admin Inventory' }

const STOCK_FILTERS = [
  { value: 'all', label: 'All products' },
  { value: 'out', label: 'Out of stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'healthy', label: 'Healthy' },
] as const

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stock?: string }>
}) {
  const params = await searchParams
  const query = params.q?.trim() ?? ''
  const stockFilter = STOCK_FILTERS.some((item) => item.value === params.stock)
    ? params.stock
    : 'all'
  const products = await db.product.findMany({
    where: {
      isActive: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' as const } },
              { sku: { contains: query, mode: 'insensitive' as const } },
              { category: { name: { contains: query, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    },
    orderBy: { stockQuantity: 'asc' },
    select: {
      id: true,
      name: true,
      sku: true,
      basePrice: true,
      salePrice: true,
      stockQuantity: true,
      lowStockThreshold: true,
      viewCount: true,
      soldCount: true,
      category: { select: { name: true } },
      variants: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          sku: true,
          stockQuantity: true,
          isActive: true,
        },
      },
    },
    take: 100,
  })

  const outOfStock = products.filter((product) => product.stockQuantity === 0)
  const lowStock = products.filter(
    (product) => product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold,
  )
  const inStock = products.filter((product) => product.stockQuantity > product.lowStockThreshold)
  const visibleProducts = products.filter((product) => {
    if (stockFilter === 'out') return product.stockQuantity === 0
    if (stockFilter === 'low') return product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold
    if (stockFilter === 'healthy') return product.stockQuantity > product.lowStockThreshold
    return true
  })

  const filterHref = (value: string) => {
    const search = new URLSearchParams()
    if (value !== 'all') search.set('stock', value)
    if (query) search.set('q', query)
    const suffix = search.toString()
    return suffix ? `/admin/inventory?${suffix}` : '/admin/inventory'
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="admin-page-title">Inventory Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust base stock, low stock thresholds, and variant inventory from one place.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="admin-card admin-stat-card p-3 sm:p-4" data-tone="critical">
          <p className="text-xl font-bold text-red-600 sm:text-2xl">{outOfStock.length}</p>
          <p className="mt-0.5 text-xs text-red-700 sm:text-sm">Out of stock</p>
        </div>
        <div className="admin-card admin-stat-card p-3 sm:p-4" data-tone="warning">
          <p className="text-xl font-bold text-amber-600 sm:text-2xl">{lowStock.length}</p>
          <p className="mt-0.5 text-xs text-amber-700 sm:text-sm">Low stock</p>
        </div>
        <div className="admin-card admin-stat-card p-3 sm:p-4" data-tone="healthy">
          <p className="text-xl font-bold text-green-600 sm:text-2xl">{inStock.length}</p>
          <p className="mt-0.5 text-xs text-green-700 sm:text-sm">Healthy stock</p>
        </div>
      </div>

      <section className="admin-card p-3 sm:p-4">
        <form className="flex flex-col gap-3 sm:flex-row" action="/admin/inventory">
          {stockFilter !== 'all' && <input type="hidden" name="stock" value={stockFilter} />}
          <input
            name="q"
            defaultValue={query}
            className="input-base flex-1"
            placeholder="Search product, SKU or category"
            aria-label="Search inventory"
          />
          <button type="submit" className="btn-primary sm:min-w-28">Search</button>
        </form>
        <div className="admin-report-tabs mt-3" aria-label="Inventory status">
          {STOCK_FILTERS.map((item) => (
            <Link
              key={item.value}
              href={filterHref(item.value)}
              aria-current={stockFilter === item.value ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="admin-card overflow-hidden">
        <div className="admin-responsive-table-wrap overflow-x-auto">
          <table className="admin-responsive-table w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Product</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground xl:table-cell">
                  SKU
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground lg:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Stock</th>
                <th className="hidden px-4 py-3 text-right font-semibold text-muted-foreground lg:table-cell">
                  Variants
                </th>
                <th className="hidden px-4 py-3 text-right font-semibold text-muted-foreground xl:table-cell">
                  Views
                </th>
                <th className="hidden px-4 py-3 text-right font-semibold text-muted-foreground lg:table-cell">Sold</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleProducts.map((product) => (
                <tr key={product.id}>
                  <td data-mobile data-primary className="max-w-[260px] px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category.name}</p>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground xl:table-cell">
                    {product.sku}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {product.category.name}
                  </td>
                  <td data-mobile data-label="Price" className="px-4 py-3 text-right">
                    {formatPrice(product.salePrice ?? product.basePrice)}
                  </td>
                  <td data-mobile data-label="Stock" className="px-4 py-3 text-right">
                    <div className="space-y-1">
                      <p
                        className={`font-bold ${
                          product.stockQuantity === 0
                            ? 'text-red-500'
                            : product.stockQuantity <= product.lowStockThreshold
                              ? 'text-amber-500'
                              : 'text-green-600'
                        }`}
                      >
                        {product.stockQuantity}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Alert at {product.lowStockThreshold}
                      </p>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-right text-muted-foreground lg:table-cell">
                    {product.variants.length}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-muted-foreground xl:table-cell">
                    {product.viewCount}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-muted-foreground lg:table-cell">{product.soldCount}</td>
                  <td data-mobile data-full data-action className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <InventoryAdjustmentPanel
                        product={{
                          id: product.id,
                          name: product.name,
                          sku: product.sku,
                          stockQuantity: product.stockQuantity,
                          lowStockThreshold: product.lowStockThreshold,
                          variants: product.variants,
                        }}
                      />
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="admin-mobile-action"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="admin-empty-cell px-4 py-12 text-center text-sm text-muted-foreground">
                    No inventory records match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
