export function getPaginationPages(currentPage: number, totalPages: number, maxVisible = 5) {
  const safeTotal = Math.max(0, Math.floor(totalPages))
  if (safeTotal <= 0) return []

  const visible = Math.max(1, Math.min(Math.floor(maxVisible), safeTotal))
  const current = Math.min(Math.max(1, Math.floor(currentPage)), safeTotal)
  const half = Math.floor(visible / 2)
  const maxStart = safeTotal - visible + 1
  const start = Math.max(1, Math.min(current - half, maxStart))

  return Array.from({ length: visible }, (_, index) => start + index)
}
