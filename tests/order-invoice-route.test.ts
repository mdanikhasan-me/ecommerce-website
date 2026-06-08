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

    assert.match(detailSource, /href={`\/account\/orders\/\$\{order\.id\}\/invoice`}/)
    assert.match(detailSource, /Download Invoice/)
  })

  it('keeps the invoice page authenticated and owner-scoped before rendering order data', () => {
    const invoiceSource = readProjectFile('src/app/(store)/account/orders/[id]/invoice/page.tsx')
    const printButtonSource = readProjectFile('src/frontend/components/account/PrintInvoiceButton.tsx')

    assert.match(invoiceSource, /if \(!session\?\.user\) redirect\('\/auth\/login'\)/)
    assert.match(invoiceSource, /where: \{ id, userId: session\.user\.id \}/)
    assert.match(printButtonSource, /Print \/ Save PDF/)
    assert.doesNotMatch(invoiceSource, /tax invoice|vat invoice|transaction id|tracking number/i)
  })
})
