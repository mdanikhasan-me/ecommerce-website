import { escapeEmailHtml } from '@/backend/email/sanitize'
import {
  emailLayoutColors,
  renderEmailButton,
  renderEmailLayout,
  renderKeyValueRows,
  renderTextLayout,
} from '@/backend/email/templates/base'
import type {
  RenderedEmail,
  ReturnRequestedAdminPayload,
  ReturnStatusCustomerPayload,
} from '@/backend/email/types'

export function renderReturnRequestedAdminEmail(
  payload: ReturnRequestedAdminPayload,
  appUrl: string,
): RenderedEmail {
  const subject = `Return requested for order ${payload.orderNumber}`
  const adminLink = `${appUrl}/admin/returns`

  const bodyHtml = `
<h1 style="margin:0 0 12px 0;font-size:19px;color:${emailLayoutColors.text};">Return requested</h1>
<p style="margin:0 0 16px 0;">A customer has requested a return. Please review it in the admin panel.</p>
${renderKeyValueRows([
  ['Order number', payload.orderNumber],
  ['Customer', payload.customerName],
  ['Reason', payload.reason],
])}
${renderEmailButton(adminLink, 'Review return requests')}`

  const text = renderTextLayout([
    'A customer has requested a return.',
    '',
    `Order number: ${payload.orderNumber}`,
    `Customer: ${payload.customerName}`,
    `Reason: ${payload.reason}`,
    '',
    `Review return requests: ${adminLink}`,
  ])

  return {
    subject,
    html: renderEmailLayout({ title: subject, preheader: `Return requested for ${payload.orderNumber}`, bodyHtml }),
    text,
  }
}

const RETURN_STATUS_CONTENT: Record<
  ReturnStatusCustomerPayload['returnStatus'],
  { subject: (orderNumber: string) => string; heading: string; message: string }
> = {
  APPROVED: {
    subject: (orderNumber) => `Your return for order ${orderNumber} is approved`,
    heading: 'Return approved',
    message: 'Your return request has been approved. We will arrange the pickup of your item.',
  },
  REJECTED: {
    subject: (orderNumber) => `Update on your return for order ${orderNumber}`,
    heading: 'Return request reviewed',
    message:
      'After review, your return request could not be approved this time. If you have questions, please contact support.',
  },
  PICKED_UP: {
    subject: (orderNumber) => `Your return for order ${orderNumber} was picked up`,
    heading: 'Return picked up',
    message: 'Your returned item has been picked up and is on its way back to us.',
  },
  INSPECTED: {
    subject: (orderNumber) => `Your return for order ${orderNumber} is being inspected`,
    heading: 'Return received',
    message: 'We received your returned item and it is now being inspected.',
  },
  REFUNDED: {
    subject: (orderNumber) => `Your refund for order ${orderNumber} is recorded`,
    heading: 'Refund recorded',
    message: 'Your return is complete and the refund has been recorded for this order.',
  },
}

export function renderReturnStatusCustomerEmail(
  payload: ReturnStatusCustomerPayload,
  appUrl: string,
): RenderedEmail {
  const content = RETURN_STATUS_CONTENT[payload.returnStatus]
  const subject = content.subject(payload.orderNumber)
  const orderLink = `${appUrl}/account/orders/${encodeURIComponent(payload.orderId)}`

  // Refund wording is only available when the backend actually recorded it.
  const message =
    payload.returnStatus === 'REFUNDED' && !payload.refundRecorded
      ? 'Your return is complete.'
      : content.message

  const bodyHtml = `
<h1 style="margin:0 0 12px 0;font-size:19px;color:${emailLayoutColors.text};">${escapeEmailHtml(content.heading)}</h1>
<p style="margin:0 0 16px 0;">Hi ${escapeEmailHtml(payload.customerName)}, ${escapeEmailHtml(message)}</p>
${renderKeyValueRows([['Order number', payload.orderNumber]])}
${renderEmailButton(orderLink, 'View your order')}`

  const text = renderTextLayout([
    `Hi ${payload.customerName},`,
    '',
    message,
    '',
    `Order number: ${payload.orderNumber}`,
    '',
    `View your order: ${orderLink}`,
  ])

  return {
    subject,
    html: renderEmailLayout({ title: subject, preheader: message, bodyHtml }),
    text,
  }
}
