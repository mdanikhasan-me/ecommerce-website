import { OrderStatus, ReturnStatus, ReviewStatus } from '@prisma/client'

const MAX_ADMIN_LIST_PAGE = 100_000
const PLAIN_INT_PATTERN = /^\d+$/

/**
 * Parses an admin list `page` query value into a safe positive integer.
 * Guards against the `parseInt(NaN)` -> `skip: NaN` crash on inputs like
 * `?page=abc` or `?page=-3`.
 */
export function parseAdminListPage(value: string | null | undefined): number {
  const normalized = value?.trim()
  if (!normalized || !PLAIN_INT_PATTERN.test(normalized)) return 1
  const parsed = Number(normalized)
  if (!Number.isSafeInteger(parsed) || parsed < 1) return 1
  return Math.min(parsed, MAX_ADMIN_LIST_PAGE)
}

function parseEnumFilter<T extends Record<string, string>>(
  enumObject: T,
  value: string | null | undefined,
): T[keyof T] | undefined {
  const normalized = value?.trim()
  if (!normalized) return undefined
  return (Object.values(enumObject) as string[]).includes(normalized)
    ? (normalized as T[keyof T])
    : undefined
}

/** Validates an order-status filter; invalid values become "no filter" instead of a 500. */
export function parseOrderStatusFilter(value: string | null | undefined): OrderStatus | undefined {
  return parseEnumFilter(OrderStatus, value)
}

export function parseReviewStatusFilter(value: string | null | undefined): ReviewStatus | undefined {
  return parseEnumFilter(ReviewStatus, value)
}

export function parseReturnStatusFilter(value: string | null | undefined): ReturnStatus | undefined {
  return parseEnumFilter(ReturnStatus, value)
}
