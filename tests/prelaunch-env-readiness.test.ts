import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import {
  DEPLOYMENT_DOC_FILES,
  SAFE_INSPECTION_FILES,
  createPrelaunchEnvReadinessReport,
  findSuspiciousSecrets,
} from '../scripts/audit-prelaunch-env-readiness.mjs'

const ROOT = process.cwd()
const AUDIT_SCRIPT = 'scripts/audit-prelaunch-env-readiness.mjs'

function readRepoFile(pathname: string) {
  return readFileSync(join(ROOT, pathname), 'utf8')
}

describe('prelaunch env readiness docs and script', () => {
  it('keeps the deployment docs and audit script present', () => {
    for (const pathname of DEPLOYMENT_DOC_FILES) {
      assert.equal(existsSync(join(ROOT, pathname)), true, pathname)
    }

    assert.equal(existsSync(join(ROOT, AUDIT_SCRIPT)), true)
  })

  it('does not configure private env files as readable audit inputs', () => {
    const normalizedInputs = SAFE_INSPECTION_FILES.map((pathname) => pathname.replace(/\\/g, '/'))

    assert.equal(normalizedInputs.includes('.env'), false)
    assert.equal(normalizedInputs.includes('.env.local'), false)
  })

  it('keeps deployment docs free of obvious real-secret patterns', () => {
    for (const pathname of DEPLOYMENT_DOC_FILES) {
      const findings = findSuspiciousSecrets(readRepoFile(pathname), pathname)

      assert.deepEqual(findings, [], pathname)
    }
  })

  it('documents core environment variables from the example files', () => {
    const inventory = readRepoFile('docs/deployment/ENVIRONMENT_VARIABLE_INVENTORY.md')
    const expectedVariables = [
      'DATABASE_URL',
      'SHADOW_DATABASE_URL',
      'AUTH_URL',
      'NEXTAUTH_URL',
      'AUTH_SECRET',
      'NEXTAUTH_SECRET',
      'AUTH_TRUST_HOST',
      'NEXT_PUBLIC_SITE_URL',
      'APP_URL',
      'CSRF_ALLOWED_ORIGINS',
      'ENABLE_CSP_REPORT_ONLY',
      'ENABLE_CSP_REPORT_COLLECTION',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS',
    ]

    for (const variableName of expectedVariables) {
      assert.match(inventory, new RegExp(`\\\`${variableName}\\\``), variableName)
    }
  })

  it('documents disabled payment/tracking, staging noindex, migrations, and mobile compatibility', () => {
    const docs = DEPLOYMENT_DOC_FILES.map(readRepoFile).join('\n').toLowerCase()

    assert.match(docs, /payment[\s\S]{0,200}disabled/)
    assert.match(docs, /tracking[\s\S]{0,200}disabled/)
    assert.match(docs, /staging[\s\S]{0,200}not be indexed|noindex/)
    assert.match(docs, /migration[\s\S]{0,250}separate approved|approved database step/)
    assert.match(docs, /future mobile|mobile app/)
    assert.match(docs, /stable[\s\S]{0,120}media urls|api response contracts/)
  })

  it('does not reintroduce Flash Deals as an active deployment feature', () => {
    const docs = DEPLOYMENT_DOC_FILES.map(readRepoFile).join('\n').toLowerCase()

    assert.doesNotMatch(docs, /enable flash deals/)
    assert.doesNotMatch(docs, /launch flash deals/)
    assert.match(docs, /flash deals[\s\S]{0,120}remain removed|\/deals[\s\S]{0,120}removed/)
  })

  it('creates a safe no-network/no-db readiness report without requiring configured secrets', () => {
    const report = createPrelaunchEnvReadinessReport({ cwd: ROOT })

    assert.equal(report.secretFindings.length, 0)
    assert.ok(report.totalVariablesFound >= 15)
    assert.ok(report.documentedVariables.includes('DATABASE_URL'))
    assert.ok(report.documentedVariables.includes('NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS'))
    assert.ok(report.exampleVariables.includes('AUTH_SECRET'))
    assert.ok(report.sourceVariables.includes('AUTH_TRUST_HOST'))
  })
})
