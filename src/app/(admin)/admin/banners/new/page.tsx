import Link from 'next/link'
import { db } from '@/backend/database'
import { BannerEditorForm } from '@/frontend/components/admin/BannerEditorForm'

export const metadata = { title: 'Admin Create Banner' }

export default async function AdminNewBannerPage() {
  const destinations = await db.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      parent: { select: { name: true } },
    },
    orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  })

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

      <BannerEditorForm destinations={destinations} />
    </div>
  )
}
