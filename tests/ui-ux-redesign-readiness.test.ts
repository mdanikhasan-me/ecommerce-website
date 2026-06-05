import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  UI_REDESIGN_ROUTE_PATHS,
  UI_REDESIGN_VIEWPORTS,
  collectSanitizedMediaConstraintEvidence,
  collectUiUxRedesignInventory,
} from '../scripts/audit-ui-ux-redesign-readiness.mjs'

describe('UI/UX redesign readiness inventory', () => {
  it('keeps the planned browser matrix broad enough for storefront redesign evidence', () => {
    assert.ok(UI_REDESIGN_ROUTE_PATHS.includes('/'))
    assert.ok(UI_REDESIGN_ROUTE_PATHS.includes('/category'))
    assert.ok(UI_REDESIGN_ROUTE_PATHS.includes('/category/electronics'))
    assert.ok(UI_REDESIGN_ROUTE_PATHS.includes('/search?q=phone'))
    assert.ok(UI_REDESIGN_ROUTE_PATHS.includes('/products/iphone-15-pro-128gb'))
    assert.ok(UI_REDESIGN_ROUTE_PATHS.includes('/checkout'))
    assert.ok(UI_REDESIGN_ROUTE_PATHS.includes('/deals'))
    assert.ok(UI_REDESIGN_ROUTE_PATHS.includes('/api/admin/flash-sales'))

    assert.ok(UI_REDESIGN_VIEWPORTS.some((viewport) => viewport.width === 360))
    assert.ok(UI_REDESIGN_VIEWPORTS.some((viewport) => viewport.width === 390))
    assert.ok(UI_REDESIGN_VIEWPORTS.some((viewport) => viewport.width === 430))
    assert.ok(UI_REDESIGN_VIEWPORTS.some((viewport) => viewport.width === 1366))
  })

  it('maps storefront routes and design-system readiness without database or private env access', async () => {
    const inventory = await collectUiUxRedesignInventory()
    const routes = inventory.storeRoutes.map((route) => route.route)

    assert.equal(inventory.databaseRequired, false)
    assert.equal(inventory.privateEnvRead, false)
    assert.ok(routes.includes('/'))
    assert.ok(routes.includes('/category'))
    assert.ok(routes.includes('/category/:slug'))
    assert.ok(routes.includes('/search'))
    assert.ok(routes.includes('/products/:slug'))
    assert.ok(routes.includes('/cart'))
    assert.ok(routes.includes('/checkout'))
    assert.ok(routes.includes('/auth/login'))

    assert.ok(inventory.tokenInventory.cssVariableCount > 10)
    assert.ok(inventory.tokenInventory.globalComponentClasses.includes('product-card'))
    assert.ok(inventory.tokenInventory.globalComponentClasses.includes('btn-primary'))
    assert.ok(inventory.componentInventory.uiPrimitiveFiles.includes('src/frontend/components/ui/Providers.tsx'))
    assert.ok(inventory.componentInventory.productCardSharedBy.includes('src/app/(store)/search/page.tsx'))
    assert.ok(inventory.riskFindings.some((finding) => finding.area === 'design-system'))
  })

  it('emits sanitized media constraint evidence without raw URLs or local absolute paths', async () => {
    const evidence = await collectSanitizedMediaConstraintEvidence()
    const serialized = JSON.stringify(evidence)

    assert.equal(evidence.databaseRequired, false)
    assert.equal(evidence.privateEnvRead, false)
    assert.equal(evidence.rawUrlsStored, false)
    assert.equal(evidence.rawUploadFilenamesStored, false)
    assert.equal(evidence.localAssetDependency.remoteStaticUiAssetRisk, false)
    assert.equal(evidence.localAssetDependency.missingAssetWarnings.missingLocalSourceAssetReferenceCount, 0)
    assert.equal(evidence.storefrontMediaSourceSummary.categoryAssetsPresent, true)
    assert.equal(evidence.storefrontMediaSourceSummary.heroAssetsPresent, true)
    assert.equal(evidence.storefrontMediaSourceSummary.staleProductReplacementRemoteCount, 0)

    assert.doesNotMatch(serialized, /https?:\/\//i)
    assert.doesNotMatch(serialized, /[A-Za-z]:[\\/]/)
    assert.doesNotMatch(serialized, /\/uploads\/(?:products|admin)\//)
  })
})
