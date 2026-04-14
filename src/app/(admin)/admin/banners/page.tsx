import Link from 'next/link'
import { db } from '@/backend/database'
import { formatDate } from '@/backend/utils'

export const metadata = { title: 'Banners | Admin' }

export default async function AdminBannersPage() {
  const banners = await db.banner.findMany({
    orderBy: [{ position: 'asc' }, { sortOrder: 'asc' }],
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold">Banners</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Active promotional banners and hero placements.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Position</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Link</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {banners.map((banner) => (
              <tr key={banner.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <p className="font-medium">{banner.title}</p>
                  {banner.subtitle && <p className="text-xs text-muted-foreground">{banner.subtitle}</p>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{banner.position}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {banner.linkUrl ? (
                    <Link href={banner.linkUrl} target="_blank" className="text-primary hover:underline">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
