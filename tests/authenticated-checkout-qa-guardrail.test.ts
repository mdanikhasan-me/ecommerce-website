import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import { createLocalAuthFixtureReadinessReport } from '../scripts/audit-local-auth-fixture-readiness.mjs'

const repoRoot = process.cwd()

function readProjectFile(pathname: string) {
  return readFileSync(join(repoRoot, pathname), 'utf8')
}

describe('authenticated checkout local fixture guardrails', () => {
  it('keeps the readiness audit file-only and manual-action gated', () => {
    const report = createLocalAuthFixtureReadinessReport()

    assert.equal(report.status, 'manual-owner-action-required')
    assert.equal(report.privateEnvFilesRead, false)
    assert.equal(report.databaseConnectionAttempted, false)
    assert.deepEqual(report.missingFiles, [])

    for (const [key, value] of Object.entries(report.checks)) {
      assert.equal(value, true, key)
    }
  })

  it('keeps checkout page behind server auth redirect before client shell loads', () => {
    const checkoutPageSource = readProjectFile('src/app/(store)/checkout/page.tsx')

    assert.match(checkoutPageSource, /const session = await auth\(\)/)
    assert.match(checkoutPageSource, /if \(!session\?\.user\?\.id\)/)
    assert.match(checkoutPageSource, /redirect\('\/auth\/login\?callbackUrl=\/checkout&reason=checkout'\)/)
  })

  it('keeps checkout order creation tied to explicit place-order click only', () => {
    const checkoutClientSource = readProjectFile('src/frontend/components/checkout/CheckoutClient.tsx')
    const placeOrderIndex = checkoutClientSource.indexOf('const placeOrder = async')
    const ordersFetchIndex = checkoutClientSource.indexOf("fetch('/api/orders'")
    const orderButtonIndex = checkoutClientSource.indexOf('onClick={placeOrder}')

    assert(placeOrderIndex >= 0)
    assert(ordersFetchIndex > placeOrderIndex)
    assert(orderButtonIndex > ordersFetchIndex)
    assert.doesNotMatch(checkoutClientSource, /useEffect\(\s*\(\)\s*=>\s*\{\s*placeOrder\(/)
  })

  it('keeps the buyer fixture local-only, customer-only, and non-migration capable', () => {
    const fixtureSource = readProjectFile('scripts/create-local-buyer-fixture.mjs')

    assert.match(fixtureSource, /evaluateDatabaseSafety/)
    assert.match(fixtureSource, /safeForLocalMigration/)
    assert.match(fixtureSource, /role:\s*'CUSTOMER'/)
    assert.doesNotMatch(fixtureSource, /role:\s*'ADMIN'|role:\s*'SUPER_ADMIN'/)
    assert.doesNotMatch(fixtureSource, /migrate dev|migrate deploy|db push|seed|reset|docker compose|deploy/i)
  })

  it('keeps package scripts exact and opt-in for local buyer fixture work', () => {
    const packageJson = JSON.parse(readProjectFile('package.json')) as {
      scripts: Record<string, string>
    }

    assert.equal(packageJson.scripts['auth:fixture:readiness'], 'node scripts/audit-local-auth-fixture-readiness.mjs')
    assert.equal(packageJson.scripts['auth:buyer:local'], 'node scripts/create-local-buyer-fixture.mjs')
  })
})
