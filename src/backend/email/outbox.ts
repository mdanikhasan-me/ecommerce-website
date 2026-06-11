import type { EmailEventType, OrderStatus, PaymentStatus, ReturnStatus } from '@prisma/client'
import { getOrderNotificationEmail } from '@/backend/email/config'
import { cleanEmailText, isValidEmailAddress, normalizeEmailAddress } from '@/backend/email/sanitize'
import type {
  OrderPlacedAdminPayload,
  OrderPlacedCustomerPayload,
  OrderStatusCustomerPayload,
  PaymentConfirmedCustomerPayload,
  ReturnRequestedAdminPayload,
  ReturnStatusCustomerPayload,
} from '@/backend/email/types'

/**
 * Minimal transaction surface needed to enqueue emails. Matches the delegate
 * shape used by the order pipeline's typed transaction clients, so enqueueing
 * always happens inside the same database transaction as the order change.
 */
export type EmailEnqueueTx = {
  emailOutbox: {
    createMany: (args: {
      data: Array<{
        eventType: EmailEventType
        dedupeKey: string
        orderId: string
        recipient: string
        payload: object
      }>
      skipDuplicates: boolean
    }) => Promise<{ count: number }>
  }
}

const STATUS_EMAIL_STATUSES = ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
type StatusEmailStatus = (typeof STATUS_EMAIL_STATUSES)[number]

const RETURN_EMAIL_STATUSES = ['APPROVED', 'REJECTED', 'PICKED_UP', 'INSPECTED', 'REFUNDED'] as const
type ReturnEmailStatus = (typeof RETURN_EMAIL_STATUSES)[number]

export function isStatusEmailStatus(status: OrderStatus): status is StatusEmailStatus {
  return (STATUS_EMAIL_STATUSES as readonly string[]).includes(status)
}

export function isReturnEmailStatus(status: ReturnStatus): status is ReturnEmailStatus {
  return (RETURN_EMAIL_STATUSES as readonly string[]).includes(status)
}

export const orderEmailDedupeKeys = {
  placedCustomer: (orderId: string) => `order:${orderId}:placed:customer`,
  placedAdmin: (orderId: string) => `order:${orderId}:placed:admin`,
  statusCustomer: (orderId: string, status: StatusEmailStatus) => `order:${orderId}:status:${status}:customer`,
  paymentConfirmedCustomer: (orderId: string) => `order:${orderId}:payment:PAID:customer`,
  returnRequestedAdmin: (orderId: string) => `order:${orderId}:return:requested:admin`,
  returnStatusCustomer: (orderId: string, status: ReturnEmailStatus) => `order:${orderId}:return:${status}:customer`,
} as const

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: 'Cash on Delivery',
  BKASH: 'bKash',
  NAGAD: 'Nagad',
  STRIPE: 'International Card',
  BANK_TRANSFER: 'Bank Transfer',
}

export function getPaymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method] ?? 'Cash on Delivery'
}

/** Truthful payment wording. COD is never described as paid up front. */
export function getPaymentStateLabel(method: string, paymentStatus: PaymentStatus): string {
  if (paymentStatus === 'PAID') return 'Paid'
  if (paymentStatus === 'REFUNDED') return 'Refunded'
  if (paymentStatus === 'PARTIALLY_REFUNDED') return 'Partially refunded'
  if (paymentStatus === 'FAILED') return 'Payment failed'
  return method === 'CASH_ON_DELIVERY' ? 'Payable on delivery' : 'Pending'
}

type OrderEmailSource = {
  orderId: string
  orderNumber: string
  createdAt: Date
  subtotal: number
  discount: number
  shippingFee: number
  total: number
  paymentMethod: string
  paymentStatus: PaymentStatus
  customerEmail: string
  customerName: string | null
  address: {
    fullName: string
    phone: string
    city: string
    district: string
    division: string
  }
  items: Array<{
    productName: string
    variantName: string | null
    quantity: number
    price: number
    total: number
  }>
}

function safeCustomerName(name: string | null | undefined, fallback: string): string {
  const cleaned = cleanEmailText(name, 80)
  return cleaned || fallback
}

