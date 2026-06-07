export const DEFAULT_ORDER_LIST_PAGE = 1
export const MAX_ORDER_LIST_PAGE = 1000
export const ORDER_LIST_PAGE_SIZE = 20

const PLAIN_INTEGER_PATTERN = /^\d+$/

export function parseOrderListPage(value: string | null | undefined): number {
  const normalized = value?.trim()
  if (!normalized || !PLAIN_INTEGER_PATTERN.test(normalized)) return DEFAULT_ORDER_LIST_PAGE

  const parsed = Number(normalized)
  if (!Number.isSafeInteger(parsed) || parsed < DEFAULT_ORDER_LIST_PAGE) return DEFAULT_ORDER_LIST_PAGE
  return Math.min(parsed, MAX_ORDER_LIST_PAGE)
}
