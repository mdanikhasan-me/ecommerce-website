import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import {
  CODEX_WORKFLOW_FILES,
  createCodexWorkflowAudit,
  findRecommendedBroadStaging,
  findSuspiciousWorkflowSecrets,
  hasSkillFrontmatter,
} from '../scripts/audit-codex-multi-agent-workflow.mjs'

const ROOT = process.cwd()

function readRepoFile(pathname: string) {
  return readFileSync(join(ROOT, pathname), 'utf8')
}

describe('Codex single-chat multi-agent workflow guardrails', () => {
  it('keeps required Codex workflow files present', () => {
    const files = [
      CODEX_WORKFLOW_FILES.config,
      ...CODEX_WORKFLOW_FILES.agents,
      CODEX_WORKFLOW_FILES.skill,
      CODEX_WORKFLOW_FILES.doc,
      'scripts/audit-codex-multi-agent-workflow.mjs',
    ]

    for (const pathname of files) {
      assert.equal(existsSync(join(ROOT, pathname)), true, pathname)
    }
  })

  it('keeps custom agent files with required fields', () => {
    for (const pathname of CODEX_WORKFLOW_FILES.agents) {
      const content = readRepoFile(pathname)

      assert.match(content, /^name\s*=/m, pathname)
      assert.match(content, /^description\s*=/m, pathname)
      assert.match(content, /^developer_instructions\s*=/m, pathname)
    }
  })

  it('keeps skill frontmatter valid', () => {
    assert.equal(hasSkillFrontmatter(readRepoFile(CODEX_WORKFLOW_FILES.skill)), true)
  })

  it('documents single-chat limitation, simulated lanes, and one writer rule', () => {
    const doc = readRepoFile(CODEX_WORKFLOW_FILES.doc)

    assert.match(doc, /one VS Code Codex chat|single-chat/i)
    assert.match(doc, /simulated lanes/i)
    assert.match(doc, /one writer rule|one writer/i)
  })

  it('documents exact-file staging and forbids broad staging commands', () => {
    const doc = readRepoFile(CODEX_WORKFLOW_FILES.doc)

    assert.match(doc, /exact[- ]file staging|stage exact files/i)
    assert.match(doc, /Never use `git add \.`/)
    assert.match(doc, /Never use `git add -A`/)
    assert.deepEqual(findRecommendedBroadStaging(doc, CODEX_WORKFLOW_FILES.doc), [])
  })

  it('preserves Flash Deals removal and media decisions', () => {
    const doc = readRepoFile(CODEX_WORKFLOW_FILES.doc)

    assert.match(doc, /Do not restore Flash Deals or Flash Sales/)
    assert.match(doc, /Do not restore Baby & Kids/)
    assert.match(doc, /Do not undo Toys & Collectibles/)
  })

  it('keeps new workflow docs and config free of obvious secret-looking strings', () => {
    const files = [
      CODEX_WORKFLOW_FILES.config,
      ...CODEX_WORKFLOW_FILES.agents,
      CODEX_WORKFLOW_FILES.skill,
      CODEX_WORKFLOW_FILES.doc,
    ]

    for (const pathname of files) {
      assert.deepEqual(findSuspiciousWorkflowSecrets(readRepoFile(pathname), pathname), [], pathname)
    }
  })

  it('runs the Codex workflow audit cleanly', () => {
    const report = createCodexWorkflowAudit({ cwd: ROOT })

    assert.deepEqual(report.missingConfig, [])
    assert.deepEqual(report.missingAgentFields, [])
    assert.equal(report.missingSkillFrontmatter, false)
    assert.deepEqual(report.missingDocTopics, [])
    assert.deepEqual(report.unsafeFindings, [])
  })
})
