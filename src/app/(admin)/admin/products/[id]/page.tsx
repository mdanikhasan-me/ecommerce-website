import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { formatPrice } from '@/backend/utils'
import { AdminPlaceholderPanel } from '@/frontend/components/admin/AdminPlaceholderPanel'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Edit Product | Admin' }

export default async function AdminProductDetailPage({ params }: Props) {
  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
  })

  if (!product) notFound()

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h1 className="font-display text-xl font-bold">{product.name}</h1>
        <div className="mt-3 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <p>SKU: <span className="font-medium text-foreground">{product.sku}</span></p>
          <p>Brand: <span className="font-medium text-foreground">{product.brand?.name ?? 'Unassigned'}</span></p>
          <p>Category: <span className="font-medium text-foreground">{product.category?.name ?? 'Unassigned'}</span></p>
          <p>Price: <span className="font-medium text-foreground">{formatPrice(product.salePrice ?? product.basePrice)}</span></p>
          <p>Stock: <span className="font-medium text-foreground">{product.stockQuantity}</span></p>
          <p>Status: <span className="font-medium text-foreground">{product.isActive ? 'Active' : 'Inactive'}</span></p>
        </div>
        <div className="mt-4">
          <Link href={`/products/${product.slug}`} target="_blank" className="text-sm text-primary hover:underline">
            View live product page
          </Link>
        </div>
      </div>

      <AdminPlaceholderPanel
        title="Product Editor"
        description="The product editor route is now active, but the form fields for editing are still to be built."
        backHref="/admin/products"
        backLabel="Back to Products"
      />
    </div>
  )
}
