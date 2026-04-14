import Link from 'next/link'
import { BrandEditorForm } from '@/frontend/components/admin/BrandEditorForm'

export const metadata = { title: 'Admin Create Brand' }

export default function AdminNewBrandPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Create Brand</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add new brands with logos, banners, visibility, and feature controls.
          </p>
        </div>
        <Link href="/admin/brands" className="btn-outline">
          Back to Brands
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <BrandEditorForm />
      </div>
    </div>
  )
}
