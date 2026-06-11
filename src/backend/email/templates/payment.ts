import { escapeEmailHtml } from '@/backend/email/sanitize'
import {
  emailLayoutColors,
  renderEmailButton,
  renderEmailLayout,
  renderKeyValueRows,
  renderTextLayout,
} from '@/backend/email/templates/base'
import type { PaymentConfirmedCustomerPayload, RenderedEmail } from '@/backend/email/types'
import { formatPrice } from '@/backend/utils'

/**
 * Only enqueued by the trusted admin payment flow after the backend records
 * a PAID state. Never reachable from a client request or query parameter.
 */
export function renderPaymentConfirmedCustomerEmail(
  payload: PaymentConfirmedCustomerPayload,
  appUrl: string,
): RenderedEmail {
  const subject = `Payment received for order ${payload.orderNumber}`
  const orderLink = `${appUrl}/account/orders/${encodeURIComponent(payload.orderId)}`
  const message = payload.paidOnDelivery
    ? 'We have recorded your cash payment received on delivery. Thank you!'
    : 'We have recorded your payment for this order. Thank you!'

  const bodyHtml = `
<h1 style="margin:0 0 12px 0;font-size:19px;color:${emailLayoutColors.text};">Payment received</h1>
<p style="margin:0 0 16px 0;">Hi ${escapeEmailHtml(payload.customerName)}, ${escapeEmailHtml(message)}</p>
${renderKeyValueRows([
  ['Order number', payload.orderNumber],
  ['Amount', formatPrice(payload.total, 'BDT')],
  ['Payment method', payload.paymentMethodLabel],
])}
${renderEmailButton(orderLink, 'View your order')}`

  const text = renderTextLayout([
    `Hi ${payload.customerName},`,
    '',
    message,
    '',
    `Order number: ${payload.orderNumber}`,
    `Amount: ${formatPrice(payload.total, 'BDT')}`,
    `Payment method: ${payload.paymentMethodLabel}`,
    '',
    `View your order: ${orderLink}`,
  ])

  return {
    subject,
    html: renderEmailLayout({ title: subject, preheader: message, bodyHtml }),
    text,
  }
}
