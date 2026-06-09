import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ACCEPTED_REMOTE_MEDIA,
  auditStorefrontMediaSources,
  CANONICAL_CATEGORY_ASSETS,
  CANONICAL_HERO_ASSETS,
  CANONICAL_PRODUCT_IMAGE_REPLACEMENTS,
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

  it('reports no accepted remote media or product replacements in the cleaned catalog', () => {
    const audit = auditStorefrontMediaSources()

    assert.equal(audit.unexpectedRemoteHeroCount, 0)
    assert.equal(audit.productSeedRemoteCount, 0)
    assert.equal(audit.acceptedRemoteMedia.length, ACCEPTED_REMOTE_MEDIA.length)
    assert.equal(audit.productImageReplacements.length, 0)
    assert.equal(audit.productSeedLocalReplacementCount, 0)
    assert.equal(audit.staleProductReplacementRemoteCount, 0)
  })

  it('keeps retired storefront remote media out of active seed heroes', () => {
    const audit = auditStorefrontMediaSources()

    assert.equal(audit.retiredStorefrontRemoteMedia.every((entry) => entry.presentInActiveSeedHero === false), true)
    assert.equal(CANONICAL_PRODUCT_IMAGE_REPLACEMENTS.length, 0)
    for (const replacement of audit.productImageReplacements) {
      assert.equal(replacement.seedUsesLocal, false)
      assert.equal(replacement.seedUsesRemote, false)
    }
  })
})
