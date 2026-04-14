import Link from 'next/link'
import { db } from '@/backend/database'
import { FlashSaleEditorForm } from '@/frontend/components/admin/FlashSaleEditorForm'

export const metadata = { title: 'Admin Create Flash Sale' }

export default async function AdminNewFlashSalePage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, sku: true },
    orderBy: { name: 'asc' },
    take: 200,
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Create Flash Sale</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Launch short campaigns with product level discount rules and quantity caps.
          </p>
        </div>
        <Link href="/admin/flash-sales" className="btn-outline">
          Back to Flash Sales
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <FlashSaleEditorForm products={products} />
      </div>
    </div>
  )
}
