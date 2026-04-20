import { OrderStatus } from '@prisma/client'

import { db } from '@/backend/database'

export const SOLD_ORDER_STATUSES: OrderStatus[] = ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED']

function uniqueIds(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)))
}

export async function syncProductSoldCounts(productIds: string[]) {
  const ids = uniqueIds(productIds)
  if (ids.length === 0) return

  const grouped = await db.orderItem.groupBy({
    by: ['productId'],
    where: {
      productId: { in: ids },
      order: { status: { in: SOLD_ORDER_STATUSES } },
    },
    _sum: { quantity: true },
  })

  await db.$transaction([
    db.product.updateMany({
      where: { id: { in: ids } },
      data: { soldCount: 0 },
    }),
    ...grouped.map((entry) =>
      db.product.update({
        where: { id: entry.productId },
        data: { soldCount: entry._sum.quantity ?? 0 },
      })
    ),
  ])
}

export async function syncProductViewCounts(productIds: string[]) {
  const ids = uniqueIds(productIds)
  if (ids.length === 0) return

  const grouped = await db.productView.groupBy({
    by: ['productId'],
    where: { productId: { in: ids } },
    _count: { _all: true },
  })

  await db.$transaction([
    db.product.updateMany({
      where: { id: { in: ids } },
      data: { viewCount: 0 },
    }),
    ...grouped.map((entry) =>
      db.product.update({
        where: { id: entry.productId },
        data: { viewCount: entry._count._all },
      })
    ),
  ])
}

type RecordProductViewArgs = {
  productId: string
  viewerKey: string
  userId?: string | null
}

export async function recordProductView({ productId, viewerKey, userId }: RecordProductViewArgs) {
  const result = await db.$transaction(async (tx) => {
    const created = await tx.productView.createMany({
      data: [
        {
          productId,
          viewerKey,
          userId: userId ?? null,
        },
      ],
      skipDuplicates: true,
    })

    if (created.count > 0) {
      await tx.product.update({
        where: { id: productId },
        data: { viewCount: { increment: 1 } },
      })
      return true
    }

    return false
  })

  return result
}
