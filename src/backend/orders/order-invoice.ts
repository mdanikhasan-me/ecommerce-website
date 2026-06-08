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
const PAGE_MARGIN = 42

type PdfFont = 'regular' | 'bold'
type PdfColor = readonly [number, number, number]
type TextAlign = 'left' | 'center' | 'right'

type TextOptions = {
  align?: TextAlign
  color?: PdfColor
  font?: PdfFont
  maxWidth?: number
  size?: number
}

const COLOR_BLACK: PdfColor = [0, 0, 0]
const COLOR_TEXT: PdfColor = [0.05, 0.05, 0.05]
const COLOR_MUTED: PdfColor = [0.2, 0.2, 0.2]
const COLOR_RULE: PdfColor = [0.27, 0.27, 0.27]

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

function pdfNumber(value: number) {
  return value.toFixed(2)
}

function pdfColor(color: PdfColor) {
  return color.map((value) => value.toFixed(3)).join(' ')
}

function estimatePdfTextWidth(text: string, size: number, font: PdfFont) {
  const base = font === 'bold' ? 0.54 : 0.5
  return cleanPdfText(text).split('').reduce((width, character) => {
    if (character === ' ') return width + size * 0.28
    if ('ilI1.,:;!|'.includes(character)) return width + size * 0.26
    if ('mwMW@#%&'.includes(character)) return width + size * 0.78
    if (/[A-Z]/.test(character)) return width + size * 0.62
    if (/[0-9]/.test(character)) return width + size * 0.54
    return width + size * base
  }, 0)
}

function wrapPdfText(text: string, maxWidth: number, size: number, font: PdfFont) {
  const cleaned = cleanPdfText(text)
  if (!cleaned) return []

  const lines: string[] = []
  let current = ''

  for (const word of cleaned.split(' ')) {
    const next = current ? `${current} ${word}` : word
    if (estimatePdfTextWidth(next, size, font) <= maxWidth) {
      current = next
      continue
    }

    if (current) lines.push(current)
    current = word

    while (estimatePdfTextWidth(current, size, font) > maxWidth && current.length > 1) {
      let splitAt = current.length - 1
      for (let index = 1; index < current.length; index += 1) {
        if (estimatePdfTextWidth(current.slice(0, index), size, font) > maxWidth) {
          splitAt = Math.max(1, index - 1)
          break
        }
      }
      lines.push(current.slice(0, splitAt))
      current = current.slice(splitAt)
    }
  }

  if (current) lines.push(current)
  return lines
}

class PdfPageCanvas {
  private operations: string[] = []

  text(x: number, y: number, text: string, options: TextOptions = {}) {
    const cleaned = cleanPdfText(text)
    if (!cleaned) return

    const size = options.size ?? 11
    const font = options.font ?? 'regular'
    const color = options.color ?? COLOR_TEXT
    const fontName = font === 'bold' ? 'F2' : 'F1'
    const width = estimatePdfTextWidth(cleaned, size, font)
    const originX =
      options.align === 'right' ? x - width : options.align === 'center' ? x - width / 2 : x

    this.operations.push([
      'q',
      `${pdfColor(color)} rg`,
      'BT',
      `/${fontName} ${pdfNumber(size)} Tf`,
      `1 0 0 1 ${pdfNumber(originX)} ${pdfNumber(y)} Tm`,
      `(${escapePdfLiteral(cleaned)}) Tj`,
      'ET',
      'Q',
    ].join(' '))
  }

  paragraph(x: number, y: number, text: string, options: TextOptions & { leading?: number } = {}) {
    const size = options.size ?? 11
    const font = options.font ?? 'regular'
    const maxWidth = options.maxWidth ?? PAGE_WIDTH - PAGE_MARGIN * 2
    const leading = options.leading ?? size * 1.42
    const lines = wrapPdfText(text, maxWidth, size, font)

    lines.forEach((line, index) => {
      this.text(x, y - index * leading, line, options)
    })

    return y - Math.max(0, lines.length - 1) * leading
  }

