import { db } from '@/backend/database'
import Link from 'next/link'
import { formatPrice } from '@/backend/utils'

export const metadata = { title: 'Inventory | Admin' }

export default async function AdminInventoryPage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: { stockQuantity: 'asc' },
    include: {
      category: { select: { name: true } },
      brand: { select: { name: true } },
    },
    take: 100,
  })

  const outOfStock = products.filter((p) => p.stockQuantity === 0)
  const lowStock = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5)
  const inStock = products.filter((p) => p.stockQuantity > 5)

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold">Inventory Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-red-600">{outOfStock.length}</p>
          <p className="text-sm text-red-700 mt-0.5">Out of Stock</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-amber-600">{lowStock.length}</p>
          <p className="text-sm text-amber-700 mt-0.5">Low Stock (≤5)</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-2xl font-bold text-green-600">{inStock.length}</p>
          <p className="text-sm text-green-700 mt-0.5">In Stock</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">SKU</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Price</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Stock</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Sold</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/50">
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">{p.sku}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.category.name}</td>
                  <td className="px-4 py-3 text-right">{formatPrice(p.salePrice ?? p.basePrice)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${p.stockQuantity === 0 ? 'text-red-500' : p.stockQuantity <= 5 ? 'text-amber-500' : 'text-green-600'}`}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{p.soldCount}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${p.id}`} className="text-xs text-primary hover:underline">Edit</Link>
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
