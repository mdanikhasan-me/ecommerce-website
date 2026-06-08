import { db } from '@/backend/database'
import { formatDate, formatPrice } from '@/backend/utils'
import { CONTACT_EMAIL, CONTACT_PHONE } from '@/shared/contact'
import type { Prisma } from '@prisma/client'

export const orderInvoiceInclude = {
  items: {
    orderBy: { id: 'asc' },
  },
  address: true,
  coupon: { select: { code: true, name: true } },
} satisfies Prisma.OrderInclude

export type OrderInvoiceRecord = Prisma.OrderGetPayload<{ include: typeof orderInvoiceInclude }>

export type OrderInvoiceContext = {
  order: OrderInvoiceRecord
  customerName: string
  customerEmail: string | null
  supportEmail: string
  supportPhone: string
}

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const PAGE_MARGIN = 48
const PAGE_BOTTOM = 46

type PdfFont = 'regular' | 'bold'

type PdfLine = {
  text: string
  x: number
  y: number
  size: number
  font: PdfFont
}

type WriteOptions = {
  font?: PdfFont
  size?: number
  indent?: number
  gapAfter?: number
}

export function formatOrderInvoiceEnumLabel(value: string) {
  return value
    .split('_')
    .map((part, index) => {
      const lower = part.toLowerCase()
      if (index > 0 && ['on', 'of', 'and', 'to', 'for'].includes(lower)) return lower
      return part.charAt(0) + part.slice(1).toLowerCase()
    })
    .join(' ')
}

