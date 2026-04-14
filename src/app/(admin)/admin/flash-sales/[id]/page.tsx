import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/backend/database'
import { FlashSaleEditorForm } from '@/frontend/components/admin/FlashSaleEditorForm'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Admin Edit Flash Sale' }

export default async function AdminFlashSaleDetailPage({ params }: Props) {
  const { id } = await params
  const [flashSale, products] = await Promise.all([
    db.flashSale.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        startsAt: true,
        endsAt: true,
        isActive: true,
        items: {
          select: {
            id: true,
            productId: true,
            discountType: true,
            discountValue: true,
            maxQuantity: true,
          },
          orderBy: { id: 'asc' },
        },
      },
    }),
    db.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, sku: true },
      orderBy: { name: 'asc' },
      take: 200,
    }),
  ])

  if (!flashSale) notFound()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{flashSale.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update campaign timing, active state, and included flash sale products.
          </p>
        </div>
        <Link href="/admin/flash-sales" className="btn-outline">
          Back to Flash Sales
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <FlashSaleEditorForm products={products} flashSale={flashSale} />
      </div>
    </div>
  )
}
