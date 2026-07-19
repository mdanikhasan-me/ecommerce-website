import type { Prisma } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'

import { db } from '@/backend/database'
import { parseAdminListPage } from '@/backend/admin/list-filters'
import { formatDateRelative, formatPrice } from '@/backend/utils'
import {
  AdminFiltersButton,
  AdminListAction,
  AdminListHeader,
  AdminListPagination,
  AdminListSummary,
  AdminListTabs,
  AdminSearchField,
  AdminSelectField,
} from '@/frontend/components/admin/AdminListPrimitives'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

interface Props {
  searchParams: Promise<{
    page?: string
    q?: string
    category?: string
    inventory?: string
    status?: string
    sort?: string
  }>
}

export const metadata = { title: 'Admin Products' }

const STATUS_VALUES = new Set(['active', 'inactive'])
const INVENTORY_VALUES = new Set(['in_stock', 'low_stock', 'out_of_stock'])
const SORT_VALUES = new Set(['updated', 'created', 'name', 'price_high', 'price_low'])

export default async function AdminProductsPage({ searchParams }: Props) {
  const rawFilters = await searchParams
  const page = parseAdminListPage(rawFilters.page)
  const limit = 20
  const skip = (page - 1) * limit
  const q = rawFilters.q?.trim().slice(0, 120) ?? ''
  const category = rawFilters.category?.trim() ?? ''
  const inventory = INVENTORY_VALUES.has(rawFilters.inventory ?? '') ? rawFilters.inventory! : ''
  const status = STATUS_VALUES.has(rawFilters.status ?? '') ? rawFilters.status! : ''
  const sort = SORT_VALUES.has(rawFilters.sort ?? '') ? rawFilters.sort! : 'updated'

  const where: Prisma.ProductWhereInput = {}
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
      { category: { name: { contains: q, mode: 'insensitive' } } },
    ]
  }
  if (category) where.categoryId = category
  if (status === 'active') where.isActive = true
  if (status === 'inactive') where.isActive = false
  if (inventory === 'out_of_stock') where.stockQuantity = 0
  if (inventory === 'low_stock') where.AND = [{ stockQuantity: { gt: 0 } }, { stockQuantity: { lte: 5 } }]
  if (inventory === 'in_stock') where.stockQuantity = { gt: 5 }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'created'
      ? { createdAt: 'desc' }
      : sort === 'name'
        ? { name: 'asc' }
        : sort === 'price_high'
          ? { effectivePrice: 'desc' }
          : sort === 'price_low'
            ? { effectivePrice: 'asc' }
            : { updatedAt: 'desc' }

  const [products, total, categories, allCount, activeCount, inactiveCount, lowStockCount, outOfStockCount] = await Promise.all([
    db.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        basePrice: true,
        salePrice: true,
        stockQuantity: true,
        lowStockThreshold: true,
        isActive: true,
        updatedAt: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1, select: { url: true } },
        category: { select: { name: true } },
      },
    }),
    db.product.count({ where }),
    db.category.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    db.product.count(),
    db.product.count({ where: { isActive: true } }),
    db.product.count({ where: { isActive: false } }),
    db.product.count({ where: { stockQuantity: { gt: 0, lte: 5 } } }),
    db.product.count({ where: { stockQuantity: 0 } }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const filterHref = (targetPage: number) => {
    const params = new URLSearchParams()
    if (targetPage > 1) params.set('page', String(targetPage))
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    if (inventory) params.set('inventory', inventory)
    if (status) params.set('status', status)
    if (sort !== 'updated') params.set('sort', sort)
    const suffix = params.toString()
    return suffix ? `/admin/products?${suffix}` : '/admin/products'
  }

  return (
    <div className="admin-list-page">
      <AdminListHeader
        title="Products"
        description="Manage your catalog, pricing and inventory."
        actions={<AdminListAction href="/admin/products/new" icon="plus" primary>Add product</AdminListAction>}
      />

      <AdminListTabs
        label="Product status"
        tabs={[
          { label: 'All products', count: allCount, href: '/admin/products', active: !status && !inventory },
          { label: 'Active', count: activeCount, href: '/admin/products?status=active', active: status === 'active' },
          { label: 'Inactive', count: inactiveCount, href: '/admin/products?status=inactive', active: status === 'inactive' },
          { label: 'Low stock', count: lowStockCount, href: '/admin/products?inventory=low_stock', active: inventory === 'low_stock' },
          { label: 'Out of stock', count: outOfStockCount, href: '/admin/products?inventory=out_of_stock', active: inventory === 'out_of_stock' },
        ]}
      />

      <form className="admin-list-toolbar" action="/admin/products">
        <AdminSearchField defaultValue={q} placeholder="Search products, SKU or category" />
        <AdminSelectField label="Category" name="category" defaultValue={category}>
          <option value="">All categories</option>
          {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </AdminSelectField>
        <AdminSelectField label="Inventory" name="inventory" defaultValue={inventory}>
          <option value="">Any stock level</option>
          <option value="in_stock">Healthy stock</option>
          <option value="low_stock">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
        </AdminSelectField>
        <AdminSelectField label="Status" name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </AdminSelectField>
        <AdminFiltersButton />
        <AdminSelectField label="Sort" name="sort" defaultValue={sort} className="admin-list-sort">
          <option value="updated">Recently updated</option>
          <option value="created">Recently created</option>
          <option value="name">Name A–Z</option>
          <option value="price_high">Highest price</option>
          <option value="price_low">Lowest price</option>
        </AdminSelectField>
      </form>

      <AdminListSummary strong={`${total} ${total === 1 ? 'product' : 'products'}`} detail={`${lowStockCount} low stock · ${outOfStockCount} out of stock`} />

      <section className="admin-list-card" aria-label="Products">
        <div className="admin-list-table-wrap">
          <table className="admin-list-table">
            <thead>
              <tr>
                <th className="w-12"><input className="admin-row-checkbox" type="checkbox" aria-label="Select all products" /></th>
                <th>Product</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={9} className="admin-empty-cell text-center text-muted-foreground">No products match these filters.</td></tr>
              ) : products.map((product) => (
                <tr key={product.id}>
                  <td><input className="admin-row-checkbox" type="checkbox" aria-label={`Select ${product.name}`} /></td>
                  <td data-primary>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="admin-product-thumb">
                        {product.images[0]?.url ? <Image src={product.images[0].url} alt="" fill className="object-contain p-0.5" sizes="42px" /> : <LocalIcon name="package" className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <p className="admin-table-primary max-w-[18rem] truncate">{product.name}</p>
                        <p className="admin-table-secondary">{product.category.name}</p>
                      </div>
                    </div>
                  </td>
                  <td data-label="Category" className="text-muted-foreground">{product.category.name}</td>
                  <td data-label="SKU" className="font-mono text-xs text-muted-foreground">{product.sku}</td>
                  <td data-label="Price">
                    <p className="admin-table-primary">{formatPrice(product.salePrice ?? product.basePrice)}</p>
                    {product.salePrice ? <p className="admin-table-secondary line-through">{formatPrice(product.basePrice)}</p> : null}
                  </td>
                  <td data-label="Inventory">
                    <span className={product.stockQuantity === 0 ? 'text-red-600' : product.stockQuantity <= product.lowStockThreshold ? 'text-amber-700' : 'text-green-700'}>
                      {product.stockQuantity === 0 ? 'Out of stock' : `${product.stockQuantity} in stock`}
                    </span>
                  </td>
                  <td data-label="Status"><span className="admin-table-status" data-tone={product.isActive ? 'success' : 'neutral'}>{product.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td data-label="Updated" className="text-muted-foreground">{formatDateRelative(product.updatedAt)}</td>
                  <td data-action>
                    <div className="flex gap-2">
                      <Link href={`/products/${product.slug}`} target="_blank" className="admin-table-action admin-table-action-primary">View <LocalIcon name="eye" className="h-4 w-4" /></Link>
                      <Link href={`/admin/products/${product.id}`} className="admin-table-action">Edit <LocalIcon name="pencil" className="h-4 w-4" /></Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdminListPagination
        page={page}
        totalPages={totalPages}
        summary={total === 0 ? 'No products shown' : `Showing ${skip + 1}–${Math.min(skip + limit, total)} of ${total} products`}
        pageHref={filterHref}
      />
    </div>
  )
}
