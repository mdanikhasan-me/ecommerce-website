import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Provider decision documentation guardrail only.
// No network calls, no database connections, no file mutation, no private env file reads,
// and no runtime environment value inspection.

export const PROVIDER_DECISION_DOCS = [
  {
    path: 'docs/deployment/PROVIDER_DECISION_WORKBOOK.md',
    sections: [
      'Purpose',
      'What This Workbook Does Not Do',
      'Current Boilabin Constraints',
      'Provider Shortlist Template',
      'Scoring Criteria',
      'Must-Have Requirements',
      'Nice-To-Have Requirements',
      'Red Flags',
      'Staging Requirements',
      'Production Requirements',
      'Secret Manager Requirements',
      'Build/Runtime Requirements',
      'Next.js Compatibility Questions',
      'Bangladesh User Experience Questions',
      'Future Mobile App Compatibility Questions',
      'Payment/Tracking/Seller Marketplace Caution',
      'Decision Table Template',
      'Final Human Decision Checklist',
    ],
  },
  {
    path: 'docs/deployment/DATABASE_AND_BACKUP_DECISION_WORKBOOK.md',
    sections: [
      'Purpose',
      'Current Local DB State',
      'What Is Not Ready Yet',
      'Managed PostgreSQL Requirements',
      'Separate Staging And Production DB Rules',
      'Shadow Database Rules',
      'Migration Approval Rules',
      'Backup Requirements',
      'Restore Drill Requirements',
      'Data Retention Questions',
      'Seed Data Rules',
      'Admin Credential Rules',
      'Order/Customer PII Safety',
      'Rollback Rules',
      'Prisma-Specific Questions',
      'Provider Questions To Ask',
      'Go/No-Go Checklist',
    ],
  },
  {
    path: 'docs/deployment/STORAGE_MONITORING_EMAIL_DECISION_WORKBOOK.md',
    sections: [
      'Purpose',
      'Persistent Upload/Media Storage Requirements',
      'CDN/Static Asset Requirements',
      'Product/Brand/Media Localization Dependency',
      'Monitoring/Error Tracking Requirements',
      'Security Logging Requirements',
      'Alerting Requirements',
      'Email/SMTP Requirements',
      'Newsletter/Contact Form Requirements',
      'Order Notification Requirements',
      'Bounce/Unsubscribe/Compliance Questions',
      'Payment Incident Placeholder',
      'Tracking/PII Incident Placeholder',
      'Future Mobile App Operational Requirements',
      'Provider Questions To Ask',
      'Go/No-Go Checklist',
    ],
  },
]

const FORBIDDEN_PRIVATE_ENV_FILES = new Set(['.env', '.env.local'])

