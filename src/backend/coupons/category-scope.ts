export async function expandCouponCategoryIds(
  readCategories: () => PromiseLike<Array<{ id: string; parentId: string | null }>>,
  selectedCategoryIds: readonly string[],
) {
  if (selectedCategoryIds.length === 0) return []

  const categories = await readCategories()
  const expandedIds = new Set(selectedCategoryIds)
  let addedCategory = true

  while (addedCategory) {
    addedCategory = false
    for (const category of categories) {
      if (category.parentId && expandedIds.has(category.parentId) && !expandedIds.has(category.id)) {
        expandedIds.add(category.id)
        addedCategory = true
      }
    }
  }

  return Array.from(expandedIds)
}
