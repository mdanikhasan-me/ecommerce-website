import Link from 'next/link'
import { getAdminProductEditorOptions } from '@/backend/admin/product-editor'
import { ProductEditorForm } from '@/frontend/components/admin/ProductEditorForm'

export const metadata = { title: 'Admin Create Product' }

export default async function AdminNewProductPage() {
  const { categories, officialStoreName } = await getAdminProductEditorOptions()

  return (
    <div className="space-y-5">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Create Product</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add product details, pricing, stock, images, and variants from one page.
          </p>
        </div>
        <Link href="/admin/products" className="btn-outline">
          Back to Products
        </Link>
      </div>

      <ProductEditorForm categories={categories} officialStoreName={officialStoreName} />
    </div>
  )
}
