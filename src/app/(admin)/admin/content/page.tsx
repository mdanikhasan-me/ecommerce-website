import { db } from '@/backend/database'
import { formatDate } from '@/backend/utils'
import Link from 'next/link'
import { Pencil, Plus } from 'lucide-react'

export const metadata = { title: 'Admin Content' }

export default async function AdminContentPage() {
  const sections = await db.homepageSection.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="space-y-5">
      <div>
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">Content</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Homepage section configuration and editorial blocks.
            </p>
          </div>
          <Link href="/admin/content/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add Section
          </Link>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="admin-responsive-table w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Section</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Updated</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sections.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-empty-cell px-4 py-12 text-center text-muted-foreground">
                  No homepage sections have been configured yet.
                </td>
              </tr>
            ) : (
              sections.map((section) => (
                <tr key={section.id}>
                  <td data-mobile data-primary className="px-4 py-3">
                    <p className="font-medium">{section.title ?? 'Untitled section'}</p>
                    {section.subtitle && <p className="text-xs text-muted-foreground">{section.subtitle}</p>}
                  </td>
                  <td data-mobile data-label="Type" className="px-4 py-3 text-muted-foreground">{section.type}</td>
                  <td data-mobile data-label="Status" className="px-4 py-3 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${section.isActive ? 'bg-green-50 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                      {section.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td data-mobile data-label="Updated" className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {formatDate(section.updatedAt)}
                  </td>
                  <td data-mobile data-action className="px-4 py-3 text-right">
                    <Link href={`/admin/content/${section.id}`} className="p-1.5 rounded-md inline-flex">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
