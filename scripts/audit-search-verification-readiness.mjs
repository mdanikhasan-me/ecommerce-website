import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const REQUIRED_FILES = [
  { path: 'docs/SEO_SEARCH_EVERYWHERE_STRATEGY.md', category: 'search-docs' },
  { path: 'docs/CONTENT_QUALITY_GUIDELINES.md', category: 'content-docs' },
  { path: 'docs/MEDIA_UPLOAD_POLICY.md', category: 'media-docs' },
  { path: 'docs/deployment/STAGING_DEPLOYMENT_RUNBOOK.md', category: 'deployment-docs' },
  { path: 'docs/deployment/STAGING_SEARCH_VERIFICATION_RUNBOOK.md', category: 'deployment-docs' },
  { path: 'docs/deployment/SEARCH_CONSOLE_BING_WEBMASTER_CHECKLIST.md', category: 'deployment-docs' },
  { path: 'docs/deployment/RICH_RESULTS_AND_SOCIAL_PREVIEW_QA.md', category: 'deployment-docs' },
  { path: 'docs/deployment/MERCHANT_FEED_READINESS_NOTES.md', category: 'deployment-docs' },
  { path: 'docs/deployment/AI_DISCOVERY_MANUAL_TEST_PLAN.md', category: 'deployment-docs' },
  { path: 'src/app/robots.ts', category: 'search-surface' },
  { path: 'src/app/sitemap.ts', category: 'search-surface' },
  { path: 'src/app/opengraph-image.tsx', category: 'search-surface' },
  { path: 'src/backend/seo/urls.ts', category: 'seo-helper' },
  { path: 'src/backend/seo/metadata.ts', category: 'seo-helper' },
  { path: 'src/backend/seo/structured-data.ts', category: 'seo-helper' },
  { path: 'tests/seo-policy.test.ts', category: 'tests' },
  { path: 'tests/content-quality-policy.test.ts', category: 'tests' },
  { path: 'tests/search-verification-readiness.test.ts', category: 'tests' },
]

const KEY_SEO_SOURCE_FILES = [
  'src/backend/seo/structured-data.ts',
  'src/backend/seo/metadata.ts',
  'src/backend/seo/constants.ts',
  'src/app/opengraph-image.tsx',
]

const STAGING_DOC_FILES = [
  'docs/deployment/STAGING_SEARCH_VERIFICATION_RUNBOOK.md',
  'docs/deployment/SEARCH_CONSOLE_BING_WEBMASTER_CHECKLIST.md',
  'docs/deployment/RICH_RESULTS_AND_SOCIAL_PREVIEW_QA.md',
  'docs/deployment/MERCHANT_FEED_READINESS_NOTES.md',
  'docs/deployment/AI_DISCOVERY_MANUAL_TEST_PLAN.md',
]

const HYPE_PATTERN =
  /\b(most\s+trusted|trusted\s+marketplace|premium\s+marketplace|best\s+price|leading\s+marketplace|authentic\s+guaranteed|fast\s+delivery|secure\s+checkout|smooth\s+checkout)\b/i

const SECRET_VALUE_PATTERN =
  /(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|sk_live_|pk_live_|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]+PRIVATE KEY-----|(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY)\s*=\s*["'][^"']{12,}["'])/i

const COMPLETION_CLAIM_PATTERN =
  /\b(search console|bing webmaster|merchant center|rich results|schema\.org|social preview)\b.{0,80}\b(verified|submitted|approved|connected|complete|live)\b/i

const FUTURE_BLOCKED_AREAS = [
  {
    id: 'google-search-console',
    status: 'blocked-until-hosted-url-and-owner-access',
    evidence: 'Requires hosted property ownership and Search Console account access.',
  },
  {
    id: 'bing-webmaster',
    status: 'blocked-until-hosted-url-and-owner-access',
    evidence: 'Requires hosted site verification or import from Google Search Console.',
  },
  {
    id: 'rich-results-url-test',
    status: 'blocked-until-public-url',
    evidence: 'URL-based rich-result validation needs an anonymously reachable page.',
  },
  {
    id: 'merchant-center-feed',
    status: 'future-owner-decision',
    evidence: 'Product feed policy, identifiers, shipping, returns, and account setup are not approved.',
  },
  {
    id: 'ai-discovery-manual-testing',
    status: 'blocked-until-public-indexable-content',
    evidence: 'AI answer checks need hosted crawlable pages and time for discovery.',
  },
]