export function buildInvoiceDownloadFilename(orderNumber: string) {
  const safeOrderNumber = orderNumber
    .trim()
    .replace(/[^A-Za-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'order'

  return `boilabin-invoice-${safeOrderNumber}.pdf`
}

export function getInvoicePdfDownloadPath(orderId: string) {
  return `/api/account/orders/${encodeURIComponent(orderId)}/invoice`
}

export function buildOrderInvoiceContext(input: {
  order: OrderInvoiceRecord
  sessionUserName?: string | null
  sessionUserEmail?: string | null
}): OrderInvoiceContext {
  const customerName = input.sessionUserName?.trim() || input.order.address?.fullName || 'Customer'
  const customerEmail = input.sessionUserEmail?.trim() || null

  return {
    order: input.order,
    customerName,
    customerEmail,
    supportEmail: CONTACT_EMAIL,
    supportPhone: CONTACT_PHONE,
  }
}

export async function getOwnedOrderInvoiceContext(input: {
  orderId: string
  userId: string
  sessionUserName?: string | null
  sessionUserEmail?: string | null
}) {
  const order = await db.order.findFirst({
    where: { id: input.orderId, userId: input.userId },
    include: orderInvoiceInclude,
  })

  if (!order) return null

  return buildOrderInvoiceContext({
    order,
    sessionUserName: input.sessionUserName,
    sessionUserEmail: input.sessionUserEmail,
  })
}

function cleanPdfText(value: unknown) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapePdfLiteral(value: string) {
  return cleanPdfText(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function wrapPdfText(text: string, maxChars: number) {
  const cleaned = cleanPdfText(text)
  if (!cleaned) return []

  const words = cleaned.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    if (!current) {
      current = word
      continue
    }

    if ((current.length + 1 + word.length) <= maxChars) {
      current += ` ${word}`
    } else {
      lines.push(current)
      current = word
    }
  }

  if (current) lines.push(current)

  return lines.flatMap((line) => {
    if (line.length <= maxChars) return [line]
    const chunks: string[] = []
    for (let index = 0; index < line.length; index += maxChars) {
      chunks.push(line.slice(index, index + maxChars))
    }
    return chunks
  })
}

class PdfTextDocument {
  private pages: PdfLine[][] = [[]]
  private y = PAGE_HEIGHT - PAGE_MARGIN

  private get currentPage() {
    return this.pages[this.pages.length - 1]
  }

  private addPage() {
    this.pages.push([])
    this.y = PAGE_HEIGHT - PAGE_MARGIN
  }

  private ensureLineSpace(lineHeight: number) {
    if (this.y - lineHeight < PAGE_BOTTOM) {
      this.addPage()
    }
  }

  blank(space = 10) {
    this.y -= space
    if (this.y < PAGE_BOTTOM) this.addPage()
  }

  write(text: string, options: WriteOptions = {}) {
    const size = options.size ?? 11
    const font = options.font ?? 'regular'
    const indent = options.indent ?? 0
    const x = PAGE_MARGIN + indent
    const lineHeight = Math.max(size + 4, size * 1.35)
    const maxChars = Math.max(18, Math.floor((PAGE_WIDTH - PAGE_MARGIN * 2 - indent) / (size * 0.52)))
    const lines = wrapPdfText(text, maxChars)

    if (lines.length === 0) return

    for (const line of lines) {
      this.ensureLineSpace(lineHeight)
      this.currentPage.push({ text: line, x, y: this.y, size, font })
      this.y -= lineHeight
    }

    if (options.gapAfter) this.blank(options.gapAfter)
  }

  section(title: string) {
    this.blank(12)
    this.write(title, { font: 'bold', size: 13, gapAfter: 3 })
  }

  keyValue(label: string, value: string | number | null | undefined) {
    const cleaned = cleanPdfText(value)
    if (!cleaned) return
    this.write(`${label}: ${cleaned}`, { size: 10.5 })
  }

  toPages() {
    return this.pages.filter((page) => page.length > 0)
  }
}

function buildInvoicePages(context: OrderInvoiceContext) {
  const { order } = context
  const document = new PdfTextDocument()

  document.write('Boilabin', { font: 'bold', size: 24, gapAfter: 2 })
  document.write('Order Invoice', { font: 'bold', size: 15 })
  document.keyValue('Invoice / Order', order.orderNumber)
  document.keyValue('Placed on', formatDate(order.createdAt))
  document.keyValue('Order status', formatOrderInvoiceEnumLabel(order.status))
  document.keyValue('Payment method', formatOrderInvoiceEnumLabel(order.paymentMethod))
  document.keyValue('Payment status', formatOrderInvoiceEnumLabel(order.paymentStatus))

  document.section('Customer')
  document.keyValue('Name', context.customerName)
  document.keyValue('Email', context.customerEmail)

  document.section('Delivery address')
  if (order.address) {
    document.write(order.address.fullName, { font: 'bold', size: 10.5 })
    document.write(order.address.addressLine1, { size: 10.5 })
    if (order.address.addressLine2) document.write(order.address.addressLine2, { size: 10.5 })
    document.write(`${order.address.city}, ${order.address.district}`, { size: 10.5 })
    document.write(order.address.phone, { size: 10.5 })
  } else {
    document.write('No saved delivery address is attached to this order.', { size: 10.5 })
  }

  document.section('Line items')
  if (order.items.length === 0) {
    document.write('No line items are attached to this order.', { size: 10.5 })
  } else {
    order.items.forEach((item, index) => {
      document.write(`${index + 1}. ${item.productName}`, { font: 'bold', size: 10.8 })
      document.write(`SKU: ${item.productSku}`, { size: 9.8, indent: 12 })
      if (item.variantName) document.write(`Variant: ${item.variantName}`, { size: 9.8, indent: 12 })
      document.write(
        `Qty: ${item.quantity} | Unit: ${formatPrice(item.price, order.currency)} | Line total: ${formatPrice(item.total, order.currency)}`,
        { size: 9.8, indent: 12, gapAfter: 4 },
      )
    })
  }

  document.section('Totals')
  document.keyValue('Subtotal', formatPrice(order.subtotal, order.currency))
  document.keyValue('Shipping', formatPrice(order.shippingFee, order.currency))
  if (order.discount > 0) document.keyValue('Discount', `-${formatPrice(order.discount, order.currency)}`)
  if (order.coupon) document.keyValue('Coupon', order.coupon.code)
  if (order.tax > 0) document.keyValue('Tax', formatPrice(order.tax, order.currency))
  document.write(`Grand total: ${formatPrice(order.total, order.currency)}`, { font: 'bold', size: 14 })

  document.section('Support')
  document.write(`${context.supportEmail} | ${context.supportPhone}`, { size: 10.5 })
  document.write('This invoice uses actual order details from your Boilabin account.', { size: 9.6 })

  return document.toPages()
}

function buildPdfObjectMap(pages: PdfLine[][]) {
  const pageObjectIds = pages.map((_, index) => 3 + index * 2)
  const contentObjectIds = pages.map((_, index) => 4 + index * 2)
  const regularFontObjectId = 3 + pages.length * 2
  const boldFontObjectId = regularFontObjectId + 1
  const objects: Record<number, string> = {
    1: '<< /Type /Catalog /Pages 2 0 R >>',
    2: `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`,
    [regularFontObjectId]: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    [boldFontObjectId]: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  }

  pages.forEach((page, index) => {
    const pageObjectId = pageObjectIds[index]
    const contentObjectId = contentObjectIds[index]
    const stream = page
      .map((line) => {
        const font = line.font === 'bold' ? 'F2' : 'F1'
        return `BT /${font} ${line.size.toFixed(2)} Tf ${line.x.toFixed(2)} ${line.y.toFixed(2)} Td (${escapePdfLiteral(line.text)}) Tj ET`
      })
      .join('\n')

    objects[pageObjectId] = [
      '<< /Type /Page',
      '/Parent 2 0 R',
      `/MediaBox [0 0 ${PAGE_WIDTH.toFixed(2)} ${PAGE_HEIGHT.toFixed(2)}]`,
      `/Resources << /Font << /F1 ${regularFontObjectId} 0 R /F2 ${boldFontObjectId} 0 R >> >>`,
      `/Contents ${contentObjectId} 0 R`,
      '>>',
    ].join(' ')

    objects[contentObjectId] = [
      `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>`,
      'stream',
      stream,
      'endstream',
    ].join('\n')
  })

  return objects
}

export function generateOrderInvoicePdf(context: OrderInvoiceContext) {
  const pages = buildInvoicePages(context)
  const objects = buildPdfObjectMap(pages)
  const objectIds = Object.keys(objects).map(Number).sort((a, b) => a - b)
  const maxObjectId = objectIds[objectIds.length - 1] ?? 0
  const offsets = new Array<number>(maxObjectId + 1).fill(0)
  let output = '%PDF-1.4\n'

  for (const objectId of objectIds) {
    offsets[objectId] = Buffer.byteLength(output, 'utf8')
    output += `${objectId} 0 obj\n${objects[objectId]}\nendobj\n`
  }

  const xrefOffset = Buffer.byteLength(output, 'utf8')
  output += `xref\n0 ${maxObjectId + 1}\n`
  output += '0000000000 65535 f \n'

  for (let objectId = 1; objectId <= maxObjectId; objectId += 1) {
    output += `${String(offsets[objectId]).padStart(10, '0')} 00000 n \n`
  }

  output += [
    'trailer',
    `<< /Size ${maxObjectId + 1} /Root 1 0 R >>`,
    'startxref',
    String(xrefOffset),
    '%%EOF',
    '',
  ].join('\n')

  return Buffer.from(output, 'utf8')
}
