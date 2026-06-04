import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('search verification readiness audit', () => {
  it('runs without network, private env, database, or provider CLI requirements', async () => {
    const { auditSearchVerificationReadiness } = await import('../scripts/audit-search-verification-readiness.mjs')
    const result = await auditSearchVerificationReadiness()

    assert.equal(result.networkRequired, false)
    assert.equal(result.envFilesRead, false)
    assert.equal(result.databaseRequired, false)
    assert.equal(result.providerCliRequired, false)
  })

  it('reports the required staging/search verification docs and search surfaces', async () => {
    const { auditSearchVerificationReadiness } = await import('../scripts/audit-search-verification-readiness.mjs')
    const result = await auditSearchVerificationReadiness()
    const required = new Map(result.requiredFiles.map((entry: { path: string; exists: boolean }) => [entry.path, entry.exists]))

    assert.equal(required.get('docs/deployment/STAGING_SEARCH_VERIFICATION_RUNBOOK.md'), true)
    assert.equal(required.get('docs/deployment/SEARCH_CONSOLE_BING_WEBMASTER_CHECKLIST.md'), true)
    assert.equal(required.get('docs/deployment/RICH_RESULTS_AND_SOCIAL_PREVIEW_QA.md'), true)
    assert.equal(required.get('docs/deployment/MERCHANT_FEED_READINESS_NOTES.md'), true)
    assert.equal(required.get('docs/deployment/AI_DISCOVERY_MANUAL_TEST_PLAN.md'), true)
    assert.equal(required.get('src/app/robots.ts'), true)
    assert.equal(required.get('src/app/sitemap.ts'), true)
    assert.equal(required.get('src/app/opengraph-image.tsx'), true)
  })

  it('keeps future verification areas marked as blocked or future work', async () => {
    const { auditSearchVerificationReadiness } = await import('../scripts/audit-search-verification-readiness.mjs')
    const result = await auditSearchVerificationReadiness()
    const statuses = new Map(result.futureBlockedAreas.map((entry: { id: string; status: string }) => [entry.id, entry.status]))

    assert.equal(statuses.get('google-search-console'), 'blocked-until-hosted-url-and-owner-access')
    assert.equal(statuses.get('bing-webmaster'), 'blocked-until-hosted-url-and-owner-access')
    assert.equal(statuses.get('rich-results-url-test'), 'blocked-until-public-url')
    assert.equal(statuses.get('merchant-center-feed'), 'future-owner-decision')
    assert.equal(statuses.get('ai-discovery-manual-testing'), 'blocked-until-public-indexable-content')
  })

  it('does not claim external search verification is complete', async () => {
    const { auditSearchVerificationReadiness } = await import('../scripts/audit-search-verification-readiness.mjs')
    const result = await auditSearchVerificationReadiness()

    assert.deepEqual(result.completionClaims, [])
  })

  it('keeps staging verification docs free of obvious secret values', async () => {
    const { auditSearchVerificationReadiness } = await import('../scripts/audit-search-verification-readiness.mjs')
    const result = await auditSearchVerificationReadiness()

    assert.deepEqual(result.secretFindings, [])
  })
})
