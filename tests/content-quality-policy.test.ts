import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('content quality marketing-copy guardrail', () => {
  it('flags unsupported generic marketplace claims', async () => {
    const { findMarketingCopyFindings } = await import('../scripts/audit-ai-marketing-copy.mjs')
    const findings = findMarketingCopyFindings(
      "Bangladesh's most trusted premium marketplace and ultimate one-stop shop.",
      'sample.tsx',
    )

    assert.ok(findings.some((finding: { id: string }) => finding.id === 'most-trusted'))
    assert.ok(findings.some((finding: { id: string }) => finding.id === 'premium'))
    assert.ok(findings.some((finding: { id: string }) => finding.id === 'ultimate'))
    assert.ok(findings.some((finding: { id: string }) => finding.id === 'one-stop'))
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
})
