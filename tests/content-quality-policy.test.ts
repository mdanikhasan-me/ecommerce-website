import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('content quality marketing-copy guardrail', () => {
  it('flags unsupported generic marketplace claims', async () => {
    const { findMarketingCopyFindings } = await import('../scripts/audit-ai-marketing-copy.mjs')
    const findings = findMarketingCopyFindings(
      "Bangladesh's most trusted premium marketplace and ultimate one-stop shop.",
      'src/app/(store)/sample/page.tsx',
    )

    assert.ok(findings.some((finding: { id: string }) => finding.id === 'most-trusted'))
    assert.ok(findings.some((finding: { id: string }) => finding.id === 'premium'))
    assert.ok(findings.some((finding: { id: string }) => finding.id === 'ultimate'))
    assert.ok(findings.some((finding: { id: string }) => finding.id === 'one-stop'))
    assert.ok(findings.every((finding: { policy: string }) => finding.policy === 'hard-blocked'))
    assert.ok(findings.every((finding: { category: string }) => finding.category === 'source-visible-copy'))
  })

  it('allows factual product/category wording', async () => {
    const { findMarketingCopyFindings } = await import('../scripts/audit-ai-marketing-copy.mjs')
    const findings = findMarketingCopyFindings(
      'Browse Hot Wheels cars, multipacks, and collectible die-cast models available from sellers in Bangladesh.',
      'sample.tsx',
    )

    assert.equal(findings.length, 0)
  })

  it('keeps private env files outside content scans', async () => {
    const { shouldSkipContentPath } = await import('../scripts/audit-ai-marketing-copy.mjs')
    assert.equal(shouldSkipContentPath('.env'), true)
    assert.equal(shouldSkipContentPath('.env.local'), true)
    assert.equal(shouldSkipContentPath('public/uploads/products/example.webp'), true)
  })

  it('classifies review-only claims without weakening hard-blocked findings', async () => {
    const { findMarketingCopyFindings } = await import('../scripts/audit-ai-marketing-copy.mjs')
    const findings = findMarketingCopyFindings(
      'Fast delivery, secure checkout, and smooth checkout for authentic products.',
      'src/app/(store)/faq/page.tsx',
    )

    assert.ok(findings.some((finding: { id: string; policy: string }) => finding.id === 'fast-delivery' && finding.policy === 'review-only'))
    assert.ok(findings.some((finding: { id: string; policy: string }) => finding.id === 'secure-checkout' && finding.policy === 'review-only'))
    assert.ok(findings.some((finding: { id: string; policy: string }) => finding.id === 'smooth-checkout' && finding.policy === 'review-only'))
    assert.ok(findings.some((finding: { id: string; policy: string }) => finding.id === 'authentic' && finding.policy === 'review-only'))
    assert.ok(findings.every((finding: { category: string }) => finding.category === 'source-visible-copy'))
  })

  it('keeps functional internal labels from becoming visible-copy findings', async () => {
    const { classifyContentArea, findMarketingCopyFindings } = await import('../scripts/audit-ai-marketing-copy.mjs')

    assert.equal(classifyContentArea('src/backend/types/product.ts', 'isBestSeller: boolean'), 'internal-identifier')
    assert.deepEqual(
      findMarketingCopyFindings('const TRUSTED_FETCH_SITES = new Set(["same-origin"])', 'src/backend/security/request-guard.ts'),
      [],
    )
  })

  it('classifies schema and social-preview surfaces explicitly', async () => {
    const { classifyContentArea, findMarketingCopyFindings } = await import('../scripts/audit-ai-marketing-copy.mjs')

    assert.equal(
      classifyContentArea('src/backend/seo/structured-data.ts', 'authentic guaranteed'),
      'structured-data',
    )
    assert.equal(
      classifyContentArea('src/app/opengraph-image.tsx', 'Authentic products and smooth checkout'),
      'opengraph-social-preview',
    )

    const findings = findMarketingCopyFindings(
      'Authentic products and smooth checkout with cash on delivery.',
      'src/app/opengraph-image.tsx',
    )

    assert.ok(findings.some((finding: { id: string }) => finding.id === 'authentic'))
    assert.ok(findings.some((finding: { id: string }) => finding.id === 'smooth-checkout'))
    assert.ok(findings.every((finding: { category: string }) => finding.category === 'opengraph-social-preview'))
  })
})
