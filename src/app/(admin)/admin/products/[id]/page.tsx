import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getAdminEditableProduct,
  getAdminProductEditorOptions,
} from '@/backend/admin/product-editor'
import { ProductEditorForm } from '@/frontend/components/admin/ProductEditorForm'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Admin Edit Product' }

export default async function AdminProductDetailPage({ params }: Props) {
  const { id } = await params
  const [{ categories, brands, sellers }, product] = await Promise.all([
    getAdminProductEditorOptions(),
    getAdminEditableProduct(id),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update product content, price, stock, images, and variant details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="btn-outline">
            Back to Products
          </Link>
          <Link href={`/products/${product.slug}`} target="_blank" className="btn-outline">
            View live product page
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <ProductEditorForm
          categories={categories}
          brands={brands}
          sellers={sellers}
          product={product}
        />
      </div>
    </div>
  )
}
