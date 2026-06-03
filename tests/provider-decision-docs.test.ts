import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import {
  PROVIDER_DECISION_DOCS,
  createProviderDecisionDocsAudit,
  findMissingSections,
  findSuspiciousProviderDecisionDocIssues,
} from '../scripts/audit-provider-decision-docs.mjs'

const ROOT = process.cwd()
const AUDIT_SCRIPT = 'scripts/audit-provider-decision-docs.mjs'

function readRepoFile(pathname: string) {
  return readFileSync(join(ROOT, pathname), 'utf8')
}

describe('provider decision workbook docs and script', () => {
  it('keeps the three decision docs and audit script present', () => {
    for (const doc of PROVIDER_DECISION_DOCS) {
      assert.equal(existsSync(join(ROOT, doc.path)), true, doc.path)
    }

    assert.equal(existsSync(join(ROOT, AUDIT_SCRIPT)), true)
  })

  it('keeps required sections in each decision doc', () => {
    for (const doc of PROVIDER_DECISION_DOCS) {
      const content = readRepoFile(doc.path)

      assert.deepEqual(findMissingSections(content, doc.sections), [], doc.path)
    }
  })

  it('keeps decision docs free of obvious real-secret patterns and deployment commands', () => {
    for (const doc of PROVIDER_DECISION_DOCS) {
      const content = readRepoFile(doc.path)

      assert.deepEqual(findSuspiciousProviderDecisionDocIssues(content, doc.path), [], doc.path)
    }
  })

  it('does not declare a specific provider as chosen', () => {
    const docs = PROVIDER_DECISION_DOCS.map((doc) => readRepoFile(doc.path)).join('\n')

    assert.doesNotMatch(docs, /chosen provider\s*[:=-]\s*\S+/i)
    assert.doesNotMatch(docs, /\bwe (choose|selected|will use|must use)\s+[A-Z][A-Za-z0-9-]+/i)
    assert.doesNotMatch(docs, /\b(best|cheapest|fastest) provider\b/i)
  })

  it('documents database separation, shadow DB safety, backups, and staging noindex', () => {
    const docs = PROVIDER_DECISION_DOCS.map((doc) => readRepoFile(doc.path)).join('\n').toLowerCase()

    assert.match(docs, /staging and production (databases? )?(must never share|must be separate)|separate staging and production databases/)
    assert.match(docs, /shadow database[\s\S]{0,180}(must not be production|separate from the app database)/)
    assert.match(docs, /restore drill|backup[\s\S]{0,160}restore/)
    assert.match(docs, /staging[\s\S]{0,160}(not be indexed|noindex)/)
  })

  it('documents payment/tracking disabled caution and future mobile compatibility', () => {
    const docs = PROVIDER_DECISION_DOCS.map((doc) => readRepoFile(doc.path)).join('\n').toLowerCase()

    assert.match(docs, /payment[\s\S]{0,180}(disabled|not enabled|do not enable)/)
    assert.match(docs, /tracking[\s\S]{0,180}(disabled|not enabled|do not enable)/)
    assert.match(docs, /future (iphone|android|mobile)|mobile app/)
  })

  it('does not reintroduce Flash Deals as an active feature', () => {
    const docs = PROVIDER_DECISION_DOCS.map((doc) => readRepoFile(doc.path)).join('\n').toLowerCase()

    assert.doesNotMatch(docs, /enable flash deals/)
    assert.doesNotMatch(docs, /launch flash deals/)
    assert.match(docs, /flash deals[\s\S]{0,120}remain removed|\/deals[\s\S]{0,120}remain removed/)
  })

  it('runs the provider decision docs audit cleanly without network, DB, or env values', () => {
    const report = createProviderDecisionDocsAudit({ cwd: ROOT })

    assert.equal(report.docsChecked, 3)
    assert.deepEqual(report.missingSections, [])
    assert.deepEqual(report.unsafeIssues, [])
    assert.deepEqual(report.missingTopics, [])
  })
})
