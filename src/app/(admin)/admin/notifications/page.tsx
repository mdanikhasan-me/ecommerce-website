import { db } from '@/backend/database'
import { formatDateRelative } from '@/backend/utils'
import { NotificationComposer } from '@/frontend/components/admin/NotificationComposer'
import { NotificationRowActions } from '@/frontend/components/admin/NotificationRowActions'

export const metadata = { title: 'Admin Notifications' }

export default async function AdminNotificationsPage() {
  const [notifications, users] = await Promise.all([
    db.notification.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    db.user.findMany({
      where: { isActive: true },
      take: 100,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
  ])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="admin-page-title">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recent customer and system notifications.
        </p>
      </div>

      <NotificationComposer users={users} />

      <div className="admin-card overflow-hidden">
        <div className="divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="px-4 py-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{notification.title}</p>
                      {!notification.isRead && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {notification.user.name ?? notification.user.email}
                    </p>
                    {notification.link && (
                      <p className="mt-1 text-xs text-primary">{notification.link}</p>
                    )}
                  </div>
                  <div className="space-y-2 text-left text-xs text-muted-foreground md:text-right">
                    <p>{notification.type}</p>
                    <p>{formatDateRelative(notification.createdAt)}</p>
                    <NotificationRowActions notificationId={notification.id} isRead={notification.isRead} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
