import { AdminPlaceholderPanel } from '@/frontend/components/admin/AdminPlaceholderPanel'

export const metadata = { title: 'Add Category | Admin' }

export default function AdminNewCategoryPage() {
  return (
    <AdminPlaceholderPanel
      title="Add Category"
      description="The route is connected, but the category creation form is still pending."
      backHref="/admin/categories"
      backLabel="Back to Categories"
    />
  )
}
