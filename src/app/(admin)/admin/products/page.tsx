import type { Prisma } from '@prisma/client'
import { db } from '@/backend/database'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Eye, Package } from 'lucide-react'
import { formatPrice } from '@/backend/utils'
import { parseAdminListPage } from '@/backend/admin/list-filters'

interface Props {
  searchParams: Promise<{ page?: string; q?: string; category?: string; status?: string }>
}

export const metadata = { title: 'Admin Products' }

export default async function AdminProductsPage({ searchParams }: Props) {
  const filters = await searchParams
  const page = parseAdminListPage(filters.page)
  const limit = 20
  const skip = (page - 1) * limit

  const where: Prisma.ProductWhereInput = {}
  if (filters.q) {
    const q = filters.q.trim().slice(0, 120)
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (filters.category) where.categoryId = filters.category
  if (filters.status === 'active') where.isActive = true
  if (filters.status === 'inactive') where.isActive = false
  if (filters.status === 'low_stock') where.stockQuantity = { lte: 5 }

  const [products, total, categories] = await Promise.all([
    db.product.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true } },
      },
    }),
    db.product.count({ where }),
    db.category.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="text-sm text-muted-foreground">{total} total products</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="admin-card p-3 sm:p-4">
        <form className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_10rem_auto_auto]">
          <input aria-label="Search products..." title="Search products..."
            name="q"
            defaultValue={filters.q}
            placeholder="Search products..."
            className="input-base col-span-2 w-full sm:col-span-1"
          />
          <select aria-label="Category" title="Category" name="category" defaultValue={filters.category} className="input-base col-span-2 w-full sm:col-span-1">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select aria-label="Status" title="Status" name="status" defaultValue={filters.status} className="input-base w-full">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="low_stock">Low Stock</option>
          </select>
          <button type="submit" className="btn-primary px-4">Filter</button>
          <Link href="/admin/products" className="btn-outline col-span-2 px-4 sm:col-span-1">Clear</Link>
        </form>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="admin-responsive-table-wrap overflow-x-auto">
          <table className="admin-responsive-table w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden xl:table-cell">SKU</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Price</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Stock</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty-cell px-4 py-12 text-center text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    No products found
                  </td>
                </tr>
              ) : products.map((p) => (
                <tr key={p.id}>
                  <td data-mobile data-primary className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                        {p.images[0]?.url && (
                          <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="40px" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[200px]">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.category.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{p.category.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden xl:table-cell">{p.sku}</td>
                  <td data-mobile data-label="Price" className="px-4 py-3 text-right">
                    <span className="font-semibold">{formatPrice(p.salePrice ?? p.basePrice)}</span>
                    {p.salePrice && (
                      <span className="text-xs text-muted-foreground line-through block">{formatPrice(p.basePrice)}</span>
                    )}
                  </td>
                  <td data-mobile data-label="Stock" className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className={`font-semibold ${p.stockQuantity === 0 ? 'text-red-500' : p.stockQuantity <= 5 ? 'text-amber-500' : 'text-green-600'}`}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td data-mobile data-label="Status" className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td data-mobile data-action className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/products/${p.slug}`} target="_blank" className="p-1.5 rounded-md text-muted-foreground" title="View">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link href={`/admin/products/${p.id}`} className="p-1.5 rounded-md text-muted-foreground" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (() => {
          const queryString = (targetPage: number) => {
            const params = new URLSearchParams()
            params.set('page', String(targetPage))
            if (filters.q) params.set('q', filters.q)
            if (filters.category) params.set('category', filters.category)
            if (filters.status) params.set('status', filters.status)
            return params.toString()
          }
          return (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between text-sm">
              <p className="text-muted-foreground">Showing {skip + 1} to {Math.min(skip + limit, total)} of {total}</p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/admin/products?${queryString(page - 1)}`} className="btn-outline py-1.5 px-3 text-xs">Prev</Link>
                )}
                {page < totalPages && (
                  <Link href={`/admin/products?${queryString(page + 1)}`} className="btn-outline py-1.5 px-3 text-xs">Next</Link>
                )}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
