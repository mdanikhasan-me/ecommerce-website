import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ACCEPTED_REMOTE_MEDIA,
  auditStorefrontMediaSources,
  CANONICAL_CATEGORY_ASSETS,
  CANONICAL_HERO_ASSETS,
  CANONICAL_PRODUCT_IMAGE_REPLACEMENTS,
  RETIRED_STOREFRONT_REMOTE_MEDIA,
} from '../scripts/audit-storefront-media-sources.mjs'

describe('storefront media remote policy inventory', () => {
  it('keeps Step 116 category and hero assets present without restoring Baby Kids', () => {
    const audit = auditStorefrontMediaSources()

    assert.deepEqual(
      audit.categoryAssets.map((asset) => asset.pathname),
      CANONICAL_CATEGORY_ASSETS,
    )
    assert.deepEqual(
      audit.heroAssets.map((asset) => asset.pathname),
      CANONICAL_HERO_ASSETS,
    )
    assert.equal(audit.categoryAssets.every((asset) => asset.exists), true)
    assert.equal(audit.heroAssets.every((asset) => asset.exists), true)
    assert.equal(audit.babyKidsExists, false)
    assert.equal(audit.toysCollectibles.exists, true)
    assert.equal(audit.toysCollectibles.sharesPixelsWithGaming, true)
  })

  it('reports accepted remote media without reintroducing retired hero remotes into seed heroes', () => {
    const audit = auditStorefrontMediaSources()

    assert.equal(audit.unexpectedRemoteHeroCount, 0)
    assert.equal(audit.productSeedRemoteCount, 0)

    for (const remote of ACCEPTED_REMOTE_MEDIA) {
      assert.ok(
        audit.acceptedRemoteMedia.some((entry) => entry.url === remote.url && entry.present),
        `${remote.url} should remain inventoried as accepted remote media`,
      )
    }

    for (const retiredUrl of RETIRED_STOREFRONT_REMOTE_MEDIA) {
      assert.ok(
        audit.retiredStorefrontRemoteMedia.some(
          (entry) => entry.url === retiredUrl && entry.presentInActiveSeedHero === false,
        ),
        `${retiredUrl} should not return to active seed hero references`,
      )
    }
  })

  it('keeps approved product image replacements on committed local assets', () => {
    const audit = auditStorefrontMediaSources()

    assert.equal(audit.productImageReplacements.length, CANONICAL_PRODUCT_IMAGE_REPLACEMENTS.length)
    assert.equal(audit.productSeedLocalReplacementCount, CANONICAL_PRODUCT_IMAGE_REPLACEMENTS.length)
    assert.equal(audit.staleProductReplacementRemoteCount, 0)

    for (const replacement of audit.productImageReplacements) {
      assert.equal(replacement.localExists, true, `${replacement.local} should exist`)
      assert.equal(replacement.seedUsesLocal, true, `${replacement.product} should use local seed image`)
      assert.equal(replacement.seedUsesRemote, false, `${replacement.product} should not use stale remote seed image`)
      assert.equal(replacement.repairMapsRemoteToLocal, true, `${replacement.product} should have a local repair mapping`)
    }
  })
})
