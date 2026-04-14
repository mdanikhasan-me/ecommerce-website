import { db } from '@/backend/database'
import { formatDateRelative } from '@/backend/utils'

export const metadata = { title: 'Admin Notifications' }

export default async function AdminNotificationsPage() {
  const notifications = await db.notification.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
    },
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recent customer and system notifications.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
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
                    <p className="font-medium">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {notification.user.name ?? notification.user.email}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{notification.type}</p>
                    <p className="mt-1">{formatDateRelative(notification.createdAt)}</p>
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
