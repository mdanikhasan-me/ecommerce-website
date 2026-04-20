import { db } from '@/backend/database'
import Link from 'next/link'
import { formatPrice } from '@/backend/utils'
import { InventoryAdjustmentPanel } from '@/frontend/components/admin/InventoryAdjustmentPanel'

export const metadata = { title: 'Admin Inventory' }

export default async function AdminInventoryPage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: { stockQuantity: 'asc' },
    include: {
      category: { select: { name: true } },
      brand: { select: { name: true } },
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold">Inventory Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust base stock, low stock thresholds, and variant inventory from one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-2xl font-bold text-red-600">{outOfStock.length}</p>
          <p className="mt-0.5 text-sm text-red-700">Out of stock</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-2xl font-bold text-amber-600">{lowStock.length}</p>
          <p className="mt-0.5 text-sm text-amber-700">Low stock</p>
        </div>
        <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
          <p className="text-2xl font-bold text-green-600">{inStock.length}</p>
          <p className="mt-0.5 text-sm text-green-700">Healthy stock</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Product</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground md:table-cell">
                  SKU
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground sm:table-cell">
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
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Sold</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-secondary/50">
                  <td className="max-w-[260px] px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.brand?.name || 'No brand'}
                      </p>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground md:table-cell">
                    {product.sku}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {product.category.name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatPrice(product.salePrice ?? product.basePrice)}
                  </td>
                  <td className="px-4 py-3 text-right">
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
                  <td className="px-4 py-3 text-right text-muted-foreground">{product.soldCount}</td>
                  <td className="px-4 py-3 text-right">
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
                        className="text-xs text-primary hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
