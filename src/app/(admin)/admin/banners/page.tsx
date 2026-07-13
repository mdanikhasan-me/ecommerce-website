import Link from 'next/link'
import { ImageIcon, Pencil, Plus } from 'lucide-react'
import { db } from '@/backend/database'
import { formatDate } from '@/backend/utils'

export const metadata = { title: 'Admin Banners' }

export default async function AdminBannersPage() {
  const banners = await db.banner.findMany({ orderBy: { sortOrder: 'asc' } })
  const now = new Date()

  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Homepage banners</h1>
          <p className="admin-page-description">
            Manage artwork, copy, calls to action, visibility, and scheduling from one workspace.
          </p>
        </div>
        <Link href="/admin/banners/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> Create banner
        </Link>
      </div>

      {banners.length ? (
        <div className="grid gap-4 2xl:grid-cols-2">
          {banners.map((banner) => {
            const isUpcoming = Boolean(banner.startsAt && banner.startsAt > now)
            const isExpired = Boolean(banner.endsAt && banner.endsAt < now)
            const status = !banner.isActive
              ? { label: 'Hidden', className: 'bg-secondary text-muted-foreground' }
              : isUpcoming
                ? { label: 'Scheduled', className: 'bg-blue-50 text-blue-700' }
                : isExpired
                  ? { label: 'Expired', className: 'bg-amber-50 text-amber-800' }
                  : { label: 'Live', className: 'bg-green-50 text-green-700' }

            return (
              <article key={banner.id} className="admin-card grid gap-4 p-4 sm:grid-cols-[10.5rem_minmax(0,1fr)]">
                <div className="aspect-[16/9] overflow-hidden rounded-md bg-secondary">
                  {banner.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={banner.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-bold">{banner.title || 'Untitled banner'}</h2>
                        <span className={`admin-status-pill ${status.className}`}>{status.label}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {banner.subtitle || 'No supporting copy'}
                      </p>
                    </div>
                    <Link href={`/admin/banners/${banner.id}`} className="admin-icon-button shrink-0" aria-label={`Edit ${banner.title || 'banner'}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </div>

                  <dl className="grid grid-cols-3 gap-3 text-xs">
                    <div><dt className="text-muted-foreground">Priority</dt><dd className="mt-1 font-semibold">{banner.sortOrder}</dd></div>
                    <div><dt className="text-muted-foreground">CTA</dt><dd className="mt-1 truncate font-semibold">{banner.buttonLabel || 'None'}</dd></div>
                    <div><dt className="text-muted-foreground">Updated</dt><dd className="mt-1 font-semibold">{formatDate(banner.updatedAt)}</dd></div>
                  </dl>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="admin-card flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">No homepage banners</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create the first responsive hero banner.</p>
        </div>
      )}
    </div>
  )
}
