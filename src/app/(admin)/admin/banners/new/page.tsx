import Link from 'next/link'
import { BannerEditorForm } from '@/frontend/components/admin/BannerEditorForm'

export const metadata = { title: 'Admin Create Banner' }

export default function AdminNewBannerPage() {
  return (
    <div className="space-y-6">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Create banner</h1>
          <p className="admin-page-description">
            Build a responsive homepage hero with editable copy, CTA, contrast, and scheduling.
          </p>
        </div>
        <Link href="/admin/banners" className="btn-outline">
          Back to banners
        </Link>
      </div>

      <BannerEditorForm />
    </div>
  )
}