  line(x1: number, y1: number, x2: number, y2: number, options: { color?: PdfColor; width?: number } = {}) {
    const color = options.color ?? COLOR_RULE
    const width = options.width ?? 1
    this.operations.push([
      'q',
      `${pdfColor(color)} RG`,
      `${pdfNumber(width)} w`,
      `${pdfNumber(x1)} ${pdfNumber(y1)} m`,
      `${pdfNumber(x2)} ${pdfNumber(y2)} l`,
      'S',
      'Q',
    ].join(' '))
  }

  circle(cx: number, cy: number, radius: number, options: { color?: PdfColor; width?: number } = {}) {
    const color = options.color ?? COLOR_BLACK
    const width = options.width ?? 1
    const control = radius * 0.5522847498
    const path = [
      `${pdfNumber(cx + radius)} ${pdfNumber(cy)} m`,
      `${pdfNumber(cx + radius)} ${pdfNumber(cy + control)} ${pdfNumber(cx + control)} ${pdfNumber(cy + radius)} ${pdfNumber(cx)} ${pdfNumber(cy + radius)} c`,
      `${pdfNumber(cx - control)} ${pdfNumber(cy + radius)} ${pdfNumber(cx - radius)} ${pdfNumber(cy + control)} ${pdfNumber(cx - radius)} ${pdfNumber(cy)} c`,
      `${pdfNumber(cx - radius)} ${pdfNumber(cy - control)} ${pdfNumber(cx - control)} ${pdfNumber(cy - radius)} ${pdfNumber(cx)} ${pdfNumber(cy - radius)} c`,
      `${pdfNumber(cx + control)} ${pdfNumber(cy - radius)} ${pdfNumber(cx + radius)} ${pdfNumber(cy - control)} ${pdfNumber(cx + radius)} ${pdfNumber(cy)} c`,
    ].join(' ')

    this.operations.push([
      'q',
      `${pdfColor(color)} RG`,
      `${pdfNumber(width)} w`,
      path,
      'S',
      'Q',
    ].join(' '))
  }

  polyline(points: Array<[number, number]>, options: { color?: PdfColor; width?: number } = {}) {
    if (points.length < 2) return
    const color = options.color ?? COLOR_BLACK
    const width = options.width ?? 1
    const [first, ...rest] = points
    const path = [
      `${pdfNumber(first[0])} ${pdfNumber(first[1])} m`,
      ...rest.map(([x, y]) => `${pdfNumber(x)} ${pdfNumber(y)} l`),
    ].join(' ')

    this.operations.push([
      'q',
      `${pdfColor(color)} RG`,
      `${pdfNumber(width)} w`,
      path,
      'S',
      'Q',
    ].join(' '))
  }

  stream() {
    return this.operations.join('\n')
  }
}

function drawRule(page: PdfPageCanvas, y: number, width = 1) {
  page.line(PAGE_MARGIN, y, PAGE_WIDTH - PAGE_MARGIN, y, { width })
}

function drawLabelValueRow(page: PdfPageCanvas, y: number, label: string, value: string) {
  page.text(PAGE_MARGIN, y, `${label}:`, { font: 'bold', size: 13.5, color: COLOR_BLACK })
  page.text(PAGE_MARGIN + 135, y, value, { size: 13.5, color: COLOR_BLACK })
}

function drawColumnText(page: PdfPageCanvas, x: number, y: number, lines: string[], maxWidth: number) {
  let cursorY = y
  lines.forEach((line) => {
    const renderedY = page.paragraph(x, cursorY, line, {
      color: COLOR_BLACK,
      maxWidth,
      size: 12.8,
    })
    cursorY = renderedY - 18
  })
}

function getDeliveryAddressLines(order: OrderInvoiceRecord) {
  if (!order.address) return ['No saved delivery address is attached to this order.']

  return [
    order.address.fullName,
    order.address.addressLine1,
    order.address.addressLine2,
    `${order.address.city}, ${order.address.district}`,
    order.address.phone,
  ].filter((line): line is string => Boolean(line))
}

