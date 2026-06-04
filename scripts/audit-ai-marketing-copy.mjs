import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export const HARD_BLOCKED_COPY_PATTERNS = [
  { id: 'most-trusted', pattern: /\bmost\s+trusted\b/i, severity: 'high' },
  { id: 'trusted', pattern: /\btrusted\b/i, severity: 'medium' },
  { id: 'premium', pattern: /\bpremium\b/i, severity: 'medium' },
  { id: 'best', pattern: /\bbest\s+(price|prices|products?|deals?|marketplace|quality|selection)\b/i, severity: 'medium' },
  { id: 'number-one', pattern: /\b(number\s+one|#1)\b/i, severity: 'high' },
  { id: 'top-marketplace', pattern: /\btop\s+marketplace\b/i, severity: 'high' },
  { id: 'authentic-guaranteed', pattern: /\bauthentic\s+guaranteed\b/i, severity: 'high' },
  { id: 'shop-with-confidence', pattern: /\bshop\s+with\s+confidence\b/i, severity: 'medium' },
  { id: 'leading', pattern: /\b(bangladesh'?s\s+leading|leading\s+(marketplace|platform|store|online|ecommerce|shopping))\b/i, severity: 'medium' },
  { id: 'world-class', pattern: /\bworld[-\s]class\b/i, severity: 'high' },
  { id: 'unbeatable', pattern: /\bunbeatable\b/i, severity: 'high' },
  { id: 'ultimate', pattern: /\bultimate\b/i, severity: 'medium' },
  { id: 'seamless-shopping', pattern: /\bseamless\s+shopping\b/i, severity: 'medium' },
  { id: 'one-stop', pattern: /\bone[-\s]stop\b/i, severity: 'medium' },
  { id: 'curated-just-for-you', pattern: /\bcurated\s+just\s+for\s+you\b/i, severity: 'medium' },
  { id: 'discover-amazing', pattern: /\bdiscover\s+amazing\b/i, severity: 'medium' },
  { id: 'bangladesh-leading', pattern: /\bbangladesh'?s\s+leading\b/i, severity: 'high' },
]

export const REVIEW_ONLY_COPY_PATTERNS = [
  { id: 'reliable', pattern: /\breliable\b/i, severity: 'low' },
  { id: 'fast-delivery', pattern: /\bfast\s+(delivery|shipping)\b/i, severity: 'medium' },
  { id: 'secure-checkout', pattern: /\bsecure\s+checkout\b/i, severity: 'medium' },
  { id: 'authentic', pattern: /\bauthentic\b/i, severity: 'medium' },
  { id: 'loved-by-thousands', pattern: /\bloved\s+by\s+thousands\b/i, severity: 'high' },
]

export const MARKETING_COPY_PATTERNS = [
  ...HARD_BLOCKED_COPY_PATTERNS.map((pattern) => ({ ...pattern, policy: 'hard-blocked' })),
  ...REVIEW_ONLY_COPY_PATTERNS.map((pattern) => ({ ...pattern, policy: 'review-only' })),
]

const DEFAULT_ROOTS = [
  'README.md',
  'src',
  'prisma/seed.ts',
  'public/assets/README.md',
  'docs/CONTENT_QUALITY_GUIDELINES.md',
  'docs/SEO_SEARCH_EVERYWHERE_STRATEGY.md',
]
const TEXT_EXTENSIONS = new Set(['.md', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'])
const SKIPPED_PARTS = new Set([
  '.git',
  '.next',
  'node_modules',
  'audit-reports',
  'public/uploads',
  'prisma/migrations',
])

export function shouldSkipContentPath(filePath) {
  const normalized = filePath.replace(/\\/g, '/')
  if (/^\.env(\.|$)/.test(path.basename(normalized))) return true
  return [...SKIPPED_PARTS].some((part) => normalized === part || normalized.startsWith(`${part}/`))
}

export function classifyContentArea(filePath, excerpt = '') {
  const normalized = filePath.replace(/\\/g, '/')
  const line = excerpt.toLowerCase()

  if (normalized === 'README.md' || normalized.startsWith('docs/')) return 'docs'
  if (normalized === 'prisma/seed.ts') return 'seed-demo'
  if (normalized.includes('/admin/') || normalized.includes('ProductEditorForm')) return 'admin-input-helper'
  if (normalized.includes('/seo/') || normalized === 'src/app/layout.tsx') return 'seo-metadata'
  if (normalized.includes('/layout/Footer') || normalized.includes('/home/') || normalized.includes('/content/')) return 'source-visible-copy'
  if (normalized.startsWith('src/app/(store)/')) return 'source-visible-copy'
  if (/isBestSeller|pinnedInBestSeller|bestRating|worstRating|trusted-fetch-site|AUTH_TRUST_HOST/i.test(excerpt)) {
    return 'internal-identifier'
  }
  if (line.includes('placeholder') || line.includes('meta description')) return 'admin-input-helper'

  return normalized.startsWith('src/') ? 'source-code' : 'unknown'
}

function isAllowedTechnicalLine(line) {
  return /trusted-fetch-site|TRUSTED_FETCH|AUTH_TRUST_HOST|trusted reverse proxies|trusted proxy/i.test(line)
}

function isTextFile(filePath) {
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

async function collectFiles(root, repoRoot) {
  const absolute = path.resolve(repoRoot, root)
  let stat
  try {
    stat = await fs.stat(absolute)
  } catch {
    return []
  }

  const relative = path.relative(repoRoot, absolute).replace(/\\/g, '/')
  if (shouldSkipContentPath(relative)) return []

  if (stat.isFile()) return isTextFile(absolute) ? [absolute] : []
  if (!stat.isDirectory()) return []

  const entries = await fs.readdir(absolute, { withFileTypes: true })
  const nested = await Promise.all(entries.map((entry) => collectFiles(path.join(relative, entry.name), repoRoot)))
  return nested.flat()
}

export function findMarketingCopyFindings(text, filePath = 'inline') {
  const findings = []
  const lines = text.split(/\r?\n/)

  for (const [index, line] of lines.entries()) {
    if (isAllowedTechnicalLine(line)) continue

    for (const pattern of MARKETING_COPY_PATTERNS) {
      if (pattern.pattern.test(line)) {
        const excerpt = line.trim().slice(0, 180)
        findings.push({
          file: filePath,
          line: index + 1,
          id: pattern.id,
          severity: pattern.severity,
          policy: pattern.policy,
          category: classifyContentArea(filePath, excerpt),
          excerpt,
        })
      }
    }
  }

  return findings
}

export async function auditMarketingCopy(options = {}) {
  const repoRoot = options.repoRoot ?? process.cwd()
  const roots = options.roots ?? DEFAULT_ROOTS
  const files = (await Promise.all(roots.map((root) => collectFiles(root, repoRoot)))).flat()
  const findings = []

  for (const file of files) {
    const relative = path.relative(repoRoot, file).replace(/\\/g, '/')
    const text = await fs.readFile(file, 'utf8')
    findings.push(...findMarketingCopyFindings(text, relative))
  }

  return {
    scannedFiles: files.length,
    findings,
    bySeverity: findings.reduce((acc, finding) => {
      acc[finding.severity] = (acc[finding.severity] ?? 0) + 1
      return acc
    }, {}),
  }
}

async function main() {
  const result = await auditMarketingCopy()
  console.log(`Content quality audit: ${result.scannedFiles} files scanned, ${result.findings.length} findings.`)
  for (const finding of result.findings.slice(0, 50)) {
    console.log(`${finding.severity}\t${finding.policy}\t${finding.category}\t${finding.file}:${finding.line}\t${finding.id}\t${finding.excerpt}`)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : 'Content quality audit failed')
    process.exitCode = 1
  })
}
