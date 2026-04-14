import { db } from '@/backend/database'
import { formatDate } from '@/backend/utils'

export const metadata = { title: 'Content | Admin' }

export default async function AdminContentPage() {
  const sections = await db.homepageSection.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold">Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Homepage section configuration and editorial blocks.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Section</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sections.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                  No homepage sections have been configured yet.
                </td>
              </tr>
            ) : (
              sections.map((section) => (
                <tr key={section.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <p className="font-medium">{section.title ?? 'Untitled section'}</p>
                    {section.subtitle && <p className="text-xs text-muted-foreground">{section.subtitle}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{section.type}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${section.isActive ? 'bg-green-50 text-green-700' : 'bg-secondary text-muted-foreground'}`}>
                      {section.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {formatDate(section.updatedAt)}
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
