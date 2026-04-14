import Link from 'next/link'
import { BannerEditorForm } from '@/frontend/components/admin/BannerEditorForm'

export const metadata = { title: 'Admin Create Banner' }

export default function AdminNewBannerPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Create Banner</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add homepage and promotional banners with desktop and mobile artwork.
          </p>
        </div>
        <Link href="/admin/banners" className="btn-outline">
          Back to Banners
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <BannerEditorForm />
      </div>
    </div>
  )
}
