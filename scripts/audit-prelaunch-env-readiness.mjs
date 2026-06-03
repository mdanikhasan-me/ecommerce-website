import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Documentation/readiness guardrail only.
// This script makes no network calls, opens no database connections, mutates no files,
// does not inspect private env files, and does not read runtime environment values.

export const DEPLOYMENT_DOC_FILES = [
  'docs/deployment/STAGING_DEPLOYMENT_RUNBOOK.md',
  'docs/deployment/ENVIRONMENT_VARIABLE_INVENTORY.md',
  'docs/deployment/OPERATIONS_AND_ROLLBACK_CHECKLIST.md',
]

export const SAFE_EXAMPLE_FILES = [
  '.env.example',
  '.env.local.example',
]

export const SAFE_SOURCE_REFERENCE_FILES = [
  'package.json',
  'next.config.js',
  'prisma/schema.prisma',
  'src/backend/auth/host.ts',
  'src/backend/auth/config.ts',
  'src/backend/auth/index.ts',
  'src/backend/config/payment.ts',
  'src/backend/config/site.ts',
  'src/backend/security/request-guard.ts',
  'src/backend/security/csp.ts',
  'src/backend/seo/urls.ts',
  'scripts/check-db-url-safety.mjs',
  'scripts/run-prisma-local.mjs',
  'scripts/run-prisma-seed-local.mjs',
  'scripts/set-local-admin-password.mjs',
  'scripts/local-browser-runtime-check.mjs',
  'scripts/local-runtime-smoke.mjs',
]

export const SAFE_INSPECTION_FILES = [
  ...SAFE_EXAMPLE_FILES,
  ...SAFE_SOURCE_REFERENCE_FILES,
  ...DEPLOYMENT_DOC_FILES,
]

export const FORBIDDEN_PRIVATE_ENV_FILES = ['.env', '.env.local']

const KNOWN_ENV_PREFIXES = [
  'APP_',
  'AUTH_',
  'BOILABIN_',
  'CF_',
  'CSRF_',
  'DATABASE_',
  'ENABLE_CSP_',
  'FLY_',
  'GOOGLE_',
  'NETLIFY',
  'NEXT_PUBLIC_',
  'NEXT_TELEMETRY_',
  'NEXTAUTH_',
  'NODE_ENV',
  'RAILWAY_',
  'RENDER',
  'SHADOW_',
  'VERCEL',
]

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

function uniqueSorted(values) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
}

function isKnownEnvName(name) {
  return KNOWN_ENV_PREFIXES.some((prefix) => name === prefix || name.startsWith(prefix))
}

function readSafeFile(cwd, relativePath) {
  const normalized = relativePath.replace(/\\/g, '/')
  if (FORBIDDEN_PRIVATE_ENV_FILES.includes(normalized)) {
    throw new Error(`Refusing to inspect private env file: ${normalized}`)
  }

  const absolutePath = resolve(cwd, relativePath)
  if (!existsSync(absolutePath)) {
    throw new Error(`Required readiness file is missing: ${relativePath}`)
  }

  return readFileSync(absolutePath, 'utf8')
}

export function extractExampleVariables(content) {
  const names = []
  const assignmentPattern = /^([A-Za-z_][A-Za-z0-9_]*)\s*=/gm
  let match

  while ((match = assignmentPattern.exec(content))) {
    names.push(match[1])
  }

  return uniqueSorted(names.filter(isKnownEnvName))
}

export function extractReferencedVariables(content) {
  const names = []
  const patterns = [
    /process\.env\.([A-Z][A-Z0-9_]*)/g,
    /\benv\.([A-Z][A-Z0-9_]*)/g,
    /\benv\(["']([A-Z][A-Z0-9_]*)["']\)/g,
    /\b([A-Z][A-Z0-9_]{2,})\b/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(content))) {
      names.push(match[1])
    }
  }

  return uniqueSorted(names.filter(isKnownEnvName))
}

export function findSuspiciousSecrets(content, file) {
  const findings = []

  for (const { label, pattern } of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      findings.push({ file, label })
    }
  }

  return findings
}

export function createPrelaunchEnvReadinessReport({ cwd = process.cwd() } = {}) {
  for (const file of SAFE_INSPECTION_FILES) {
    const normalized = file.replace(/\\/g, '/')
    if (FORBIDDEN_PRIVATE_ENV_FILES.includes(normalized)) {
      throw new Error(`Unsafe inspection target configured: ${normalized}`)
    }
  }

  const exampleVariables = new Set()
  const sourceVariables = new Set()
  const documentedVariables = new Set()
  const secretFindings = []

  for (const file of SAFE_EXAMPLE_FILES) {
    const content = readSafeFile(cwd, file)
    for (const name of extractExampleVariables(content)) exampleVariables.add(name)
  }

  for (const file of SAFE_SOURCE_REFERENCE_FILES) {
    const content = readSafeFile(cwd, file)
    for (const name of extractReferencedVariables(content)) sourceVariables.add(name)
  }

  for (const file of DEPLOYMENT_DOC_FILES) {
    const content = readSafeFile(cwd, file)
    for (const name of extractReferencedVariables(content)) documentedVariables.add(name)
    secretFindings.push(...findSuspiciousSecrets(content, file))
  }

  const foundVariables = new Set([
    ...exampleVariables,
    ...sourceVariables,
    ...documentedVariables,
  ])

  const possibleUndocumentedVariables = uniqueSorted(
    [...foundVariables].filter((name) => !documentedVariables.has(name)),
  )

  return {
    inspectedFiles: SAFE_INSPECTION_FILES,
    totalVariablesFound: foundVariables.size,
    exampleVariables: uniqueSorted(exampleVariables),
    sourceVariables: uniqueSorted(sourceVariables),
    documentedVariables: uniqueSorted(documentedVariables),
    possibleUndocumentedVariables,
    secretFindings,
  }
}

export function formatPrelaunchEnvReadinessReport(report) {
  const lines = [
    'Prelaunch environment readiness audit: no network, database, env-value, or file-mutation checks performed.',
    `Inspected safe files: ${report.inspectedFiles.length}`,
    `Total variable names found: ${report.totalVariablesFound}`,
    `Variables documented in deployment inventory/docs: ${report.documentedVariables.length}`,
    `Variables seen in safe example files: ${report.exampleVariables.length}`,
    `Variables seen in source/config references: ${report.sourceVariables.length}`,
    `Possible undocumented variables: ${report.possibleUndocumentedVariables.length}`,
  ]

  if (report.possibleUndocumentedVariables.length > 0) {
    lines.push(`Possible undocumented variables: ${report.possibleUndocumentedVariables.join(', ')}`)
  }

  if (report.secretFindings.length > 0) {
    lines.push('Suspicious secret-looking strings found in deployment docs:')
    for (const finding of report.secretFindings) {
      lines.push(`- ${finding.file}: ${finding.label}`)
    }
  } else {
    lines.push('Suspicious secret-looking strings in deployment docs: none')
  }

  return lines.join('\n')
}

export function runPrelaunchEnvReadinessCli({
  cwd = process.cwd(),
  stdout = console.log,
  stderr = console.error,
} = {}) {
  try {
    const report = createPrelaunchEnvReadinessReport({ cwd })
    stdout(formatPrelaunchEnvReadinessReport(report))

    if (report.secretFindings.length > 0) {
      return 1
    }

    return 0
  } catch (error) {
    stderr(error instanceof Error ? error.message : 'Prelaunch env readiness audit failed.')
    return 1
  }
}

function isCliEntrypoint() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
}

if (isCliEntrypoint()) {
  process.exit(runPrelaunchEnvReadinessCli())
}
