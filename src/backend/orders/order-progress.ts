export const ORDER_PROGRESS_STEPS = [
  { key: 'PENDING', label: 'Order placed' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PACKED', label: 'Packed' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
] as const

export type OrderProgressTone = 'active' | 'cancelled' | 'return'

export type OrderProgressState = {
  currentIndex: number
  completedIndex: number
  progressWidthClass: 'w-0' | 'w-1/4' | 'w-2/4' | 'w-3/4' | 'w-full'
  tone: OrderProgressTone
}

const SUCCESS_STATUS_INDEX: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PACKED: 2,
  SHIPPED: 3,
  DELIVERED: 4,
}

const RETURN_STATUSES = new Set(['RETURN_REQUESTED', 'RETURNED', 'REFUND_REQUESTED', 'REFUNDED'])

const PROGRESS_WIDTH_CLASSES: OrderProgressState['progressWidthClass'][] = [
  'w-0',
  'w-1/4',
  'w-2/4',
  'w-3/4',
  'w-full',
]

export function getOrderProgressState(status: string): OrderProgressState {
  const normalizedStatus = status.toUpperCase()

  if (normalizedStatus === 'CANCELLED') {
    return {
      currentIndex: 0,
      completedIndex: 0,
      progressWidthClass: PROGRESS_WIDTH_CLASSES[0],
      tone: 'cancelled',
    }
  }

  if (RETURN_STATUSES.has(normalizedStatus)) {
    return {
      currentIndex: 4,
      completedIndex: 4,
      progressWidthClass: PROGRESS_WIDTH_CLASSES[4],
      tone: 'return',
    }
  }

  const statusIndex = SUCCESS_STATUS_INDEX[normalizedStatus] ?? 0
  return {
    currentIndex: statusIndex,
    completedIndex: statusIndex,
    progressWidthClass: PROGRESS_WIDTH_CLASSES[statusIndex],
    tone: 'active',
  }
}

export function isOrderProgressStepComplete(state: OrderProgressState, index: number) {
  return index <= state.completedIndex
}

export function isOrderProgressStepCurrent(state: OrderProgressState, index: number) {
  return index === state.currentIndex
}
