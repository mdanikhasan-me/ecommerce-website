import { Role, type Prisma } from '@prisma/client'
import Link from 'next/link'

import { db } from '@/backend/database'
import { parseAdminListPage } from '@/backend/admin/list-filters'
import { ADMIN_USER_LIST_SELECT } from '@/backend/admin/user-editor'
import { formatDate } from '@/backend/utils'
import {
  AdminFiltersButton,
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
    role?: string
    status?: string
    orders?: string
    sort?: string
  }>
}

export const metadata = { title: 'Admin Users' }

const STATUS_VALUES = new Set(['active', 'inactive'])
const ORDER_VALUES = new Set(['none', 'with_orders'])
const SORT_VALUES = new Set(['joined', 'oldest', 'name'])

function roleLabel(role: Role) {
  if (role === 'SUPER_ADMIN') return 'Super admin'
  if (role === 'ADMIN') return 'Admin'
  return 'Customer'
}

function roleTone(role: Role) {
  if (role === 'SUPER_ADMIN') return 'danger'
  if (role === 'ADMIN') return 'warning'
  return 'info'
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseAdminListPage(params.page)
  const limit = 25
  const skip = (page - 1) * limit
  const q = params.q?.trim().slice(0, 120) ?? ''
  const role = Object.values(Role).includes(params.role as Role) ? (params.role as Role) : ''
  const status = STATUS_VALUES.has(params.status ?? '') ? params.status! : ''
  const orders = ORDER_VALUES.has(params.orders ?? '') ? params.orders! : ''
  const sort = SORT_VALUES.has(params.sort ?? '') ? params.sort! : 'joined'

  const where: Prisma.UserWhereInput = {}
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (role) where.role = role
  if (status === 'active') where.isActive = true
  if (status === 'inactive') where.isActive = false
  if (orders === 'none') where.orders = { none: {} }
  if (orders === 'with_orders') where.orders = { some: {} }

  const orderBy: Prisma.UserOrderByWithRelationInput =
    sort === 'oldest' ? { createdAt: 'asc' } : sort === 'name' ? { name: 'asc' } : { createdAt: 'desc' }

  const [users, total, allCount, customerCount, adminCount, inactiveCount] = await Promise.all([
    db.user.findMany({ where, skip, take: limit, orderBy, select: ADMIN_USER_LIST_SELECT }),
    db.user.count({ where }),
    db.user.count(),
    db.user.count({ where: { role: 'CUSTOMER' } }),
    db.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
    db.user.count({ where: { isActive: false } }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const pageHref = (targetPage: number) => {
    const search = new URLSearchParams()
    if (targetPage > 1) search.set('page', String(targetPage))
    if (q) search.set('q', q)
    if (role) search.set('role', role)
    if (status) search.set('status', status)
    if (orders) search.set('orders', orders)
    if (sort !== 'joined') search.set('sort', sort)
    const suffix = search.toString()
    return suffix ? `/admin/users?${suffix}` : '/admin/users'
  }

  return (
    <div className="admin-list-page">
      <AdminListHeader title="Users" description="Manage customer and staff accounts, roles and account status." />

      <AdminListTabs
        label="User type"
        tabs={[
          { label: 'All users', count: allCount, href: '/admin/users', active: !role && !status },
          { label: 'Customers', count: customerCount, href: '/admin/users?role=CUSTOMER', active: role === 'CUSTOMER' },
          { label: 'Administrators', count: adminCount, href: '/admin/users?role=ADMIN', active: role === 'ADMIN' || role === 'SUPER_ADMIN' },
          { label: 'Inactive', count: inactiveCount, href: '/admin/users?status=inactive', active: status === 'inactive' },
        ]}
      />

      <form className="admin-list-toolbar" action="/admin/users">
        <AdminSearchField defaultValue={q} placeholder="Search name, email or phone" />
        <AdminSelectField label="Role" name="role" defaultValue={role}>
          <option value="">All roles</option>
          <option value="CUSTOMER">Customers</option>
          <option value="ADMIN">Admins</option>
          <option value="SUPER_ADMIN">Super admins</option>
        </AdminSelectField>
        <AdminSelectField label="Account status" name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </AdminSelectField>
        <AdminSelectField label="Order history" name="orders" defaultValue={orders}>
          <option value="">Any order count</option>
          <option value="with_orders">Has orders</option>
          <option value="none">No orders</option>
        </AdminSelectField>
        <AdminFiltersButton />
        <AdminSelectField label="Sort" name="sort" defaultValue={sort} className="admin-list-sort">
          <option value="joined">Recently joined</option>
          <option value="oldest">Oldest accounts</option>
          <option value="name">Name A–Z</option>
        </AdminSelectField>
      </form>

      <AdminListSummary strong={`${total} ${total === 1 ? 'user' : 'users'}`} detail={`${adminCount} administrators · ${inactiveCount} inactive accounts`} />

      <section className="admin-list-card" aria-label="Users">
        <div className="admin-list-table-wrap">
          <table className="admin-list-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={7} className="admin-empty-cell text-center text-muted-foreground">No users match these filters.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id}>
                  <td data-primary>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700">
                        {(user.name?.[0] ?? user.email[0] ?? 'U').toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="admin-table-primary truncate">{user.name ?? 'Unnamed user'}</p>
                        <p className="admin-table-secondary truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td data-label="Contact">
                    <p className="flex items-center gap-2 text-muted-foreground"><LocalIcon name="mail" className="h-4 w-4" /> {user.email}</p>
                    <p className="admin-table-secondary flex items-center gap-2"><LocalIcon name="phone" className="h-4 w-4" /> {user.phone ?? 'Not provided'}</p>
                  </td>
                  <td data-label="Role"><span className="admin-table-status" data-tone={roleTone(user.role)}>{roleLabel(user.role)}</span></td>
                  <td data-label="Orders"><span className="admin-table-primary">{user._count.orders}</span></td>
                  <td data-label="Status"><span className="admin-table-status" data-tone={user.isActive ? 'success' : 'danger'}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td data-label="Joined" className="text-muted-foreground">{formatDate(user.createdAt)}</td>
                  <td data-action>
                    <Link href={`/admin/users/${user.id}`} className="admin-table-action">Manage <LocalIcon name="chevron-right" className="h-4 w-4" /></Link>
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
        summary={total === 0 ? 'No users shown' : `Showing ${skip + 1}–${Math.min(skip + limit, total)} of ${total} users`}
        pageHref={pageHref}
      />
    </div>
  )
}
