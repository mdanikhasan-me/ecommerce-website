import { AdminPlaceholderPanel } from '@/frontend/components/admin/AdminPlaceholderPanel'

export const metadata = { title: 'Add Product | Admin' }

export default function AdminNewProductPage() {
  return (
    <AdminPlaceholderPanel
      title="Add Product"
      description="The route now opens correctly, but the full product creation form is still pending."
      backHref="/admin/products"
      backLabel="Back to Products"
      notes={[
        'Product listing, inventory, and storefront rendering already work.',
        'The next step is building the actual create and edit form workflow.',
      ]}
    />
  )
}
