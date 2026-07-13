import Link from 'next/link'
import { db } from '@/backend/database'
import { CategoryEditorForm } from '@/frontend/components/admin/CategoryEditorForm'

export const metadata = { title: 'Admin Create Category' }

export default async function AdminNewCategoryPage() {
  const categories = await db.category.findMany({
    select: {
      id: true,
      name: true,
      parentId: true,
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  return (
    <div className="space-y-5">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Create Category</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add top level categories or subcategories and control storefront visibility.
          </p>
        </div>
        <Link href="/admin/categories" className="btn-outline">
          Back to Categories
        </Link>
      </div>

      <CategoryEditorForm categories={categories} />
    </div>
  )
}
