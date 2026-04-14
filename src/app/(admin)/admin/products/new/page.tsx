import Link from 'next/link'
import { getAdminProductEditorOptions } from '@/backend/admin/product-editor'
import { ProductEditorForm } from '@/frontend/components/admin/ProductEditorForm'

export const metadata = { title: 'Admin Create Product' }

export default async function AdminNewProductPage() {
  const { categories, brands, sellers } = await getAdminProductEditorOptions()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Create Product</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add product details, pricing, stock, images, and variants from one page.
          </p>
        </div>
        <Link href="/admin/products" className="btn-outline">
          Back to Products
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <ProductEditorForm categories={categories} brands={brands} sellers={sellers} />
      </div>
    </div>
  )
}
