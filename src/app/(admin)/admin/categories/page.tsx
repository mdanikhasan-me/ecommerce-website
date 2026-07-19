import Link from 'next/link'

import { db } from '@/backend/database'
import { parseAdminListPage } from '@/backend/admin/list-filters'
import { formatDate } from '@/backend/utils'
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

export const metadata = { title: 'Admin Categories' }

const TYPE_VALUES = new Set(['parent', 'sub'])
const VISIBILITY_VALUES = new Set(['active', 'hidden'])
const COVERAGE_VALUES = new Set(['with_products', 'empty'])
const SORT_VALUES = new Set(['name_asc', 'name_desc', 'updated'])

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    q?: string
    type?: string
    visibility?: string
    coverage?: string
    sort?: string
  }>
}) {
  const params = await searchParams
  const page = parseAdminListPage(params.page)
  const limit = 20
  const q = params.q?.trim().slice(0, 120).toLowerCase() ?? ''
  const type = TYPE_VALUES.has(params.type ?? '') ? params.type! : ''
  const visibility = VISIBILITY_VALUES.has(params.visibility ?? '') ? params.visibility! : ''
  const coverage = COVERAGE_VALUES.has(params.coverage ?? '') ? params.coverage! : ''
  const sort = SORT_VALUES.has(params.sort ?? '') ? params.sort! : 'name_asc'

  const categories = await db.category.findMany({
    include: {
      parent: { select: { id: true, name: true } },
      children: { select: { id: true } },
      _count: { select: { products: true } },
    },
  })

  const allCount = categories.length
  const parentCount = categories.filter((item) => !item.parentId).length
  const subcategoryCount = categories.filter((item) => Boolean(item.parentId)).length
  const hiddenCount = categories.filter((item) => !item.isActive).length
  const parentOrder = new Map(
    categories
      .filter((item) => !item.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map((item, index) => [item.id, index]),
  )

  const ordered = [...categories].sort((a, b) => {
    if (sort === 'updated') return b.updatedAt.getTime() - a.updatedAt.getTime()
    if (sort === 'name_desc') return b.name.localeCompare(a.name)
    if (sort === 'name_asc' && (a.parentId || b.parentId)) {
      const aRoot = a.parentId ?? a.id
      const bRoot = b.parentId ?? b.id
      const rootDelta = (parentOrder.get(aRoot) ?? Number.MAX_SAFE_INTEGER) - (parentOrder.get(bRoot) ?? Number.MAX_SAFE_INTEGER)
      if (rootDelta) return rootDelta
      if (!a.parentId && b.parentId) return -1
      if (a.parentId && !b.parentId) return 1
    }
    return a.name.localeCompare(b.name)
  })

  const filtered = ordered.filter((item) => {
    if (q && !item.name.toLowerCase().includes(q) && !item.parent?.name.toLowerCase().includes(q)) return false
    if (type === 'parent' && item.parentId) return false
    if (type === 'sub' && !item.parentId) return false
    if (visibility === 'active' && !item.isActive) return false
    if (visibility === 'hidden' && item.isActive) return false
    if (coverage === 'with_products' && item._count.products === 0) return false
    if (coverage === 'empty' && item._count.products > 0) return false
    return true
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const skip = (page - 1) * limit
  const visibleCategories = filtered.slice(skip, skip + limit)
  const pageHref = (targetPage: number) => {
    const search = new URLSearchParams()
    if (targetPage > 1) search.set('page', String(targetPage))
    if (q) search.set('q', q)
    if (type) search.set('type', type)
    if (visibility) search.set('visibility', visibility)
    if (coverage) search.set('coverage', coverage)
    if (sort !== 'name_asc') search.set('sort', sort)
    const suffix = search.toString()
    return suffix ? `/admin/categories?${suffix}` : '/admin/categories'
  }

  return (
    <div className="admin-list-page">
      <AdminListHeader
        title="Categories"
        description="Organize departments, subcategories, visibility and product coverage."
        actions={<AdminListAction href="/admin/categories/new" icon="plus" primary>Add category</AdminListAction>}
      />

      <AdminListTabs
        label="Category type"
        tabs={[
          { label: 'All categories', count: allCount, href: '/admin/categories', active: !type && !visibility },
          { label: 'Parent categories', count: parentCount, href: '/admin/categories?type=parent', active: type === 'parent' },
          { label: 'Subcategories', count: subcategoryCount, href: '/admin/categories?type=sub', active: type === 'sub' },
          { label: 'Hidden', count: hiddenCount, href: '/admin/categories?visibility=hidden', active: visibility === 'hidden' },
        ]}
      />

      <form className="admin-list-toolbar" action="/admin/categories">
        <AdminSearchField defaultValue={q} placeholder="Search categories or subcategories" />
        <AdminSelectField label="Category type" name="type" defaultValue={type}>
          <option value="">All types</option>
          <option value="parent">Parent categories</option>
          <option value="sub">Subcategories</option>
        </AdminSelectField>
        <AdminSelectField label="Visibility" name="visibility" defaultValue={visibility}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
        </AdminSelectField>
        <AdminSelectField label="Product coverage" name="coverage" defaultValue={coverage}>
          <option value="">Any amount</option>
          <option value="with_products">With products</option>
          <option value="empty">No products</option>
        </AdminSelectField>
        <AdminFiltersButton />
        <AdminSelectField label="Sort" name="sort" defaultValue={sort} className="admin-list-sort">
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
          <option value="updated">Recently updated</option>
        </AdminSelectField>
      </form>

      <AdminListSummary strong={`${total} ${total === 1 ? 'category' : 'categories'}`} detail={`${parentCount} parent categories · ${subcategoryCount} subcategories`} />

      <section className="admin-list-card" aria-label="Categories">
        <div className="admin-list-table-wrap">
          <table className="admin-list-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Type</th>
                <th>Parent</th>
                <th>Products</th>
                <th>Visibility</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleCategories.length === 0 ? (
                <tr><td colSpan={7} className="admin-empty-cell text-center text-muted-foreground">No categories match these filters.</td></tr>
              ) : visibleCategories.map((category) => (
                <tr key={category.id}>
                  <td data-primary>
                    <div className={`flex items-center gap-3 ${category.parentId ? 'pl-5' : ''}`}>
                      <LocalIcon name={category.parentId ? 'tag' : 'grid'} className="h-[1.05rem] w-[1.05rem] text-muted-foreground" />
                      <p className="admin-table-primary">{category.name}</p>
                    </div>
                  </td>
                  <td data-label="Type">
                    {category.parentId ? (
                      <span className="admin-table-status" data-tone="neutral">Subcategory</span>
                    ) : (
                      <span className="admin-table-status" data-tone="info">{category.children.length} {category.children.length === 1 ? 'subcategory' : 'subcategories'}</span>
                    )}
                  </td>
                  <td data-label="Parent" className="text-muted-foreground">{category.parent?.name ?? '—'}</td>
                  <td data-label="Products"><span className="admin-table-primary">{category._count.products}</span></td>
                  <td data-label="Visibility"><span className="admin-table-status" data-tone={category.isActive ? 'success' : 'neutral'}>{category.isActive ? 'Active' : 'Hidden'}</span></td>
                  <td data-label="Updated" className="text-muted-foreground">{formatDate(category.updatedAt)}</td>
                  <td data-action>
                    <Link href={`/admin/categories/${category.id}`} className="admin-table-action">Edit category <LocalIcon name="pencil" className="h-4 w-4" /></Link>
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
        summary={total === 0 ? 'No categories shown' : `Showing ${skip + 1}–${Math.min(skip + limit, total)} of ${total} categories`}
        pageHref={pageHref}
      />
    </div>
  )
}