function drawSupportIcon(page: PdfPageCanvas, cx: number, cy: number) {
  page.circle(cx, cy, 18.5, { color: COLOR_BLACK, width: 1.35 })
  page.polyline([
    [cx - 9.5, cy + 1],
    [cx - 7, cy + 8],
    [cx, cy + 11],
    [cx + 7, cy + 8],
    [cx + 9.5, cy + 1],
  ], { color: COLOR_BLACK, width: 1.7 })
  page.line(cx - 9.5, cy + 1, cx - 9.5, cy - 6.5, { color: COLOR_BLACK, width: 2 })
  page.line(cx + 9.5, cy + 1, cx + 9.5, cy - 6.5, { color: COLOR_BLACK, width: 2 })
  page.polyline([
    [cx + 6.5, cy - 9],
    [cx + 3, cy - 12],
    [cx - 1.5, cy - 12],
  ], { color: COLOR_BLACK, width: 1.6 })
}

function drawTableHeader(page: PdfPageCanvas, y: number) {
  const right = PAGE_WIDTH - PAGE_MARGIN
  page.text(PAGE_MARGIN, y, 'Item', { font: 'bold', size: 12.8, color: COLOR_BLACK })
  page.text(250, y, 'SKU', { font: 'bold', size: 12.8, color: COLOR_BLACK })
  page.text(360, y, 'Qty', { align: 'center', font: 'bold', size: 12.8, color: COLOR_BLACK })
  page.text(438, y, 'Unit', { align: 'right', font: 'bold', size: 12.8, color: COLOR_BLACK })
  page.text(right, y, 'Line total', { align: 'right', font: 'bold', size: 12.8, color: COLOR_BLACK })
}

function drawOrderItems(page: PdfPageCanvas, context: OrderInvoiceContext) {
  const { order } = context
  const right = PAGE_WIDTH - PAGE_MARGIN
  const itemX = PAGE_MARGIN
  const skuX = 250
  const qtyX = 360
  const unitX = 438
  let rowY = 186

  if (order.items.length === 0) {
    page.text(itemX, rowY, 'No line items are attached to this order.', { size: 12.5, color: COLOR_BLACK })
    page.line(PAGE_MARGIN, rowY - 28, right, rowY - 28, { width: 0.8 })
    return rowY - 28
  }

  for (const item of order.items) {
    const rowHeight = item.variantName ? 42 : 38

    page.text(itemX, rowY, item.productName, { size: 12.4, color: COLOR_BLACK })
    if (item.variantName) {
      page.text(itemX, rowY - 15, item.variantName, { color: COLOR_MUTED, size: 9.8 })
    }

    page.text(skuX, rowY, item.productSku, { size: 12.1, color: COLOR_BLACK })
    page.text(qtyX, rowY, String(item.quantity), { align: 'center', size: 12.1, color: COLOR_BLACK })
    page.text(unitX, rowY, formatPrice(item.price, order.currency), { align: 'right', size: 12.1, color: COLOR_BLACK })
    page.text(right, rowY, formatPrice(item.total, order.currency), { align: 'right', size: 12.1, color: COLOR_BLACK })

    rowY -= rowHeight
  }

  const bottomY = Math.max(150, rowY + 8)
  page.line(PAGE_MARGIN, bottomY, right, bottomY, { width: 0.8 })
  return bottomY
}

