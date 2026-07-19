import { OrderStatus, PaymentMethod, type Prisma } from '@prisma/client'
import Link from 'next/link'

import { db } from '@/backend/database'
import { parseAdminListPage } from '@/backend/admin/list-filters'
import { formatDate, formatPrice } from '@/backend/utils'
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
    status?: string
    q?: string
    payment?: string
    range?: string
    sort?: string
  }>
}

export const metadata = { title: 'Admin Orders' }

const TAB_STATUSES = ['DELIVERED', 'RETURNED', 'CANCELLED'] as const
const RANGE_VALUES = new Set(['7d', '30d', '90d', 'all'])
const SORT_VALUES = new Set(['newest', 'oldest', 'highest', 'lowest'])

function orderStatusTone(status: OrderStatus) {
  if (status === 'DELIVERED') return 'success'
  if (status === 'CANCELLED') return 'danger'
  if (status === 'RETURNED' || status === 'REFUNDED') return 'neutral'
  if (status === 'SHIPPED' || status === 'CONFIRMED') return 'info'
  return 'warning'
}

function paymentLabel(method: PaymentMethod) {
  if (method === 'CASH_ON_DELIVERY') return 'Cash on delivery'
  if (method === 'BKASH') return 'bKash'
  if (method === 'NAGAD') return 'Nagad'
  return 'Card payment'
}

