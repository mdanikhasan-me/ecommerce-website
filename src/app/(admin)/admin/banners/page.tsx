import Link from 'next/link'
import { db } from '@/backend/database'
import { formatDate } from '@/backend/utils'
import { Pencil, Plus } from 'lucide-react'

export const metadata = { title: 'Admin Banners' }

export default async function AdminBannersPage() {
  const banners = await db.banner.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold">Banners</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Hero banners shown at the top of the homepage, in sort order.
            </p>
          </div>
          <Link href="/admin/banners/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add Banner
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Link</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Updated</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {banners.map((banner) => (
              <tr key={banner.id} className="min-[1025px]:hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <p className="font-medium">{banner.title || 'Untitled banner'}</p>
                  {banner.subtitle && <p className="text-xs text-muted-foreground">{banner.subtitle}</p>}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {banner.linkUrl ? (
                    <Link href={banner.linkUrl} target="_blank" className="text-primary min-[1025px]:hover:underline">
                      {banner.linkUrl}
                    </Link>
                  ) : (
                    'No link'
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${banner.isActive ? 'bg-green-50 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                    {banner.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                  {formatDate(banner.updatedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/banners/${banner.id}`} className="p-1.5 rounded-md min-[1025px]:hover:bg-secondary inline-flex">
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
