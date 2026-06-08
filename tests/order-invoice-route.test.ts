import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()

function readProjectFile(pathname: string) {
  return readFileSync(join(repoRoot, pathname), 'utf8')
}

describe('buyer order invoice route guardrails', () => {
  it('keeps the order details button wired to a protected invoice route', () => {
    const detailSource = readProjectFile('src/app/(store)/account/orders/[id]/page.tsx')

    assert.match(detailSource, /getInvoicePdfDownloadPath\(order\.id\)/)
    assert.match(detailSource, /buildInvoiceDownloadFilename\(order\.orderNumber\)/)
    assert.match(detailSource, /href=\{invoicePdfPath\}/)
    assert.match(detailSource, /download=\{invoicePdfFilename\}/)
    assert.match(detailSource, /Download Invoice/)
  })

  it('keeps the invoice page authenticated and owner-scoped before rendering order data', () => {
    const invoiceSource = readProjectFile('src/app/(store)/account/orders/[id]/invoice/page.tsx')
    const printButtonSource = readProjectFile('src/frontend/components/account/PrintInvoiceButton.tsx')

    assert.match(invoiceSource, /if \(!session\?\.user\) redirect\('\/auth\/login'\)/)
    assert.match(invoiceSource, /getOwnedOrderInvoiceContext\(\{/)
    assert.match(invoiceSource, /if \(!invoice\) notFound\(\)/)
    assert.match(invoiceSource, /Download PDF/)
    assert.match(printButtonSource, /Print/)
    assert.match(printButtonSource, /window\.print\(\)/)
    assert.doesNotMatch(invoiceSource, /tax invoice|vat invoice|transaction id|tracking number/i)
  })

  it('keeps the PDF download route authenticated, owner-scoped, and file-backed', () => {
    const routeSource = readProjectFile('src/app/api/account/orders/[id]/invoice/route.ts')

    assert.match(routeSource, /const session = await auth\(\)/)
    assert.match(routeSource, /NextResponse\.redirect\(new URL\('\/auth\/login', request\.url\)\)/)
    assert.match(routeSource, /getOwnedOrderInvoiceContext\(\{/)
    assert.match(routeSource, /orderId: id/)
    assert.match(routeSource, /userId/)
    assert.match(routeSource, /generateOrderInvoicePdf\(context\)/)
    assert.match(routeSource, /'Content-Type': 'application\/pdf'/)
    assert.match(routeSource, /'Content-Disposition': `attachment; filename="\$\{filename\}"`/)
    assert.match(routeSource, /'Cache-Control': 'private, no-store, max-age=0'/)
    assert.doesNotMatch(routeSource, /trackingNumber|transactionId|vat invoice|tax invoice/i)
  })
})