function buildAddressSummary(address: OrderEmailSource['address']): string {
  return cleanEmailText(
    `${address.fullName}, ${address.city}, ${address.district}, ${address.division}`,
    200,
  )
}

function buildDeliveryArea(address: OrderEmailSource['address']): string {
  return cleanEmailText(`${address.city}, ${address.district}`, 120)
}

/**
 * Enqueues the customer confirmation and admin notification for a freshly
 * committed order. Must be called with the order-creation transaction client.
 * Unique dedupe keys plus skipDuplicates make replays a no-op.
 */
export async function enqueueOrderPlacedEmails(tx: EmailEnqueueTx, source: OrderEmailSource) {
  const customerRecipient = normalizeEmailAddress(source.customerEmail)
  const customerName = safeCustomerName(source.customerName, source.address.fullName)
  const paymentMethodLabel = getPaymentMethodLabel(source.paymentMethod)
  const paymentStateLabel = getPaymentStateLabel(source.paymentMethod, source.paymentStatus)

  const customerPayload: OrderPlacedCustomerPayload = {
    schemaVersion: 1,
    orderId: source.orderId,
    orderNumber: source.orderNumber,
    orderDate: source.createdAt.toISOString(),
    items: source.items.map((item) => ({
      name: cleanEmailText(item.productName, 160),
      variantName: item.variantName ? cleanEmailText(item.variantName, 120) : null,
      quantity: item.quantity,
      unitPrice: item.price,
      lineTotal: item.total,
    })),
    subtotal: source.subtotal,
    discount: source.discount,
    shippingFee: source.shippingFee,
    total: source.total,
    currency: 'BDT',
    paymentMethodLabel,
    paymentStateLabel,
    customerName,
    addressSummary: buildAddressSummary(source.address),
  }

  const adminPayload: OrderPlacedAdminPayload = {
    schemaVersion: 1,
    orderId: source.orderId,
    orderNumber: source.orderNumber,
    orderDate: source.createdAt.toISOString(),
    itemCount: source.items.reduce((count, item) => count + item.quantity, 0),
    total: source.total,
    currency: 'BDT',
    paymentMethodLabel,
    paymentStateLabel,
    customerName,
    customerPhone: cleanEmailText(source.address.phone, 30),
    deliveryArea: buildDeliveryArea(source.address),
  }

  const events: Parameters<EmailEnqueueTx['emailOutbox']['createMany']>[0]['data'] = []

  if (isValidEmailAddress(customerRecipient)) {
    events.push({
      eventType: 'ORDER_PLACED_CUSTOMER',
      dedupeKey: orderEmailDedupeKeys.placedCustomer(source.orderId),
      orderId: source.orderId,
      recipient: customerRecipient,
      payload: customerPayload,
    })
  }

  events.push({
    eventType: 'ORDER_PLACED_ADMIN',
    dedupeKey: orderEmailDedupeKeys.placedAdmin(source.orderId),
    orderId: source.orderId,
    recipient: getOrderNotificationEmail(),
    payload: adminPayload,
  })

  return tx.emailOutbox.createMany({ data: events, skipDuplicates: true })
}

/**
 * Enqueues a customer status email for a real transition. Reapplying the same
 * status hits the same dedupe key and is skipped at the database level.
 */