async function fileExists(repoRoot, relativePath) {
  try {
    const stat = await fs.stat(path.join(repoRoot, relativePath))
    return stat.isFile()
  } catch {
    return false
  }
}

async function readOptionalText(repoRoot, relativePath) {
  try {
    return await fs.readFile(path.join(repoRoot, relativePath), 'utf8')
  } catch {
    return null
  }
}

function findLineMatches(text, pattern) {
  return text
    .split(/\r?\n/)
    .map((line, index) => ({ line: index + 1, text: line.trim() }))
    .filter((entry) => pattern.test(entry.text))
}

export async function auditSearchVerificationReadiness(options = {}) {
  const repoRoot = options.repoRoot ?? process.cwd()

  const requiredFiles = await Promise.all(
    REQUIRED_FILES.map(async (entry) => ({
      ...entry,
      exists: await fileExists(repoRoot, entry.path),
    })),
  )

  const hypeFindings = []
  for (const filePath of KEY_SEO_SOURCE_FILES) {
    const text = await readOptionalText(repoRoot, filePath)
    if (!text) continue
    hypeFindings.push(
      ...findLineMatches(text, HYPE_PATTERN).map((finding) => ({
        file: filePath,
        line: finding.line,
        excerpt: finding.text.slice(0, 160),
      })),
    )
  }

  const secretFindings = []
  const completionClaims = []
  for (const filePath of STAGING_DOC_FILES) {
    const text = await readOptionalText(repoRoot, filePath)
    if (!text) continue
    secretFindings.push(
      ...findLineMatches(text, SECRET_VALUE_PATTERN).map((finding) => ({
        file: filePath,
        line: finding.line,
        excerpt: '[redacted]',
      })),
    )
    completionClaims.push(
      ...findLineMatches(text, COMPLETION_CLAIM_PATTERN)
        .filter((finding) => !/\b(do not|not|cannot|blocked|future|later|manual|must wait|no )\b/i.test(finding.text))
        .map((finding) => ({
          file: filePath,
          line: finding.line,
          excerpt: finding.text.slice(0, 160),
        })),
    )
  }

  const missingFiles = requiredFiles.filter((entry) => !entry.exists)
  const passed =
    missingFiles.length === 0 &&
    hypeFindings.length === 0 &&
    secretFindings.length === 0 &&
    completionClaims.length === 0

  return {
    passed,
    requiredFiles,
    missingFiles,
    hypeFindings,
    secretFindings,
    completionClaims,
    futureBlockedAreas: FUTURE_BLOCKED_AREAS,
    networkRequired: false,
    envFilesRead: false,
    databaseRequired: false,
    providerCliRequired: false,
  }
}

async function main() {
  const result = await auditSearchVerificationReadiness()
  console.log(`Search verification readiness audit: ${result.passed ? 'passed' : 'failed'}`)
  console.log(`Required files present: ${result.requiredFiles.length - result.missingFiles.length}/${result.requiredFiles.length}`)
  console.log(`SEO/source hype findings: ${result.hypeFindings.length}`)
  console.log(`Staging doc secret findings: ${result.secretFindings.length}`)
  console.log(`Premature verification completion claims: ${result.completionClaims.length}`)
  console.log(`Future-blocked areas documented: ${result.futureBlockedAreas.length}`)
  console.log('Network required: no')
  console.log('Private env files read: no')
  console.log('Database required: no')
  console.log('Provider CLI required: no')

  if (!result.passed) {
    for (const missing of result.missingFiles) {
      console.log(`missing\t${missing.category}\t${missing.path}`)
    }
    for (const finding of result.hypeFindings) {
      console.log(`hype\t${finding.file}:${finding.line}\t${finding.excerpt}`)
    }
    for (const finding of result.secretFindings) {
      console.log(`secret\t${finding.file}:${finding.line}\t${finding.excerpt}`)
    }
    for (const finding of result.completionClaims) {
      console.log(`premature-claim\t${finding.file}:${finding.line}\t${finding.excerpt}`)
    }
    process.exitCode = 1
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : 'Search verification readiness audit failed')
    process.exitCode = 1
  })
}
