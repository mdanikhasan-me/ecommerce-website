import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('media upload readiness policy guardrail', () => {
  it('keeps the multi-vendor scale example explicit', async () => {
    const { MEDIA_SCALE_SCENARIO, estimateImageScale } = await import('../scripts/audit-media-upload-readiness.mjs')
    const estimate = estimateImageScale(MEDIA_SCALE_SCENARIO)

    assert.equal(estimate.imageCount, 250_000)
    assert.equal(estimate.rawBytes, 250_000 * 5 * 1024 * 1024)
    assert.ok(estimate.rawGiB > 1_200)
  })

  it('detects current safe upload foundations and missing variant generation', async () => {
    const { collectMediaUploadReadiness } = await import('../scripts/audit-media-upload-readiness.mjs')
    const readiness = await collectMediaUploadReadiness(process.cwd())

    assert.equal(readiness.checks.usesSharp, true)
    assert.equal(readiness.checks.hasMaxUploadBytes, true)
    assert.equal(readiness.checks.hasDecodedPixelLimit, true)
    assert.equal(readiness.checks.validatesMimeAgainstDecodedFormat, true)
    assert.equal(readiness.checks.convertsToWebp, true)
    assert.equal(readiness.checks.supportsNextImageFormats, true)
    assert.equal(readiness.checks.generatesDerivedImageVariants, false)
  })
})