export async function enqueueOrderStatusEmail(
  tx: EmailEnqueueTx,
  source: {
    orderId: string
    orderNumber: string
    status: OrderStatus
    total: number
    paymentMethod: string
    paymentStatus: PaymentStatus
    trackingNumber: string | null
    customerEmail: string
    customerName: string | null
  },
) {
  if (!isStatusEmailStatus(source.status)) return { count: 0 }
  const recipient = normalizeEmailAddress(source.customerEmail)
  if (!isValidEmailAddress(recipient)) return { count: 0 }

  const payload: OrderStatusCustomerPayload = {
    schemaVersion: 1,
    orderId: source.orderId,
    orderNumber: source.orderNumber,
    status: source.status,
    customerName: safeCustomerName(source.customerName, 'there'),
    total: source.total,
    currency: 'BDT',
    paymentMethodLabel: getPaymentMethodLabel(source.paymentMethod),
    paymentStateLabel: getPaymentStateLabel(source.paymentMethod, source.paymentStatus),
    trackingNumber: source.trackingNumber ? cleanEmailText(source.trackingNumber, 60) : null,
  }

  return tx.emailOutbox.createMany({
    data: [
      {
        eventType: 'ORDER_STATUS_CUSTOMER',
        dedupeKey: orderEmailDedupeKeys.statusCustomer(source.orderId, source.status),
        orderId: source.orderId,
        recipient,
        payload,
      },
    ],
    skipDuplicates: true,
  })
}

/** Enqueued only by the trusted admin payment flow when PAID is recorded. */
export async function enqueuePaymentConfirmedEmail(
  tx: EmailEnqueueTx,
  source: {
    orderId: string
    orderNumber: string
    total: number
    paymentMethod: string
    customerEmail: string
    customerName: string | null
  },
) {
  const recipient = normalizeEmailAddress(source.customerEmail)
  if (!isValidEmailAddress(recipient)) return { count: 0 }

  const payload: PaymentConfirmedCustomerPayload = {
    schemaVersion: 1,
    orderId: source.orderId,
    orderNumber: source.orderNumber,
    customerName: safeCustomerName(source.customerName, 'there'),
    total: source.total,
    currency: 'BDT',
    paymentMethodLabel: getPaymentMethodLabel(source.paymentMethod),
    paidOnDelivery: source.paymentMethod === 'CASH_ON_DELIVERY',
  }

  return tx.emailOutbox.createMany({
    data: [
      {
        eventType: 'PAYMENT_CONFIRMED_CUSTOMER',
        dedupeKey: orderEmailDedupeKeys.paymentConfirmedCustomer(source.orderId),
        orderId: source.orderId,
        recipient,
        payload,
      },
    ],
    skipDuplicates: true,
  })
}

export async function enqueueReturnRequestedAdminEmail(
  tx: EmailEnqueueTx,
  source: {
    orderId: string
    orderNumber: string
    customerName: string | null
    reason: string
  },
) {
  const payload: ReturnRequestedAdminPayload = {
    schemaVersion: 1,
    orderId: source.orderId,
    orderNumber: source.orderNumber,
    customerName: safeCustomerName(source.customerName, 'Customer'),
    reason: cleanEmailText(source.reason, 200),
  }

  return tx.emailOutbox.createMany({
    data: [
      {
        eventType: 'RETURN_REQUESTED_ADMIN',
        dedupeKey: orderEmailDedupeKeys.returnRequestedAdmin(source.orderId),
        orderId: source.orderId,
        recipient: getOrderNotificationEmail(),
        payload,
      },
    ],
    skipDuplicates: true,
  })
}

export async function enqueueReturnStatusCustomerEmail(
  tx: EmailEnqueueTx,
  source: {
    orderId: string
    orderNumber: string
    returnStatus: ReturnStatus
    refundRecorded: boolean
    customerEmail: string
    customerName: string | null
  },
) {
  if (!isReturnEmailStatus(source.returnStatus)) return { count: 0 }
  const recipient = normalizeEmailAddress(source.customerEmail)
  if (!isValidEmailAddress(recipient)) return { count: 0 }

  const payload: ReturnStatusCustomerPayload = {
    schemaVersion: 1,
    orderId: source.orderId,
    orderNumber: source.orderNumber,
    customerName: safeCustomerName(source.customerName, 'there'),
    returnStatus: source.returnStatus,
    refundRecorded: source.refundRecorded,
  }

  return tx.emailOutbox.createMany({
    data: [
      {
        eventType: 'RETURN_STATUS_CUSTOMER',
        dedupeKey: orderEmailDedupeKeys.returnStatusCustomer(source.orderId, source.returnStatus),
        orderId: source.orderId,
        recipient,
        payload,
      },
    ],
    skipDuplicates: true,
  })
}
