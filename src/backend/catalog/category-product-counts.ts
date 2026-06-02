import { db } from '@/backend/database'
import { getBuyerVisibleProductWhere } from '@/backend/catalog/product-visibility'

export type CategoryForProductCount = {
  id: string
  children: { id: string }[]
}

export type ProductCountByCategory = {
  categoryId: string
  count: number
}

export function collectCategoryProductCountIds(categories: CategoryForProductCount[]) {
  return Array.from(new Set(categories.flatMap((category) => [
    category.id,
    ...category.children.map((child) => child.id),
  ])))
}

export function buildCategoryProductCountMap(
  categories: CategoryForProductCount[],
  productCounts: ProductCountByCategory[],
) {
  const countByCategoryId = new Map(productCounts.map((row) => [row.categoryId, row.count]))

  return new Map(categories.map((category) => {
    const total = [category.id, ...category.children.map((child) => child.id)].reduce(
      (sum, categoryId) => sum + (countByCategoryId.get(categoryId) ?? 0),
      0,
    )

    return [category.id, total]
  }))
}

export async function getVisibleCategoryProductCounts(categories: CategoryForProductCount[]) {
  const categoryIds = collectCategoryProductCountIds(categories)
  if (categoryIds.length === 0) {
    return buildCategoryProductCountMap(categories, [])
  }

  const groupedCounts = await db.product.groupBy({
    by: ['categoryId'],
    where: getBuyerVisibleProductWhere({ categoryId: { in: categoryIds } }),
    _count: { _all: true },
  })

  return buildCategoryProductCountMap(
    categories,
    groupedCounts.map((row) => ({
      categoryId: row.categoryId,
      count: row._count._all,
    })),
  )
}
