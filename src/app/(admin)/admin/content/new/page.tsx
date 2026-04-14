import Link from 'next/link'
import { HomepageSectionEditorForm } from '@/frontend/components/admin/HomepageSectionEditorForm'

export const metadata = { title: 'Admin Create Homepage Section' }

export default function AdminNewContentSectionPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Create Homepage Section</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add and reorder storefront content sections with JSON configuration.
          </p>
        </div>
        <Link href="/admin/content" className="btn-outline">
          Back to Content
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <HomepageSectionEditorForm />
      </div>
    </div>
  )
}
