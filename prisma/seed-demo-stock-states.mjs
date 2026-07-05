import nextEnv from '@next/env'

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())

const { PrismaClient } = await import('@prisma/client')
const db = new PrismaClient()

const STOCK_STATE_DEMOS = [
  {
    slug: 'demo-collectible-cards-3',
    state: 'out of stock',
    stockQuantity: 0,
    isPreOrder: false,
  },
  {
    slug: 'demo-collectible-cards-2',
    state: 'out of stock',
    stockQuantity: 0,
    isPreOrder: false,
  },
  {
    slug: 'galaxy-s24-ultra-variant-demo',
    state: 'pre-order',
    stockQuantity: 12,
    isPreOrder: true,
  },
  {
    slug: 'air-jordan-1-retro-high-og-demo',
    state: 'low stock',
    stockQuantity: 4,
    isPreOrder: false,
    variantStockQuantities: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5],
  },
  {
    slug: 'demo-mobile-phones-3',
    state: 'low stock',
    stockQuantity: 2,
    isPreOrder: false,
  },
  {
    slug: 'demo-toys-collectibles-3',
    state: 'low stock',
    stockQuantity: 3,
    isPreOrder: false,
  },
  {
    slug: 'demo-sports-fitness-3',
    state: 'low stock',
    stockQuantity: 5,
    isPreOrder: false,
  },
]

async function updateProductStockState(entry) {
  const product = await db.product.findUnique({
    where: { slug: entry.slug },
    select: { id: true, name: true, slug: true },
  })

  if (!product) {
    console.warn(`Skipped missing product: ${entry.slug}`)
    return null
  }

  await db.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: product.id },
      data: {
        stockQuantity: entry.stockQuantity,
        lowStockThreshold: 5,
        isPreOrder: entry.isPreOrder,
      },
    })

    if (entry.variantStockQuantities?.length) {
      const variants = await tx.productVariant.findMany({
        where: { productId: product.id },
        select: { id: true },
        orderBy: { sortOrder: 'asc' },
      })

      for (const [index, variant] of variants.entries()) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stockQuantity: entry.variantStockQuantities[index] ?? entry.stockQuantity,
          },
        })
      }
    }
  })

  return {
    name: product.name,
    slug: product.slug,
    state: entry.state,
    stockQuantity: entry.stockQuantity,
    isPreOrder: entry.isPreOrder,
  }
}

async function main() {
  const updates = []

  for (const entry of STOCK_STATE_DEMOS) {
    const result = await updateProductStockState(entry)
    if (result) updates.push(result)
  }

  console.table(updates)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
  })
