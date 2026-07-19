import { NotificationType, type Prisma } from '@prisma/client'
import Link from 'next/link'

import { db } from '@/backend/database'
import { parseAdminListPage } from '@/backend/admin/list-filters'
import { formatDate, formatDateRelative } from '@/backend/utils'
import {
  AdminFiltersButton,
  AdminListHeader,
  AdminListPagination,
  AdminListSummary,
  AdminListTabs,
  AdminSearchField,
  AdminSelectField,
} from '@/frontend/components/admin/AdminListPrimitives'
import { NotificationComposerDialog } from '@/frontend/components/admin/NotificationComposerDialog'
import { NotificationRowActions } from '@/frontend/components/admin/NotificationRowActions'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'

export const metadata = { title: 'Admin Notifications' }

const READ_VALUES = new Set(['read', 'unread'])
const RANGE_VALUES = new Set(['7d', '30d', '90d', 'all'])
const SORT_VALUES = new Set(['newest', 'oldest'])

function startDateForRange(range: string) {
  if (range === 'all') return null
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date
}

function typeLabel(type: NotificationType) {
  if (type === 'ORDER') return 'Orders'
  if (type === 'REVIEW') return 'Reviews'
  if (type === 'PROMOTION') return 'Promotions'
  if (type === 'SELLER') return 'Sellers'
  return 'System'
}

function typeTone(type: NotificationType) {
  if (type === 'ORDER') return 'info'
  if (type === 'PROMOTION') return 'warning'
  if (type === 'REVIEW') return 'success'
  return 'neutral'
}

