import { OrderStatus, Prisma } from '@prisma/client'

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

  const counts = new Map(grouped.map((entry) => [entry.productId, entry._sum.quantity ?? 0]))
  const rows = ids.map((id) => Prisma.sql`(${id}::text, ${counts.get(id) ?? 0}::integer)`)

  await db.$executeRaw`
    UPDATE "Product" AS p
    SET "soldCount" = v."soldCount"
    FROM (VALUES ${Prisma.join(rows)}) AS v("id", "soldCount")
    WHERE p."id" = v."id"
  `
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
