import type { EmailEventType } from '@prisma/client'
import {
  renderOrderPlacedAdminEmail,
  renderOrderPlacedCustomerEmail,
  renderOrderStatusCustomerEmail,
} from '@/backend/email/templates/orders'
import { renderPaymentConfirmedCustomerEmail } from '@/backend/email/templates/payment'
import {
  renderReturnRequestedAdminEmail,
  renderReturnStatusCustomerEmail,
} from '@/backend/email/templates/returns'
import type {
  EmailOutboxPayload,
  OrderPlacedAdminPayload,
  OrderPlacedCustomerPayload,
  OrderStatusCustomerPayload,
  PaymentConfirmedCustomerPayload,
  RenderedEmail,
  ReturnRequestedAdminPayload,
  ReturnStatusCustomerPayload,
} from '@/backend/email/types'

/**
 * Renders an outbox record's stored payload at send time. Throws on unknown
 * event types or malformed payloads; the processor converts that into a
 * non-retryable template_error.
 */
export function renderEmailForOutbox(
  eventType: EmailEventType,
  payload: unknown,
  appUrl: string,
): RenderedEmail {
  const data = payload as EmailOutboxPayload

  if (!data || typeof data !== 'object' || (data as { schemaVersion?: unknown }).schemaVersion !== 1) {
    throw new Error('Unsupported email payload schema')
  }

  switch (eventType) {
    case 'ORDER_PLACED_CUSTOMER':
      return renderOrderPlacedCustomerEmail(data as OrderPlacedCustomerPayload, appUrl)
    case 'ORDER_PLACED_ADMIN':
      return renderOrderPlacedAdminEmail(data as OrderPlacedAdminPayload, appUrl)
    case 'ORDER_STATUS_CUSTOMER':
      return renderOrderStatusCustomerEmail(data as OrderStatusCustomerPayload, appUrl)
    case 'PAYMENT_CONFIRMED_CUSTOMER':
      return renderPaymentConfirmedCustomerEmail(data as PaymentConfirmedCustomerPayload, appUrl)
    case 'RETURN_REQUESTED_ADMIN':
      return renderReturnRequestedAdminEmail(data as ReturnRequestedAdminPayload, appUrl)
    case 'RETURN_STATUS_CUSTOMER':
      return renderReturnStatusCustomerEmail(data as ReturnStatusCustomerPayload, appUrl)
    default:
      throw new Error('Unknown email event type')
  }
}
