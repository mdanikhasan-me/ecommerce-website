import type { Prisma } from '@prisma/client'

import { db } from '@/backend/database'
import { parseAdminListPage } from '@/backend/admin/list-filters'
import { formatPrice } from '@/backend/utils'
import {
  AdminFiltersButton,
  AdminListHeader,
  AdminListPagination,
  AdminListSummary,
  AdminListTabs,
  AdminSearchField,
  AdminSelectField,
} from '@/frontend/components/admin/AdminListPrimitives'
import { InventoryAdjustmentPanel } from '@/frontend/components/admin/InventoryAdjustmentPanel'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

export const metadata = { title: 'Admin Inventory' }

const STOCK_VALUES = new Set(['out', 'low', 'healthy'])
const VARIANT_VALUES = new Set(['with', 'without'])
const SORT_VALUES = new Set(['lowest', 'highest', 'name', 'recent'])

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    q?: string
    stock?: string
    category?: string
    variants?: string
    sort?: string
  }>
}) {
  const params = await searchParams
  const page = parseAdminListPage(params.page)
  const limit = 20
  const skip = (page - 1) * limit
  const query = params.q?.trim().slice(0, 120) ?? ''
  const stock = STOCK_VALUES.has(params.stock ?? '') ? params.stock! : ''
  const category = params.category?.trim() ?? ''
  const variants = VARIANT_VALUES.has(params.variants ?? '') ? params.variants! : ''
  const sort = SORT_VALUES.has(params.sort ?? '') ? params.sort! : 'lowest'

  const where: Prisma.ProductWhereInput = { isActive: true }
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { sku: { contains: query, mode: 'insensitive' } },
      { category: { name: { contains: query, mode: 'insensitive' } } },
    ]
  }
  if (category) where.categoryId = category
  if (stock === 'out') where.stockQuantity = 0
  if (stock === 'low') where.stockQuantity = { gt: 0, lte: 5 }
  if (stock === 'healthy') where.stockQuantity = { gt: 5 }
  if (variants === 'with') where.variants = { some: {} }
  if (variants === 'without') where.variants = { none: {} }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'highest'
      ? { stockQuantity: 'desc' }
      : sort === 'name'
        ? { name: 'asc' }
        : sort === 'recent'
          ? { updatedAt: 'desc' }
          : { stockQuantity: 'asc' }

  const [products, total, categories, trackedCount, outCount, lowCount, healthyCount] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
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
          select: { id: true, name: true, sku: true, stockQuantity: true, isActive: true },
        },
      },
    }),
    db.product.count({ where }),
    db.category.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    db.product.count({ where: { isActive: true } }),
    db.product.count({ where: { isActive: true, stockQuantity: 0 } }),
    db.product.count({ where: { isActive: true, stockQuantity: { gt: 0, lte: 5 } } }),
    db.product.count({ where: { isActive: true, stockQuantity: { gt: 5 } } }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const queryHref = (targetPage: number) => {
    const search = new URLSearchParams()
    if (targetPage > 1) search.set('page', String(targetPage))
    if (query) search.set('q', query)
    if (stock) search.set('stock', stock)
    if (category) search.set('category', category)
    if (variants) search.set('variants', variants)
    if (sort !== 'lowest') search.set('sort', sort)
    const suffix = search.toString()
    return suffix ? `/admin/inventory?${suffix}` : '/admin/inventory'
  }

  return (
    <div className="admin-list-page">
      <AdminListHeader title="Inventory" description="Monitor stock levels, alert thresholds and product variants." />

      <AdminListTabs
        label="Inventory state"
        tabs={[
          { label: 'All inventory', count: trackedCount, href: '/admin/inventory', active: !stock },
          { label: 'Out of stock', count: outCount, href: '/admin/inventory?stock=out', active: stock === 'out' },
          { label: 'Low stock', count: lowCount, href: '/admin/inventory?stock=low', active: stock === 'low' },
          { label: 'Healthy', count: healthyCount, href: '/admin/inventory?stock=healthy', active: stock === 'healthy' },
        ]}
      />

      <form className="admin-list-toolbar" action="/admin/inventory">
        <AdminSearchField defaultValue={query} placeholder="Search product, SKU or category" />
        <AdminSelectField label="Category" name="category" defaultValue={category}>
          <option value="">All categories</option>
          {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </AdminSelectField>
        <AdminSelectField label="Stock state" name="stock" defaultValue={stock}>
          <option value="">Any stock level</option>
          <option value="out">Out of stock</option>
          <option value="low">Low stock</option>
          <option value="healthy">Healthy</option>
        </AdminSelectField>
        <AdminSelectField label="Variants" name="variants" defaultValue={variants}>
          <option value="">All products</option>
          <option value="with">With variants</option>
          <option value="without">Without variants</option>
        </AdminSelectField>
        <AdminFiltersButton />
        <AdminSelectField label="Sort" name="sort" defaultValue={sort} className="admin-list-sort">
          <option value="lowest">Lowest stock first</option>
          <option value="highest">Highest stock first</option>
          <option value="name">Name A–Z</option>
          <option value="recent">Recently updated</option>
        </AdminSelectField>
      </form>

      <AdminListSummary strong={`${total} tracked ${total === 1 ? 'product' : 'products'}`} detail={`${outCount} out of stock · ${lowCount} low stock · threshold alerts enabled`} />

      <section className="admin-list-card" aria-label="Inventory">
        <div className="admin-list-table-wrap">
          <table className="admin-list-table">
            <thead>
              <tr>
                <th className="w-12"><input className="admin-row-checkbox" type="checkbox" aria-label="Select all inventory records" /></th>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Variants</th>
                <th>Performance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={9} className="admin-empty-cell text-center text-muted-foreground">No inventory records match these filters.</td></tr>
              ) : products.map((product) => {
                const stockTone = product.stockQuantity === 0 ? 'danger' : product.stockQuantity <= product.lowStockThreshold ? 'warning' : 'success'
                return (
                  <tr key={product.id}>
                    <td><input className="admin-row-checkbox" type="checkbox" aria-label={`Select ${product.name}`} /></td>
                    <td data-primary>
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="admin-product-thumb"><LocalIcon name="package" className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" /></div>
                        <div className="min-w-0">
                          <p className="admin-table-primary max-w-[18rem] truncate">{product.name}</p>
                          <p className="admin-table-secondary">{product.category.name}</p>
                        </div>
                      </div>
                    </td>
                    <td data-label="SKU" className="font-mono text-xs text-muted-foreground">{product.sku}</td>
                    <td data-label="Category" className="text-muted-foreground">{product.category.name}</td>
                    <td data-label="Price"><span className="admin-table-primary">{formatPrice(product.salePrice ?? product.basePrice)}</span></td>
                    <td data-label="Inventory">
                      <span className="admin-table-status" data-tone={stockTone}>
                        {product.stockQuantity === 0 ? 'Out of stock' : `${product.stockQuantity} in stock`}
                      </span>
                      <p className="admin-table-secondary">Alert at {product.lowStockThreshold}</p>
                    </td>
                    <td data-label="Variants">{product.variants.length}</td>
                    <td data-label="Performance">
                      <p className="admin-table-primary">{product.soldCount} sold</p>
                      <p className="admin-table-secondary">{product.viewCount} views</p>
                    </td>
                    <td data-action>
                      <InventoryAdjustmentPanel product={product} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <AdminListPagination
        page={page}
        totalPages={totalPages}
        summary={total === 0 ? 'No inventory records shown' : `Showing ${skip + 1}–${Math.min(skip + limit, total)} of ${total} products`}
        pageHref={queryHref}
      />
    </div>
  )
}
