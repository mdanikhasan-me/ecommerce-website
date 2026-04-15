import { auth } from '@/backend/auth'
import { redirect } from 'next/navigation'
import { db } from '@/backend/database'
import { formatPrice, formatDate } from '@/backend/utils'
import { Package, Plus, Eye, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Seller Products' }

export default async function SellerProductsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const seller = await db.seller.findUnique({ where: { userId: session.user.id } })
  if (!seller) redirect('/seller/register')

  const products = await db.product.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: 'desc' },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: { select: { name: true } },
      brand: { select: { name: true } },
      _count: { select: { reviews: true, orderItems: true } },
    },
  })

  const activeCount = products.filter((p) => p.isActive).length
  const outOfStock = products.filter((p) => p.stockQuantity <= 0).length

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {products.length} total · {activeCount} active · {outOfStock} out of stock
          </p>
        </div>
        <Link href="/seller/products/new" className="btn-primary gap-2">
          <Plus className="size-4" />
          Add Product
        </Link>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <Package className="size-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display font-semibold text-lg mb-2">No products yet</h2>
          <p className="text-muted-foreground text-sm mb-6">Start adding products to your store</p>
          <Link href="/seller/products/new" className="btn-primary">Add Your First Product</Link>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Product</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Price</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Stock</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Sales</th>
                  <th className="text-center font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                          {product.images[0] ? (
                            <img src={product.images[0].url} alt="" className="size-full object-cover" />
                          ) : (
                            <Package className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {product.category?.name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold">{formatPrice(product.salePrice ?? product.basePrice)}</span>
                      {product.salePrice && product.salePrice < product.basePrice && (
                        <span className="block text-xs text-muted-foreground line-through">{formatPrice(product.basePrice)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={product.stockQuantity <= 0 ? 'text-red-500 font-medium' : product.stockQuantity <= 5 ? 'text-amber-500 font-medium' : ''}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell text-muted-foreground">
                      {product._count.orderItems}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {product.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <ToggleRight className="size-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          <ToggleLeft className="size-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/products/${product.slug}`} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="View">
                          <Eye className="size-3.5 text-muted-foreground" />
                        </Link>
                        <Link href={`/seller/products/${product.id}/edit`} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title="Edit">
                          <Pencil className="size-3.5 text-muted-foreground" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
