import { escapeEmailHtml } from '@/backend/email/sanitize'
import {
  emailLayoutColors,
  renderEmailButton,
  renderEmailLayout,
  renderKeyValueRows,
  renderTextLayout,
} from '@/backend/email/templates/base'
import type {
  OrderPlacedAdminPayload,
  OrderPlacedCustomerPayload,
  OrderStatusCustomerPayload,
  RenderedEmail,
} from '@/backend/email/types'
import { formatPrice } from '@/backend/utils'

function formatBdt(amount: number): string {
  return formatPrice(amount, 'BDT')
}

function formatOrderDate(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function renderItemsTable(payload: OrderPlacedCustomerPayload): string {
  const rows = payload.items
    .map((item) => {
      const variant = item.variantName
        ? `<br><span style="color:${emailLayoutColors.muted};font-size:12px;">${escapeEmailHtml(item.variantName)}</span>`
        : ''
      return `<tr>
<td style="padding:8px 8px 8px 0;border-bottom:1px solid ${emailLayoutColors.border};word-break:break-word;">${escapeEmailHtml(item.name)}${variant}</td>
<td style="padding:8px;border-bottom:1px solid ${emailLayoutColors.border};text-align:center;white-space:nowrap;">× ${escapeEmailHtml(item.quantity)}</td>
<td style="padding:8px 0 8px 8px;border-bottom:1px solid ${emailLayoutColors.border};text-align:right;white-space:nowrap;">${escapeEmailHtml(formatBdt(item.lineTotal))}</td>
</tr>`
    })
    .join('')

  const totals: Array<[string, string, boolean]> = [
    ['Subtotal', formatBdt(payload.subtotal), false],
    ...(payload.discount > 0 ? ([['Discount', `- ${formatBdt(payload.discount)}`, false]] as Array<[string, string, boolean]>) : []),
    ['Shipping', payload.shippingFee === 0 ? 'Free' : formatBdt(payload.shippingFee), false],
    ['Total', formatBdt(payload.total), true],
  ]

  const totalRows = totals
    .map(
      ([label, value, strong]) =>
        `<tr><td colspan="2" style="padding:6px 8px 0 0;text-align:right;color:${strong ? emailLayoutColors.text : emailLayoutColors.muted};${strong ? 'font-weight:bold;font-size:15px;padding-top:10px;' : ''}">${escapeEmailHtml(label)}</td><td style="padding:6px 0 0 8px;text-align:right;white-space:nowrap;${strong ? 'font-weight:bold;font-size:15px;padding-top:10px;' : ''}">${escapeEmailHtml(value)}</td></tr>`,
    )
    .join('')

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;margin:14px 0;">
<tr>
<th align="left" style="padding:0 8px 6px 0;color:${emailLayoutColors.muted};font-weight:normal;font-size:12px;text-transform:uppercase;">Item</th>
<th style="padding:0 8px 6px 8px;color:${emailLayoutColors.muted};font-weight:normal;font-size:12px;text-transform:uppercase;">Qty</th>
<th align="right" style="padding:0 0 6px 8px;color:${emailLayoutColors.muted};font-weight:normal;font-size:12px;text-transform:uppercase;">Amount</th>
</tr>
${rows}
${totalRows}
</table>`
}

export function renderOrderPlacedCustomerEmail(
  payload: OrderPlacedCustomerPayload,
  appUrl: string,
): RenderedEmail {
  const subject = `We received your order ${payload.orderNumber}`
  const orderLink = `${appUrl}/account/orders/${encodeURIComponent(payload.orderId)}`
  const orderDate = formatOrderDate(payload.orderDate)

  const bodyHtml = `
<h1 style="margin:0 0 12px 0;font-size:19px;color:${emailLayoutColors.text};">We received your order</h1>
<p style="margin:0 0 16px 0;">Hi ${escapeEmailHtml(payload.customerName)}, thank you for shopping with Boilabin. Your order has been received and is now waiting to be confirmed.</p>
${renderKeyValueRows([
  ['Order number', payload.orderNumber],
  ...(orderDate ? ([['Order date', orderDate]] as Array<[string, string]>) : []),
  ['Payment method', payload.paymentMethodLabel],
  ['Payment status', payload.paymentStateLabel],
  ['Delivery address', payload.addressSummary],
])}
${renderItemsTable(payload)}
<p style="margin:0 0 4px 0;"><strong>What happens next?</strong></p>
<p style="margin:0 0 8px 0;color:${emailLayoutColors.muted};">We will confirm your order and email you again when its status changes.</p>
${renderEmailButton(orderLink, 'View your order')}`

  const text = renderTextLayout([
    `Hi ${payload.customerName},`,
    '',
    'We received your order. Thank you for shopping with Boilabin.',
    '',
    `Order number: ${payload.orderNumber}`,
    ...(orderDate ? [`Order date: ${orderDate}`] : []),
    `Payment method: ${payload.paymentMethodLabel}`,
    `Payment status: ${payload.paymentStateLabel}`,
    `Delivery address: ${payload.addressSummary}`,
    '',
    'Items:',
    ...payload.items.map(
      (item) =>
        `- ${item.name}${item.variantName ? ` (${item.variantName})` : ''} x ${item.quantity} = ${formatBdt(item.lineTotal)}`,
    ),
    '',
    `Subtotal: ${formatBdt(payload.subtotal)}`,
    ...(payload.discount > 0 ? [`Discount: - ${formatBdt(payload.discount)}`] : []),
    `Shipping: ${payload.shippingFee === 0 ? 'Free' : formatBdt(payload.shippingFee)}`,
    `Total: ${formatBdt(payload.total)}`,
    '',
    'What happens next? We will confirm your order and email you again when its status changes.',
    '',
    `View your order: ${orderLink}`,
  ])

  return {
    subject,
    html: renderEmailLayout({
      title: subject,
      preheader: `Order ${payload.orderNumber} received — total ${formatBdt(payload.total)}`,
      bodyHtml,
    }),
    text,
  }
}

export function renderOrderPlacedAdminEmail(
  payload: OrderPlacedAdminPayload,
  appUrl: string,
): RenderedEmail {
  const subject = `New order ${payload.orderNumber} — ${formatBdt(payload.total)}`
  const adminLink = `${appUrl}/admin/orders/${encodeURIComponent(payload.orderId)}`
  const orderDate = formatOrderDate(payload.orderDate)

  const bodyHtml = `
<h1 style="margin:0 0 12px 0;font-size:19px;color:${emailLayoutColors.text};">New order received</h1>
${renderKeyValueRows([
  ['Order number', payload.orderNumber],
  ...(orderDate ? ([['Placed', orderDate]] as Array<[string, string]>) : []),
  ['Items', String(payload.itemCount)],
  ['Total', formatBdt(payload.total)],
  ['Payment', `${payload.paymentMethodLabel} — ${payload.paymentStateLabel}`],
  ['Customer', payload.customerName],
  ['Phone', payload.customerPhone],
  ['Delivery area', payload.deliveryArea],
])}
<p style="margin:12px 0 0 0;color:${emailLayoutColors.muted};">The full delivery address and order controls are in the admin panel.</p>
${renderEmailButton(adminLink, 'Open order in admin')}`

  const text = renderTextLayout([
    'New order received.',
    '',
    `Order number: ${payload.orderNumber}`,
    ...(orderDate ? [`Placed: ${orderDate}`] : []),
    `Items: ${payload.itemCount}`,
    `Total: ${formatBdt(payload.total)}`,
    `Payment: ${payload.paymentMethodLabel} — ${payload.paymentStateLabel}`,
    `Customer: ${payload.customerName}`,
    `Phone: ${payload.customerPhone}`,
    `Delivery area: ${payload.deliveryArea}`,
    '',
    'The full delivery address and order controls are in the admin panel.',
    `Open order: ${adminLink}`,
  ])

  return {
    subject,
    html: renderEmailLayout({
      title: subject,
      preheader: `${payload.customerName} placed an order for ${formatBdt(payload.total)}`,
      bodyHtml,
    }),
    text,
  }
}

const STATUS_CONTENT: Record<
  OrderStatusCustomerPayload['status'],
  { subject: (orderNumber: string) => string; heading: string; message: string }
> = {
  CONFIRMED: {
    subject: (orderNumber) => `Your order ${orderNumber} is confirmed`,
    heading: 'Order confirmed',
    message: 'Good news — your order has been confirmed and is being prepared.',
  },
  PACKED: {
    subject: (orderNumber) => `Your order ${orderNumber} is packed`,
    heading: 'Order packed',
    message: 'Your order has been packed and will be handed to delivery soon.',
  },
  SHIPPED: {
    subject: (orderNumber) => `Your order ${orderNumber} is on the way`,
    heading: 'Order shipped',
    message: 'Your order is on the way to your delivery address.',
  },
  DELIVERED: {
    subject: (orderNumber) => `Your order ${orderNumber} was delivered`,
    heading: 'Order delivered',
    message: 'Your order has been delivered. We hope you enjoy it!',
  },
  CANCELLED: {
    subject: (orderNumber) => `Your order ${orderNumber} was cancelled`,
    heading: 'Order cancelled',
    message:
      'Your order has been cancelled. If you did not expect this, please contact support and we will help.',
  },
}

export function renderOrderStatusCustomerEmail(
  payload: OrderStatusCustomerPayload,
  appUrl: string,
): RenderedEmail {
  const content = STATUS_CONTENT[payload.status]
  const subject = content.subject(payload.orderNumber)
  const orderLink = `${appUrl}/account/orders/${encodeURIComponent(payload.orderId)}`

  const rows: Array<[string, string]> = [
    ['Order number', payload.orderNumber],
    ['Order total', formatBdt(payload.total)],
    ['Payment', `${payload.paymentMethodLabel} — ${payload.paymentStateLabel}`],
  ]
  if (payload.status === 'SHIPPED' && payload.trackingNumber) {
    rows.push(['Tracking number', payload.trackingNumber])
  }

  const bodyHtml = `
<h1 style="margin:0 0 12px 0;font-size:19px;color:${emailLayoutColors.text};">${escapeEmailHtml(content.heading)}</h1>
<p style="margin:0 0 16px 0;">Hi ${escapeEmailHtml(payload.customerName)}, ${escapeEmailHtml(content.message)}</p>
${renderKeyValueRows(rows)}
${renderEmailButton(orderLink, 'View your order')}`

  const text = renderTextLayout([
    `Hi ${payload.customerName},`,
    '',
    content.message,
    '',
    `Order number: ${payload.orderNumber}`,
    `Order total: ${formatBdt(payload.total)}`,
    `Payment: ${payload.paymentMethodLabel} — ${payload.paymentStateLabel}`,
    ...(payload.status === 'SHIPPED' && payload.trackingNumber
      ? [`Tracking number: ${payload.trackingNumber}`]
      : []),
    '',
    `View your order: ${orderLink}`,
  ])

  return {
    subject,
    html: renderEmailLayout({ title: subject, preheader: content.message, bodyHtml }),
    text,
  }
}
