import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SOLD_ORDER_STATUSES = ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED']

async function syncSoldCounts() {
  const grouped = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      order: {
        status: { in: SOLD_ORDER_STATUSES },
      },
    },
    _sum: { quantity: true },
  })

  await prisma.product.updateMany({
    data: { soldCount: 0 },
  })

  await Promise.all(
    grouped.map((entry) =>
      prisma.product.update({
        where: { id: entry.productId },
        data: { soldCount: entry._sum.quantity ?? 0 },
      })
    )
  )
}

async function syncReviewStats() {
  const grouped = await prisma.review.groupBy({
    by: ['productId'],
    where: { status: 'APPROVED' },
    _avg: { rating: true },
    _count: { _all: true },
  })

  await prisma.product.updateMany({
    data: { rating: 0, reviewCount: 0 },
  })

  await Promise.all(
    grouped.map((entry) =>
      prisma.product.update({
        where: { id: entry.productId },
        data: {
          rating: entry._count._all > 0 ? Math.round((entry._avg.rating ?? 0) * 10) / 10 : 0,
          reviewCount: entry._count._all,
        },
      })
    )
  )
}

async function syncViewCounts() {
  const grouped = await prisma.productView.groupBy({
    by: ['productId'],
    _count: { _all: true },
  })

  await prisma.product.updateMany({
    data: { viewCount: 0 },
  })

  await Promise.all(
    grouped.map((entry) =>
      prisma.product.update({
        where: { id: entry.productId },
        data: { viewCount: entry._count._all },
      })
    )
  )
}

async function main() {
  const fakeReviews = await prisma.review.deleteMany({
    where: { orderId: null },
  })

  await prisma.productView.deleteMany({})

  await syncReviewStats()
  await syncSoldCounts()
  await syncViewCounts()

  console.log(`Deleted ${fakeReviews.count} fake reviews.`)
  console.log('Reset unique view tracking and recalculated sold, review, and view counters.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
