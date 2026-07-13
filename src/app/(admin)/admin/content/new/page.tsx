import Link from 'next/link'
import { HomepageSectionEditorForm } from '@/frontend/components/admin/HomepageSectionEditorForm'

export const metadata = { title: 'Admin Create Homepage Section' }

export default function AdminNewContentSectionPage() {
  return (
    <div className="space-y-5">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Create Homepage Section</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add and reorder storefront content sections with JSON configuration.
          </p>
        </div>
        <Link href="/admin/content" className="btn-outline">
          Back to Content
        </Link>
      </div>

      <HomepageSectionEditorForm />
    </div>
  )
}