const SECRET_PATTERNS = [
  {
    label: 'private key block',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i,
  },
  {
    label: 'database URL with credentials',
    pattern: /\b(?:postgres|postgresql|mysql|mongodb)(?:\+srv)?:\/\/[^\s:@]+:[^\s@]+@[^\s]+/i,
  },
  {
    label: 'live secret token prefix',
    pattern: /\b(?:sk_live|rk_live|xox[baprs]-|SG\.)[A-Za-z0-9_-]{16,}\b/i,
  },
  {
    label: 'JWT-looking token',
    pattern: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/,
  },
  {
    label: 'long assigned secret value',
    pattern: /\b(?:SECRET|TOKEN|PASSWORD|API_KEY|PRIVATE_KEY)\b\s*[:=]\s*["']?(?!replace|placeholder|example|future|local|staging|production|approved|not-configured)[A-Za-z0-9_./+=-]{32,}/i,
  },
]

const DEPLOYMENT_COMMAND_PATTERNS = [
  /\b(?:vercel|netlify|wrangler|flyctl|railway|render|aws|gcloud|az)\s+(?:deploy|login|link|init|up|publish|push|release)\b/i,
  /\bdocker\s+compose\s+up\b/i,
]

const PROVIDER_CHOICE_PATTERNS = [
  /\bchosen provider\b\s*[:=-]\s*\S+/i,
  /\bwe (?:choose|selected|will use|must use)\s+[A-Z][A-Za-z0-9-]+/i,
  /\b(best|cheapest|fastest) provider\b/i,
]

const PRICING_CLAIM_PATTERNS = [
  /[$€£৳]\s*\d+/,
  /\b\d+\s*(?:usd|bdt|eur|gbp)\b/i,
  /\b(?:free tier|costs?|priced at|per month|monthly price|cheapest)\b/i,
]

const REQUIRED_TOPIC_PATTERNS = [
  { label: 'provider-neutral wording', pattern: /provider-neutral/i },
  { label: 'manual provider verification', pattern: /verify(?: every)? provider facts? manually|verify manually/i },
  { label: 'database separation caution', pattern: /staging and production (?:databases? )?must (?:never share|be separate)|separate staging and production databases/i },
  { label: 'shadow database safety', pattern: /shadow database[\s\S]{0,180}(?:must not be production|separate from the app database)/i },
  { label: 'backup and restore caution', pattern: /restore drill|backup[\s\S]{0,160}restore/i },
  { label: 'staging noindex caution', pattern: /staging[\s\S]{0,160}(?:not be indexed|noindex)/i },
  { label: 'payment disabled caution', pattern: /payment[\s\S]{0,180}(?:disabled|not enabled|do not enable)/i },
  { label: 'tracking disabled caution', pattern: /tracking[\s\S]{0,180}(?:disabled|not enabled|do not enable)/i },
  { label: 'future mobile compatibility', pattern: /future (?:iphone|android|mobile)|mobile app/i },
]

function readDecisionDoc(cwd, relativePath) {
  const normalized = relativePath.replace(/\\/g, '/')
  if (FORBIDDEN_PRIVATE_ENV_FILES.has(normalized)) {
    throw new Error(`Refusing to inspect private env file: ${normalized}`)
  }

  const absolutePath = resolve(cwd, relativePath)
  if (!existsSync(absolutePath)) {
    throw new Error(`Required provider decision doc is missing: ${relativePath}`)
  }

  return readFileSync(absolutePath, 'utf8')
}

export function findMissingSections(content, sections) {
  return sections.filter((section) => {
    const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return !new RegExp(`^## ${escaped}\\s*$`, 'm').test(content)
  })
}

export function findSuspiciousProviderDecisionDocIssues(content, file) {
  const issues = []

  for (const { label, pattern } of SECRET_PATTERNS) {
    if (pattern.test(content)) issues.push({ file, label })
  }

  for (const pattern of DEPLOYMENT_COMMAND_PATTERNS) {
    if (pattern.test(content)) issues.push({ file, label: 'direct deployment or database command wording' })
  }

  for (const pattern of PROVIDER_CHOICE_PATTERNS) {
    if (pattern.test(content)) issues.push({ file, label: 'hardcoded provider choice wording' })
  }

  for (const pattern of PRICING_CLAIM_PATTERNS) {
    if (pattern.test(content)) issues.push({ file, label: 'pricing claim wording' })
  }

  return issues
}

export function createProviderDecisionDocsAudit({ cwd = process.cwd() } = {}) {
  const files = []
  const missingSections = []
  const unsafeIssues = []
  const combinedContentParts = []

  for (const doc of PROVIDER_DECISION_DOCS) {
    const content = readDecisionDoc(cwd, doc.path)
    files.push(doc.path)
    combinedContentParts.push(content)

    for (const section of findMissingSections(content, doc.sections)) {
      missingSections.push({ file: doc.path, section })
    }

    unsafeIssues.push(...findSuspiciousProviderDecisionDocIssues(content, doc.path))
  }

  const combinedContent = combinedContentParts.join('\n\n')
  const missingTopics = REQUIRED_TOPIC_PATTERNS
    .filter(({ pattern }) => !pattern.test(combinedContent))
    .map(({ label }) => label)

  return {
    files,
    docsChecked: files.length,
    missingSections,
    unsafeIssues,
    missingTopics,
  }
}

export function formatProviderDecisionDocsAudit(report) {
  const lines = [
    'Provider decision docs audit: no network, database, env-value, deployment, or file-mutation checks performed.',
    `Decision docs checked: ${report.docsChecked}`,
    `Missing required sections: ${report.missingSections.length}`,
    `Unsafe wording or secret-looking findings: ${report.unsafeIssues.length}`,
    `Missing required topic coverage: ${report.missingTopics.length}`,
  ]

  if (report.missingSections.length > 0) {
    lines.push('Missing sections:')
    for (const item of report.missingSections) {
      lines.push(`- ${item.file}: ${item.section}`)
    }
  }

  if (report.unsafeIssues.length > 0) {
    lines.push('Unsafe findings:')
    for (const item of report.unsafeIssues) {
      lines.push(`- ${item.file}: ${item.label}`)
    }
  }

  if (report.missingTopics.length > 0) {
    lines.push(`Missing topics: ${report.missingTopics.join(', ')}`)
  }

  return lines.join('\n')
}

export function runProviderDecisionDocsAuditCli({
  cwd = process.cwd(),
  stdout = console.log,
  stderr = console.error,
} = {}) {
  try {
    const report = createProviderDecisionDocsAudit({ cwd })
    stdout(formatProviderDecisionDocsAudit(report))

    if (
      report.missingSections.length > 0 ||
      report.unsafeIssues.length > 0 ||
      report.missingTopics.length > 0
    ) {
      return 1
    }

    return 0
  } catch (error) {
    stderr(error instanceof Error ? error.message : 'Provider decision docs audit failed.')
    return 1
  }
}

function isCliEntrypoint() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
}

if (isCliEntrypoint()) {
  process.exit(runProviderDecisionDocsAuditCli())
}
