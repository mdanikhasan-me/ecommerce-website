import { NotificationType, Prisma } from '@prisma/client'
import Link from 'next/link'
import { Bell, CircleCheck, Send } from 'lucide-react'

import { db } from '@/backend/database'
import { formatDateRelative } from '@/backend/utils'
import { NotificationComposer } from '@/frontend/components/admin/NotificationComposer'
import { NotificationRowActions } from '@/frontend/components/admin/NotificationRowActions'

export const metadata = { title: 'Admin Notifications' }

const TYPE_FILTERS = [
  { value: 'ALL', label: 'All activity' },
  { value: 'ORDER', label: 'Orders' },
  { value: 'REVIEW', label: 'Reviews' },
  { value: 'PROMOTION', label: 'Promotions' },
  { value: 'SELLER', label: 'Sellers' },
  { value: 'SYSTEM', label: 'System' },
] as const

const READ_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'UNREAD', label: 'Unread' },
  { value: 'READ', label: 'Read' },
] as const

type TypeFilter = (typeof TYPE_FILTERS)[number]['value']
type ReadFilter = (typeof READ_FILTERS)[number]['value']

function filterHref(type: TypeFilter, read: ReadFilter) {
  const search = new URLSearchParams()
  if (type !== 'ALL') search.set('type', type)
  if (read !== 'ALL') search.set('read', read)
  const query = search.toString()
  return query ? `/admin/notifications?${query}` : '/admin/notifications'
}

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; read?: string }>
}) {
  const params = await searchParams
  const activeType = TYPE_FILTERS.some((item) => item.value === params.type)
    ? (params.type as TypeFilter)
    : 'ALL'
  const activeRead = READ_FILTERS.some((item) => item.value === params.read)
    ? (params.read as ReadFilter)
    : 'ALL'

  const where: Prisma.NotificationWhereInput = {
    type: activeType === 'ALL' ? undefined : (activeType as NotificationType),
    isRead: activeRead === 'ALL' ? undefined : activeRead === 'READ',
  }

  const [notifications, users, total, unread, groupedTypes] = await Promise.all([
    db.notification.findMany({
      where,
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    db.user.findMany({
      where: { isActive: true },
      take: 100,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true },
    }),
    db.notification.count(),
    db.notification.count({ where: { isRead: false } }),
    db.notification.groupBy({ by: ['type'], _count: { _all: true } }),
  ])

  const typeCounts = new Map(groupedTypes.map((item) => [item.type, item._count._all]))

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="admin-page-title">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Send updates and review customer activity by purpose.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="admin-summary-row min-h-10"><Bell size={15} /> {unread} unread</span>
          <span className="admin-summary-row min-h-10"><CircleCheck size={15} /> {total} total</span>
        </div>
      </div>

      <details className="admin-card group overflow-hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 font-semibold sm:px-5">
          <span className="flex items-center gap-2"><Send size={17} /> Send a notification</span>
          <span className="text-xs font-normal text-muted-foreground">Choose audience, purpose and destination</span>
        </summary>
        <div className="border-t border-border/70">
          <NotificationComposer users={users} />
        </div>
      </details>

      <section className="admin-card p-3 sm:p-4">
        <div className="admin-report-tabs" aria-label="Notification categories">
          {TYPE_FILTERS.map((item) => (
            <Link
              key={item.value}
              href={filterHref(item.value, activeRead)}
              aria-current={activeType === item.value ? 'page' : undefined}
            >
              {item.label} <span className="ml-1 text-[11px] text-muted-foreground">{item.value === 'ALL' ? total : (typeCounts.get(item.value as NotificationType) ?? 0)}</span>
            </Link>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3" aria-label="Read status">
          {READ_FILTERS.map((item) => (
            <Link
              key={item.value}
              href={filterHref(activeType, item.value)}
              className={`admin-filter-chip ${activeRead === item.value ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-card p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="admin-section-title">Activity history</h2>
            <p className="mt-1 text-xs text-muted-foreground">Newest first, limited to 50 records.</p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{notifications.length} shown</span>
        </div>

        <div className="grid gap-2">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No notifications match these filters.</div>
          ) : (
            notifications.map((notification) => (
              <article key={notification.id} className="admin-notification-row" data-unread={!notification.isRead || undefined}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-bold tracking-wide text-muted-foreground">{notification.type}</span>
                    {!notification.isRead && <span className="text-[11px] font-semibold">Unread</span>}
                    <span className="text-[11px] text-muted-foreground">{formatDateRelative(notification.createdAt)}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold">{notification.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{notification.user.name ?? notification.user.email}</span>
                    {notification.link && <span className="truncate">{notification.link}</span>}
                  </div>
                </div>
                <NotificationRowActions notificationId={notification.id} isRead={notification.isRead} />
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
