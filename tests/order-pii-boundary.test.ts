import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()

function readProjectFile(pathname: string) {
  return readFileSync(join(repoRoot, pathname), 'utf8')
}

describe('buyer order PII boundary guardrails', () => {
  it('keeps order confirmation noindex and scoped to owner or admin before loading delivery address', () => {
    const source = readProjectFile('src/app/(store)/order/[orderNumber]/confirmation/page.tsx')

    assert.match(source, /generateNoIndexPageMetadata\(/)
    assert.match(source, /const session = await auth\(\)/)
    assert.match(source, /if \(!session\?\.user\) notFound\(\)/)
    assert.match(source, /const isOrderAdmin = \['ADMIN', 'SUPER_ADMIN'\]\.includes\(session\.user\.role\)/)
    assert.match(source, /\.\.\.\(isOrderAdmin \? \{\} : \{ userId: session\.user\.id \}\)/)

    const authIndex = source.indexOf('const session = await auth()')
    const queryIndex = source.indexOf('db.order.findFirst')
    const includeAddressIndex = source.indexOf('address: true')
    assert.ok(authIndex >= 0 && queryIndex > authIndex)
    assert.ok(includeAddressIndex > queryIndex)
  })

  it('keeps account order listing authenticated and user-scoped even with order-number filters', () => {
    const source = readProjectFile('src/app/(store)/account/orders/page.tsx')

    assert.match(source, /const session = await auth\(\)/)
    assert.match(source, /if \(!session\?\.user\) redirect\('\/auth\/login\?callbackUrl=\/account\/orders'\)/)
    assert.match(source, /userId: session\.user\.id/)
    assert.match(source, /orderNumber: \{ contains: filter, mode: 'insensitive' as const \}/)

    const userScopeIndex = source.indexOf('userId: session.user.id')
    const orderFilterIndex = source.indexOf('orderNumber: { contains: filter')
    assert.ok(userScopeIndex >= 0)
    assert.ok(orderFilterIndex > userScopeIndex)
  })

  it('keeps track-order noindex and redirects lookup into authenticated account orders', () => {
    const pageSource = readProjectFile('src/app/(store)/track-order/page.tsx')
    const componentSource = readProjectFile('src/frontend/components/content/TrackOrderLookup.tsx')

    assert.match(pageSource, /generateNoIndexPageMetadata\(/)
    assert.match(pageSource, /'\/track-order'/)
    assert.match(componentSource, /window\.location\.href = `\/account\/orders\?orderNumber=\$\{encodeURIComponent\(trimmed\)\}`/)
  })

  it('does not reintroduce public order lookup APIs or Flash Deals order logic', () => {
    assert.equal(existsSync(join(repoRoot, 'src/app/api/track-order/route.ts')), false)
    assert.equal(existsSync(join(repoRoot, 'src/app/api/orders/track/route.ts')), false)
    assert.equal(existsSync(join(repoRoot, 'src/app/api/order/[orderNumber]/route.ts')), false)

    const orderRoute = readProjectFile('src/app/api/orders/route.ts')
    const orderService = readProjectFile('src/backend/orders/buyer-order-create.ts')
    assert.doesNotMatch(`${orderRoute}\n${orderService}`, /flash[\s_-]*(sale|deal)|FlashSale|FlashDeal/i)
  })
})
