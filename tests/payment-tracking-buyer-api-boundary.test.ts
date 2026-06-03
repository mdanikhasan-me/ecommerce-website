import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const repoRoot = process.cwd()

function readProjectFile(pathname: string) {
  return readFileSync(join(repoRoot, pathname), 'utf8')
}

function expectMissing(pathname: string) {
  assert.equal(existsSync(join(repoRoot, pathname)), false, `${pathname} should not exist`)
}

describe('payment disabled boundary guardrails', () => {
  it('keeps online checkout methods as disabled placeholders without provider handoff code', () => {
    const source = readProjectFile('src/backend/config/payment.ts')

    assert.match(source, /NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS === 'true'/)
    assert.match(source, /id: 'CASH_ON_DELIVERY'[\s\S]*?isAvailable: true/)
    assert.match(source, /id: 'BKASH'[\s\S]*?isAvailable: BANGLADESH_ONLINE_GATEWAY_READY/)
    assert.match(source, /id: 'NAGAD'[\s\S]*?isAvailable: BANGLADESH_ONLINE_GATEWAY_READY/)
    assert.match(source, /id: 'STRIPE'[\s\S]*?isAvailable: false/)
    assert.doesNotMatch(source, /fetch\(|axios|success_url|fail_url|cancel_url|webhook|gatewayResponse/i)
  })

  it('does not expose public payment provider or webhook API routes before integration approval', () => {
    for (const pathname of [
      'src/app/api/payment/route.ts',
      'src/app/api/payments/route.ts',
      'src/app/api/payments/[provider]/route.ts',
      'src/app/api/payment/callback/route.ts',
      'src/app/api/payments/callback/route.ts',
      'src/app/api/payment/webhook/route.ts',
      'src/app/api/payments/webhook/route.ts',
      'src/app/api/webhooks/route.ts',
      'src/app/api/webhooks/payment/route.ts',
      'src/app/api/webhooks/sslcommerz/route.ts',
      'src/app/api/webhooks/bkash/route.ts',
      'src/app/api/webhooks/nagad/route.ts',
    ]) {
      expectMissing(pathname)
    }
  })

  it('keeps buyer order creation on server-side totals and a pending internal payment record', () => {
    const orderService = readProjectFile('src/backend/orders/buyer-order-create.ts')

    assert.match(orderService, /let subtotal = 0/)
    assert.match(orderService, /const shippingFee = computeBuyerOrderShipping\(subtotal\)/)
    assert.match(orderService, /const total = Math\.max\(0, subtotal - discount \+ shippingFee\)/)
    assert.match(orderService, /amount: total/)
    assert.match(orderService, /method: payload\.paymentMethod/)
    assert.match(orderService, /status: 'PENDING'/)
    assert.doesNotMatch(orderService, /gatewayResponse|transactionId|success_url|fail_url|cancel_url|webhook/i)
  })
})

describe('tracking disabled and guest PII boundary guardrails', () => {
  it('does not expose public guest tracking or order lookup APIs', () => {
    for (const pathname of [
      'src/app/api/track-order/route.ts',
      'src/app/api/tracking/route.ts',
      'src/app/api/orders/track/route.ts',
      'src/app/api/order/[orderNumber]/route.ts',
      'src/app/api/orders/[orderNumber]/route.ts',
      'src/app/api/public-order/route.ts',
      'src/app/api/public-orders/route.ts',
    ]) {
      expectMissing(pathname)
    }
  })

  it('keeps track-order as noindex and redirects into authenticated account order filtering', () => {
    const pageSource = readProjectFile('src/app/(store)/track-order/page.tsx')
    const lookupSource = readProjectFile('src/frontend/components/content/TrackOrderLookup.tsx')

    assert.match(pageSource, /generateNoIndexPageMetadata\(/)
    assert.match(pageSource, /'\/track-order'/)
    assert.match(lookupSource, /encodeURIComponent\(trimmed\)/)
    assert.match(lookupSource, /\/account\/orders\?orderNumber=/)
    assert.doesNotMatch(lookupSource, /fetch\(|address|phone|fullName|lineItems|orderItems/i)
  })

  it('keeps order confirmation and account order detail scoped before delivery PII is rendered', () => {
    const confirmationSource = readProjectFile('src/app/(store)/order/[orderNumber]/confirmation/page.tsx')
    const accountDetailSource = readProjectFile('src/app/(store)/account/orders/[id]/page.tsx')

    assert.match(confirmationSource, /if \(!session\?\.user\) notFound\(\)/)
    assert.match(confirmationSource, /\.\.\.\(isOrderAdmin \? \{\} : \{ userId: session\.user\.id \}\)/)
    assert.match(accountDetailSource, /if \(!session\?\.user\) redirect\('\/auth\/login'\)/)
    assert.match(accountDetailSource, /where: \{ id, userId: session\.user\.id \}/)

    const confirmationAuthIndex = confirmationSource.indexOf('if (!session?.user) notFound()')
    const confirmationQueryIndex = confirmationSource.indexOf('db.order.findFirst')
    const confirmationAddressIndex = confirmationSource.indexOf('address: true')
    assert.ok(confirmationAuthIndex >= 0 && confirmationQueryIndex > confirmationAuthIndex)
    assert.ok(confirmationAddressIndex > confirmationQueryIndex)

    const detailAuthIndex = accountDetailSource.indexOf("if (!session?.user) redirect('/auth/login')")
    const detailQueryIndex = accountDetailSource.indexOf('db.order.findFirst')
    const detailAddressIndex = accountDetailSource.indexOf('address: true')
    assert.ok(detailAuthIndex >= 0 && detailQueryIndex > detailAuthIndex)
    assert.ok(detailAddressIndex > detailQueryIndex)
  })
})

describe('buyer API contract source guardrails', () => {
  it('keeps unauthenticated buyer order and return mutation response contracts stable', () => {
    const orderRoute = readProjectFile('src/app/api/orders/route.ts')
    const returnRoute = readProjectFile('src/app/api/returns/route.ts')

    assert.match(orderRoute, /Please sign in or create an account before placing an order/)
    assert.match(orderRoute, /\{ status: 401 \}/)
    assert.match(returnRoute, /Please sign in to request a return/)
    assert.match(returnRoute, /\{ status: 401 \}/)
  })

  it('keeps buyer order and return success payload shapes mobile-stable', () => {
    const orderService = readProjectFile('src/backend/orders/buyer-order-create.ts')
    const returnService = readProjectFile('src/backend/orders/buyer-return-request.ts')

    for (const field of ['success: true', 'orderId:', 'orderNumber:', 'subtotal,', 'shippingFee,', 'discount,', 'total,']) {
      assert.match(orderService, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    }
    assert.match(returnService, /payload: \{ request: unknown \}/)
    assert.match(returnService, /return \{ success: true, payload: \{ request \} \}/)
  })
})
