export interface CategoryTreeNode {
  id: string
  parentId: string | null
}

export function getDescendantCategoryIds(categories: CategoryTreeNode[], categoryId: string) {
  const descendants = new Set<string>()
  let changed = true

  while (changed) {
    changed = false
    for (const item of categories) {
      if (item.parentId && (item.parentId === categoryId || descendants.has(item.parentId)) && !descendants.has(item.id)) {
        descendants.add(item.id)
        changed = true
      }
    }
  }

  return descendants
}
