import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const REQUIRED_FILES = [
  'scripts/create-local-buyer-fixture.mjs',
  'tests/local-buyer-fixture-guardrail.test.ts',
  'tests/authenticated-checkout-qa-guardrail.test.ts',
  'src/app/(store)/checkout/page.tsx',
  'src/frontend/components/checkout/CheckoutClient.tsx',
]

function readIfExists(cwd, pathname) {
  const absolute = join(cwd, pathname)
  return existsSync(absolute) ? readFileSync(absolute, 'utf8') : ''
}

export function createLocalAuthFixtureReadinessReport({ cwd = process.cwd() } = {}) {
  const packageJson = readIfExists(cwd, 'package.json')
  const fixtureSource = readIfExists(cwd, 'scripts/create-local-buyer-fixture.mjs')
  const checkoutPageSource = readIfExists(cwd, 'src/app/(store)/checkout/page.tsx')
  const checkoutClientSource = readIfExists(cwd, 'src/frontend/components/checkout/CheckoutClient.tsx')
  const envExample = readIfExists(cwd, '.env.local.example')
  const readme = readIfExists(cwd, 'README.md')

  const missingFiles = REQUIRED_FILES.filter((pathname) => !existsSync(join(cwd, pathname)))
  const checks = {
    requiredFilesPresent: missingFiles.length === 0,
    packageScriptPresent: /"auth:buyer:local"\s*:/.test(packageJson) && /"auth:fixture:readiness"\s*:/.test(packageJson),
    fixtureUsesDbSafety: /evaluateDatabaseSafety/.test(fixtureSource) && /safeForLocalMigration/.test(fixtureSource),
    fixtureIsBuyerOnly: /role:\s*'CUSTOMER'/.test(fixtureSource) && !/role:\s*'ADMIN'|role:\s*'SUPER_ADMIN'/.test(fixtureSource),
    fixtureRequiresPassword: /BOILABIN_LOCAL_BUYER_PASSWORD/.test(fixtureSource),
    envExampleDocumentsFixture: /BOILABIN_LOCAL_BUYER_EMAIL/.test(envExample) && /BOILABIN_LOCAL_BUYER_PASSWORD/.test(envExample),
    readmeDocumentsFixture: /auth:buyer:local/.test(readme) && /auth:fixture:readiness/.test(readme),
    checkoutServerGuarded: /const session = await auth\(\)/.test(checkoutPageSource) &&
      /redirect\('\/auth\/login\?callbackUrl=\/checkout&reason=checkout'\)/.test(checkoutPageSource),
    checkoutSubmitOnlyOnClick: /const placeOrder = async/.test(checkoutClientSource) &&
      /onClick=\{placeOrder\}/.test(checkoutClientSource) &&
      /fetch\('\/api\/orders'/.test(checkoutClientSource),
  }

  const readyForManualFixture = Object.values(checks).every(Boolean)
  const status = readyForManualFixture ? 'manual-owner-action-required' : 'blocked'

  return {
    status,
    missingFiles,
    checks,
    nextManualAction: readyForManualFixture
      ? 'Set a local-only buyer password outside git, run auth:buyer:local, sign in locally, then run no-submit checkout shell QA.'
      : 'Fix the missing fixture guardrails before authenticated checkout shell QA.',
    privateEnvFilesRead: false,
    databaseConnectionAttempted: false,
  }
}

export function printReadinessReport(report, stdout = console.log) {
  stdout('Local auth fixture readiness audit: no private env files read, no database connection attempted.')
  stdout(`Status: ${report.status}`)
  stdout(`Missing files: ${report.missingFiles.length ? report.missingFiles.join(', ') : 'none'}`)
  for (const [key, value] of Object.entries(report.checks)) {
    stdout(`${key}: ${value ? 'yes' : 'no'}`)
  }
  stdout(`Next action: ${report.nextManualAction}`)
}

function isCliEntrypoint() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
}

if (isCliEntrypoint()) {
  printReadinessReport(createLocalAuthFixtureReadinessReport())
}
