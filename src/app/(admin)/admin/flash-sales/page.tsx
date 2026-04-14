import Link from 'next/link'
import { db } from '@/backend/database'
import { formatDate } from '@/backend/utils'

export const metadata = { title: 'Flash Sales | Admin' }

function getFlashSaleStatus(startsAt: Date, endsAt: Date, isActive: boolean) {
  const now = new Date()
  if (!isActive) return { label: 'Inactive', className: 'bg-secondary text-foreground' }
  if (startsAt > now) return { label: 'Scheduled', className: 'bg-blue-50 text-blue-700' }
  if (endsAt < now) return { label: 'Ended', className: 'bg-secondary text-muted-foreground' }
  return { label: 'Live', className: 'bg-green-50 text-green-700' }
}

export default async function AdminFlashSalesPage() {
  const flashSales = await db.flashSale.findMany({
    orderBy: { startsAt: 'desc' },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true } },
        },
      },
    },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Flash Sales</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review live, scheduled, and ended flash sale campaigns.
          </p>
        </div>
      </div>

      {flashSales.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          No flash sale campaigns found.
        </div>
      ) : (
        <div className="space-y-4">
          {flashSales.map((flashSale) => {
            const status = getFlashSaleStatus(flashSale.startsAt, flashSale.endsAt, flashSale.isActive)

            return (
              <section key={flashSale.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex flex-col gap-4 border-b border-border px-5 py-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-lg font-semibold">{flashSale.title}</h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDate(flashSale.startsAt)} to {formatDate(flashSale.endsAt)}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{flashSale.items.length}</span> products in campaign
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {flashSale.items.map((item) => (
                    <div key={item.id} className="flex flex-col gap-2 px-5 py-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">/{item.product.slug}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>
                          Discount:{' '}
                          <span className="font-medium text-foreground">
                            {item.discountType === 'PERCENTAGE' ? `${item.discountValue}%` : item.discountValue}
                          </span>
                        </span>
                        <span>
                          Sold:{' '}
                          <span className="font-medium text-foreground">{item.soldQuantity}</span>
                        </span>
                        <span>
                          Max:{' '}
                          <span className="font-medium text-foreground">
                            {item.maxQuantity ?? 'No limit'}
                          </span>
                        </span>
                        <Link href={`/products/${item.product.slug}`} target="_blank" className="text-primary hover:underline">
                          View product
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