function startDateForRange(range: string) {
  if (range === 'all') return null
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const rawFilters = await searchParams
  const page = parseAdminListPage(rawFilters.page)
  const limit = 20
  const skip = (page - 1) * limit
  const q = rawFilters.q?.trim().slice(0, 120) ?? ''
  const status = TAB_STATUSES.includes(rawFilters.status as (typeof TAB_STATUSES)[number])
    ? (rawFilters.status as (typeof TAB_STATUSES)[number])
    : ''
  const payment = Object.values(PaymentMethod).includes(rawFilters.payment as PaymentMethod)
    ? (rawFilters.payment as PaymentMethod)
    : ''
  const range = RANGE_VALUES.has(rawFilters.range ?? '') ? rawFilters.range! : '30d'
  const sort = SORT_VALUES.has(rawFilters.sort ?? '') ? rawFilters.sort! : 'newest'

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(payment ? { paymentMethod: payment } : {}),
  }
  const startDate = startDateForRange(range)
  if (startDate) where.createdAt = { gte: startDate }
  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: 'insensitive' } },
      { user: { name: { contains: q, mode: 'insensitive' } } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
      { guestEmail: { contains: q, mode: 'insensitive' } },
    ]
  }

  const orderBy: Prisma.OrderOrderByWithRelationInput =
    sort === 'oldest'
      ? { createdAt: 'asc' }
      : sort === 'highest'
        ? { total: 'desc' }
        : sort === 'lowest'
          ? { total: 'asc' }
          : { createdAt: 'desc' }

  const [orders, total, allCount, groupedStatuses] = await Promise.all([
    db.order.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { productName: true }, orderBy: { id: 'asc' }, take: 1 },
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where }),
    db.order.count(),
    db.order.groupBy({ by: ['status'], _count: { _all: true } }),
  ])

  const counts = new Map(groupedStatuses.map((item) => [item.status, item._count._all]))
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const filterQuery = (targetPage: number) => {
    const params = new URLSearchParams()
    if (targetPage > 1) params.set('page', String(targetPage))
    if (status) params.set('status', status)
    if (q) params.set('q', q)
    if (payment) params.set('payment', payment)
    if (range !== '30d') params.set('range', range)
    if (sort !== 'newest') params.set('sort', sort)
    const suffix = params.toString()
    return suffix ? `/admin/orders?${suffix}` : '/admin/orders'
  }

  return (
    <div className="admin-list-page">
      <AdminListHeader
        title="Orders"
        description="Manage, filter and review customer orders."
        actions={
          <>
            <AdminListAction href="/api/admin/reports/export?type=orders" icon="download" download>
              Export orders
            </AdminListAction>
            <AdminListAction href="/admin/orders/new" icon="plus" primary>
              Create order
            </AdminListAction>
          </>
        }
      />

      <AdminListTabs
        label="Order status"
        tabs={[
          { label: 'All orders', count: allCount, href: '/admin/orders', active: !status },
          { label: 'Delivered', count: counts.get('DELIVERED') ?? 0, href: '/admin/orders?status=DELIVERED', active: status === 'DELIVERED' },
          { label: 'Returned', count: counts.get('RETURNED') ?? 0, href: '/admin/orders?status=RETURNED', active: status === 'RETURNED' },
          { label: 'Cancelled', count: counts.get('CANCELLED') ?? 0, href: '/admin/orders?status=CANCELLED', active: status === 'CANCELLED' },
        ]}
      />

      <form className="admin-list-toolbar" action="/admin/orders">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <AdminSearchField defaultValue={q} placeholder="Search by order ID, customer or email" />
        <AdminSelectField label="Date range" name="range" defaultValue={range}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </AdminSelectField>
        <AdminSelectField label="Payment" name="payment" defaultValue={payment}>
          <option value="">All methods</option>
          {Object.values(PaymentMethod).map((method) => (
            <option key={method} value={method}>{paymentLabel(method)}</option>
          ))}
        </AdminSelectField>
        <AdminFiltersButton />
        <AdminSelectField label="Sort" name="sort" defaultValue={sort} className="admin-list-sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest">Highest total</option>
          <option value="lowest">Lowest total</option>
        </AdminSelectField>
      </form>

      <AdminListSummary strong={`${total} ${total === 1 ? 'order' : 'orders'}`} detail="Live order data" />

      <section className="admin-list-card" aria-label="Orders">
        <div className="admin-list-table-wrap">
          <table className="admin-list-table">
            <thead>
              <tr>
                <th className="w-12"><input className="admin-row-checkbox" type="checkbox" aria-label="Select all orders" /></th>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="admin-empty-cell text-center text-muted-foreground">
                    No orders match these filters.
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id}>
                  <td><input className="admin-row-checkbox" type="checkbox" aria-label={`Select order ${order.orderNumber}`} /></td>
                  <td data-primary>
                    <p className="admin-table-primary">{order.orderNumber}</p>
                    <p className="admin-table-secondary">{paymentLabel(order.paymentMethod)}</p>
                  </td>
                  <td data-label="Customer">
                    <p className="admin-table-primary">{order.user?.name ?? 'Guest customer'}</p>
                    <p className="admin-table-secondary">{order.user?.email ?? order.guestEmail ?? 'No email'}</p>
                  </td>
                  <td data-label="Items">
                    <p className="max-w-[17rem] truncate">{order.items[0]?.productName ?? 'No line items'}</p>
                    {order._count.items > 1 ? <p className="admin-table-secondary">+{order._count.items - 1} more</p> : null}
                  </td>
                  <td data-label="Payment" className="text-muted-foreground">{paymentLabel(order.paymentMethod)}</td>
                  <td data-label="Total"><span className="admin-table-primary">{formatPrice(order.total)}</span></td>
                  <td data-label="Status">
                    <span className="admin-table-status" data-tone={orderStatusTone(order.status)}>
                      {order.status.replaceAll('_', ' ').toLowerCase().replace(/^./, (value) => value.toUpperCase())}
                    </span>
                  </td>
                  <td data-label="Date" className="text-muted-foreground">{formatDate(order.createdAt)}</td>
                  <td data-action>
                    <Link href={`/admin/orders/${order.id}`} className="admin-table-action">
                      View order <LocalIcon name="chevron-right" className="h-4 w-4" />
                    </Link>
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
        summary={total === 0 ? 'No orders shown' : `Showing ${skip + 1}–${Math.min(skip + limit, total)} of ${total} orders`}
        pageHref={filterQuery}
      />
    </div>
  )
}
