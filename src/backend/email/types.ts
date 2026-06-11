export type EmailErrorCategory =
  | 'configuration'
  | 'authentication'
  | 'rate_limited'
  | 'temporary_provider_failure'
  | 'invalid_recipient'
  | 'permanent_provider_rejection'
  | 'timeout'
  | 'template_error'
  | 'disabled'
  | 'unknown'

export type EmailAddress = {
  email: string
  name?: string
}

export type TransactionalEmailMessage = {
  to: EmailAddress
  subject: string
  html: string
  text: string
  replyTo?: EmailAddress
  /** Non-sensitive internal identifiers only (e.g. event type). */
  tags?: string[]
}

export type EmailProviderResult =
  | { ok: true; providerMessageId: string | null }
  | { ok: false; category: EmailErrorCategory; retryable: boolean; safeError: string }

export interface TransactionalEmailProvider {
  readonly name: string
  send(message: TransactionalEmailMessage): Promise<EmailProviderResult>
}

export type RenderedEmail = {
  subject: string
  html: string
  text: string
}

/** Versioned, PII-minimized snapshots stored in EmailOutbox.payload. */

export type OrderEmailItemSnapshot = {
  name: string
  variantName: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type OrderPlacedCustomerPayload = {
  schemaVersion: 1
  orderId: string
  orderNumber: string
  orderDate: string
  items: OrderEmailItemSnapshot[]
  subtotal: number
  discount: number
  shippingFee: number
  total: number
  currency: 'BDT'
  paymentMethodLabel: string
  paymentStateLabel: string
  customerName: string
  addressSummary: string
}

export type OrderPlacedAdminPayload = {
  schemaVersion: 1
  orderId: string
  orderNumber: string
  orderDate: string
  itemCount: number
  total: number
  currency: 'BDT'
  paymentMethodLabel: string
  paymentStateLabel: string
  customerName: string
  customerPhone: string
  deliveryArea: string
}

export type OrderStatusCustomerPayload = {
  schemaVersion: 1
  orderId: string
  orderNumber: string
  status: 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  customerName: string
  total: number
  currency: 'BDT'
  paymentMethodLabel: string
  paymentStateLabel: string
  trackingNumber: string | null
}

export type PaymentConfirmedCustomerPayload = {
  schemaVersion: 1
  orderId: string
  orderNumber: string
  customerName: string
  total: number
  currency: 'BDT'
  paymentMethodLabel: string
  paidOnDelivery: boolean
}

export type ReturnRequestedAdminPayload = {
  schemaVersion: 1
  orderId: string
  orderNumber: string
  customerName: string
  reason: string
}

export type ReturnStatusCustomerPayload = {
  schemaVersion: 1
  orderId: string
  orderNumber: string
  customerName: string
  returnStatus: 'APPROVED' | 'REJECTED' | 'PICKED_UP' | 'INSPECTED' | 'REFUNDED'
  refundRecorded: boolean
}

export type EmailOutboxPayload =
  | OrderPlacedCustomerPayload
  | OrderPlacedAdminPayload
  | OrderStatusCustomerPayload
  | PaymentConfirmedCustomerPayload
  | ReturnRequestedAdminPayload
  | ReturnStatusCustomerPayload