function getLinkedOrderId(link: string | null) {
  if (!link) return null
  return link.match(/\/orders\/([^/?#]+)/)?.[1] ?? null
}

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    q?: string
    type?: string
    read?: string
    range?: string
    sort?: string
  }>
}) {
  const params = await searchParams
  const page = parseAdminListPage(params.page)
  const limit = 20
  const skip = (page - 1) * limit
  const q = params.q?.trim().slice(0, 120) ?? ''
  const type = Object.values(NotificationType).includes(params.type as NotificationType)
    ? (params.type as NotificationType)
    : ''
  const read = READ_VALUES.has(params.read ?? '') ? params.read! : ''
  const range = RANGE_VALUES.has(params.range ?? '') ? params.range! : '30d'
  const sort = SORT_VALUES.has(params.sort ?? '') ? params.sort! : 'newest'

  const where: Prisma.NotificationWhereInput = {}
  if (type) where.type = type
  if (read === 'read') where.isRead = true
  if (read === 'unread') where.isRead = false
  const startDate = startDateForRange(range)
  if (startDate) where.createdAt = { gte: startDate }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { message: { contains: q, mode: 'insensitive' } },
      { link: { contains: q, mode: 'insensitive' } },
      { user: { name: { contains: q, mode: 'insensitive' } } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
    ]
  }

  const [notifications, total, users, allCount, groupedTypes, unreadCount] = await Promise.all([
    db.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: sort === 'oldest' ? 'asc' : 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        link: true,
        isRead: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    db.notification.count({ where }),
    db.user.findMany({ where: { isActive: true }, take: 100, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true } }),
    db.notification.count(),
    db.notification.groupBy({ by: ['type'], _count: { _all: true } }),
    db.notification.count({ where: { isRead: false } }),
  ])

  const linkedOrderIds = Array.from(new Set(notifications.map((item) => getLinkedOrderId(item.link)).filter((id): id is string => Boolean(id))))
  const linkedOrders = linkedOrderIds.length
    ? await db.order.findMany({ where: { id: { in: linkedOrderIds } }, select: { id: true, orderNumber: true } })
    : []
  const orderNumbers = new Map(linkedOrders.map((order) => [order.id, order.orderNumber]))
  const typeCounts = new Map(groupedTypes.map((item) => [item.type, item._count._all]))
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const pageHref = (targetPage: number) => {
    const search = new URLSearchParams()
    if (targetPage > 1) search.set('page', String(targetPage))
    if (q) search.set('q', q)
    if (type) search.set('type', type)
    if (read) search.set('read', read)
    if (range !== '30d') search.set('range', range)
    if (sort !== 'newest') search.set('sort', sort)
    const suffix = search.toString()
    return suffix ? `/admin/notifications?${suffix}` : '/admin/notifications'
  }

  return (
    <div className="admin-list-page">
      <AdminListHeader
        title="Notifications"
        description="Send updates and review customer activity by purpose."
        actions={<NotificationComposerDialog users={users} />}
      />

      <AdminListTabs
        label="Notification purpose"
        tabs={[
          { label: 'All activity', count: allCount, href: '/admin/notifications', active: !type },
          ...Object.values(NotificationType).map((value) => ({
            label: typeLabel(value),
            count: typeCounts.get(value) ?? 0,
            href: `/admin/notifications?type=${value}`,
            active: type === value,
          })),
        ]}
      />

      <form className="admin-list-toolbar" action="/admin/notifications">
        <AdminSearchField defaultValue={q} placeholder="Search activity, order ID or destination" />
        <AdminSelectField label="Read state" name="read" defaultValue={read}>
          <option value="">All notifications</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </AdminSelectField>
        <AdminSelectField label="Purpose" name="type" defaultValue={type}>
          <option value="">All purposes</option>
          {Object.values(NotificationType).map((value) => <option key={value} value={value}>{typeLabel(value)}</option>)}
        </AdminSelectField>
        <AdminSelectField label="Date range" name="range" defaultValue={range}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </AdminSelectField>
        <AdminFiltersButton />
        <AdminSelectField label="Sort" name="sort" defaultValue={sort} className="admin-list-sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </AdminSelectField>
      </form>

      <AdminListSummary strong={`${total} ${total === 1 ? 'notification' : 'notifications'}`} detail={`${unreadCount} unread · live activity`} />

      <section className="admin-list-card" aria-label="Notification activity">
        <div className="admin-list-table-wrap">
          <table className="admin-list-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Order</th>
                <th>Actor</th>
                <th>Destination</th>
                <th>Time</th>
                <th>Read state</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length === 0 ? (
                <tr><td colSpan={7} className="admin-empty-cell text-center text-muted-foreground">No notifications match these filters.</td></tr>
              ) : notifications.map((notification) => {
                const linkedOrderId = getLinkedOrderId(notification.link)
                const orderNumber = linkedOrderId ? orderNumbers.get(linkedOrderId) : null
                return (
                  <tr key={notification.id}>
                    <td data-primary>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="admin-table-primary">{notification.title}</p>
                        <span className="admin-table-status" data-tone={typeTone(notification.type)}>{typeLabel(notification.type)}</span>
                      </div>
                      <p className="admin-table-secondary max-w-[26rem] truncate">{notification.message}</p>
                    </td>
                    <td data-label="Order"><span className="admin-table-primary">{orderNumber ?? '—'}</span></td>
                    <td data-label="Actor" className="text-muted-foreground">System</td>
                    <td data-label="Destination">
                      {notification.link ? (
                        <Link href={notification.link} className="inline-flex items-center gap-2 font-semibold text-blue-700">Open destination <LocalIcon name="chevron-right" className="h-4 w-4" /></Link>
                      ) : <span className="text-muted-foreground">No destination</span>}
                      <p className="admin-table-secondary">{notification.user.name ?? notification.user.email}</p>
                    </td>
                    <td data-label="Time"><p className="admin-table-primary">{formatDateRelative(notification.createdAt)}</p><p className="admin-table-secondary">{formatDate(notification.createdAt)}</p></td>
                    <td data-label="Read state"><span className="admin-table-status" data-tone={notification.isRead ? 'success' : 'warning'}>{notification.isRead ? 'Read' : 'Unread'}</span></td>
                    <td data-action><NotificationRowActions notificationId={notification.id} isRead={notification.isRead} /></td>
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
        summary={total === 0 ? 'No notifications shown' : `Showing ${skip + 1}–${Math.min(skip + limit, total)} of ${total} notifications`}
        pageHref={pageHref}
      />
    </div>
  )
}