function drawTotals(page: PdfPageCanvas, context: OrderInvoiceContext) {
  const { order } = context
  const right = PAGE_WIDTH - PAGE_MARGIN
  const labelX = 395
  const valueX = right
  let y = 145

  const totalRows: Array<[string, string, PdfFont]> = [
    ['Subtotal', formatPrice(order.subtotal, order.currency), 'regular'],
    ['Shipping', formatPrice(order.shippingFee, order.currency), 'regular'],
  ]

  if (order.discount > 0) totalRows.push(['Discount', `-${formatPrice(order.discount, order.currency)}`, 'regular'])
  if (order.coupon) totalRows.push(['Coupon', order.coupon.code, 'regular'])
  if (order.tax > 0) totalRows.push(['Tax', formatPrice(order.tax, order.currency), 'regular'])

  totalRows.forEach(([label, value, font]) => {
    page.text(labelX, y, label, { font, size: 12.8, color: COLOR_BLACK })
    page.text(valueX, y, value, { align: 'right', font, size: 12.8, color: COLOR_BLACK })
    y -= 25
  })

  page.line(labelX, y + 6, valueX, y + 6, { width: 1 })
  page.text(labelX, y - 15, 'Grand total', { font: 'bold', size: 13.4, color: COLOR_BLACK })
  page.text(valueX, y - 15, formatPrice(order.total, order.currency), {
    align: 'right',
    font: 'bold',
    size: 13.4,
    color: COLOR_BLACK,
  })
}

function buildInvoicePages(context: OrderInvoiceContext) {
  const { order } = context
  const page = new PdfPageCanvas()
  const right = PAGE_WIDTH - PAGE_MARGIN

  page.text(PAGE_MARGIN, 724, 'Boilabin', { font: 'bold', size: 64, color: COLOR_BLACK })
  page.text(PAGE_MARGIN, 666, 'Order Invoice', { font: 'bold', size: 25, color: COLOR_BLACK })
  drawRule(page, 636, 1.2)

  const metaRows: Array<[string, string]> = [
    ['Invoice / Order', order.orderNumber],
    ['Placed on', formatDate(order.createdAt)],
    ['Order status', formatOrderInvoiceEnumLabel(order.status)],
    ['Payment method', formatOrderInvoiceEnumLabel(order.paymentMethod)],
    ['Payment status', formatOrderInvoiceEnumLabel(order.paymentStatus)],
  ]
  metaRows.forEach(([label, value], index) => {
    drawLabelValueRow(page, 602 - index * 29, label, value)
  })
  drawRule(page, 452, 0.8)

  const columnTopY = 414
  const leftColumnWidth = 205
  const rightColumnX = 322
  const rightColumnWidth = 220
  page.text(PAGE_MARGIN, columnTopY, 'Customer:', { font: 'bold', size: 14.5, color: COLOR_BLACK })
  page.text(PAGE_MARGIN, columnTopY - 31, context.customerName, { size: 12.8, color: COLOR_BLACK })
  page.text(PAGE_MARGIN, columnTopY - 80, 'Email:', { font: 'bold', size: 14.5, color: COLOR_BLACK })
  page.paragraph(PAGE_MARGIN, columnTopY - 111, context.customerEmail ?? 'Not provided', {
    maxWidth: leftColumnWidth,
    size: 12.8,
    color: COLOR_BLACK,
  })

  page.line(292, columnTopY + 15, 292, 285, { width: 0.8 })
  page.text(rightColumnX, columnTopY, 'Delivery address:', { font: 'bold', size: 14.5, color: COLOR_BLACK })
  drawColumnText(page, rightColumnX, columnTopY - 31, getDeliveryAddressLines(order), rightColumnWidth)

  drawRule(page, 262, 0.8)
  drawTableHeader(page, 226)
  page.line(PAGE_MARGIN, 209, right, 209, { width: 1 })
  drawOrderItems(page, context)
  drawTotals(page, context)

  drawRule(page, 72, 1)
  drawSupportIcon(page, PAGE_MARGIN + 20, 38)
  page.text(PAGE_MARGIN + 54, 45, 'Support', { font: 'bold', size: 12.7, color: COLOR_BLACK })
  page.text(PAGE_MARGIN + 54, 24, context.supportEmail, { size: 11.2, color: COLOR_BLACK })
  page.line(PAGE_MARGIN + 158, 18, PAGE_MARGIN + 158, 36, { width: 0.8 })
  page.text(PAGE_MARGIN + 174, 24, context.supportPhone, { size: 11.2, color: COLOR_BLACK })

  return [page]
}

function buildPdfObjectMap(pages: PdfPageCanvas[]) {
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
    const stream = page.stream()

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
