import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Codex workflow documentation guardrail only.
// No network calls, no database connections, no file mutation, no private env file reads,
// and no runtime environment value inspection.

export const CODEX_WORKFLOW_FILES = {
  config: '.codex/config.toml',
  agents: [
    '.codex/agents/boilabin-explorer.toml',
    '.codex/agents/boilabin-guardian.toml',
    '.codex/agents/boilabin-validator.toml',
    '.codex/agents/boilabin-docs-auditor.toml',
  ],
  skill: '.agents/skills/boilabin-step-workflow/SKILL.md',
  doc: 'docs/development/CODEX_SINGLE_CHAT_MULTI_AGENT_WORKFLOW.md',
}

const REQUIRED_AGENT_FIELDS = ['name', 'description', 'developer_instructions']

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

const REQUIRED_DOC_TOPICS = [
  { label: 'single-chat VS Code limitation', pattern: /one VS Code Codex chat|single-chat/i },
  { label: 'real subagents vs simulated lanes', pattern: /real subagents[\s\S]{0,120}simulated lanes|simulated lanes[\s\S]{0,120}real subagents/i },
  { label: 'one writer rule', pattern: /one writer rule|one writer/i },
  { label: 'exact-file staging', pattern: /exact[- ]file staging|stage exact files/i },
  { label: 'secrets warning', pattern: /secrets|private env/i },
  { label: 'DB and migration warning', pattern: /migrations|db push|destructive SQL/i },
  { label: 'deployment warning', pattern: /deploy|provider CLI/i },
  { label: 'payment and tracking warning', pattern: /payment[\s\S]{0,160}tracking|tracking[\s\S]{0,160}payment/i },
  {
    label: 'removed promotion restoration warning',
    pattern: new RegExp(`${['Fla', 'sh'].join('')}\\s+(?:${['De', 'als'].join('')}|${['Sa', 'les'].join('')})`, 'i'),
  },
]

function readWorkflowFile(cwd, relativePath) {
  const normalized = relativePath.replace(/\\/g, '/')
  if (normalized === '.env' || normalized === '.env.local') {
    throw new Error(`Refusing to inspect private env file: ${normalized}`)
  }

  const absolutePath = resolve(cwd, relativePath)
  if (!existsSync(absolutePath)) {
    throw new Error(`Required Codex workflow file is missing: ${relativePath}`)
  }

  return readFileSync(absolutePath, 'utf8')
}

export function hasSkillFrontmatter(content) {
  return /^---\s*\nname:\s*boilabin-step-workflow\s*\ndescription:\s*.+\n---/m.test(content)
}

export function findSuspiciousWorkflowSecrets(content, file) {
  const findings = []

  for (const { label, pattern } of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      findings.push({ file, label })
    }
  }

  return findings
}

export function findRecommendedBroadStaging(content, file) {
  const findings = []
  const lines = content.split(/\r?\n/)

  for (const [index, line] of lines.entries()) {
    if (!/git add\s+(?:\.|-A)\b/.test(line)) continue
    if (/never|do not|don't|prohibit|forbid/i.test(line)) continue
    findings.push({ file, line: index + 1 })
  }

  return findings
}

export function createCodexWorkflowAudit({ cwd = process.cwd() } = {}) {
  const files = [
    CODEX_WORKFLOW_FILES.config,
    ...CODEX_WORKFLOW_FILES.agents,
    CODEX_WORKFLOW_FILES.skill,
    CODEX_WORKFLOW_FILES.doc,
  ]
  const contents = new Map()
  const findings = []

  for (const file of files) {
    const content = readWorkflowFile(cwd, file)
    contents.set(file, content)
    findings.push(...findSuspiciousWorkflowSecrets(content, file))
    findings.push(...findRecommendedBroadStaging(content, file).map((item) => ({
      file: item.file,
      label: `recommended broad staging on line ${item.line}`,
    })))
  }

  const config = contents.get(CODEX_WORKFLOW_FILES.config) ?? ''
  const missingConfig = []
  if (!/^\[agents\]\s*$/m.test(config)) missingConfig.push('[agents]')
  if (!/^\s*max_threads\s*=\s*5\s*$/m.test(config)) missingConfig.push('max_threads = 5')
  if (!/^\s*max_depth\s*=\s*1\s*$/m.test(config)) missingConfig.push('max_depth = 1')

  const missingAgentFields = []
  for (const agentFile of CODEX_WORKFLOW_FILES.agents) {
    const content = contents.get(agentFile) ?? ''
    for (const field of REQUIRED_AGENT_FIELDS) {
      if (!new RegExp(`^${field}\\s*=`, 'm').test(content)) {
        missingAgentFields.push({ file: agentFile, field })
      }
    }
  }

  const skill = contents.get(CODEX_WORKFLOW_FILES.skill) ?? ''
  const missingSkillFrontmatter = !hasSkillFrontmatter(skill)

  const workflowDoc = contents.get(CODEX_WORKFLOW_FILES.doc) ?? ''
  const missingDocTopics = REQUIRED_DOC_TOPICS
    .filter(({ pattern }) => !pattern.test(workflowDoc))
    .map(({ label }) => label)

  return {
    files,
    missingConfig,
    missingAgentFields,
    missingSkillFrontmatter,
    missingDocTopics,
    unsafeFindings: findings,
  }
}

export function formatCodexWorkflowAudit(report) {
  const lines = [
    'Codex multi-agent workflow audit: no network, database, env-value, deployment, or file-mutation checks performed.',
    `Workflow files checked: ${report.files.length}`,
    `Missing config entries: ${report.missingConfig.length}`,
    `Missing agent fields: ${report.missingAgentFields.length}`,
    `Skill frontmatter valid: ${report.missingSkillFrontmatter ? 'no' : 'yes'}`,
    `Missing workflow doc topics: ${report.missingDocTopics.length}`,
    `Unsafe wording or secret-looking findings: ${report.unsafeFindings.length}`,
  ]

  if (report.missingConfig.length > 0) {
    lines.push(`Missing config entries: ${report.missingConfig.join(', ')}`)
  }

  if (report.missingAgentFields.length > 0) {
    lines.push('Missing agent fields:')
    for (const item of report.missingAgentFields) {
      lines.push(`- ${item.file}: ${item.field}`)
    }
  }

  if (report.missingDocTopics.length > 0) {
    lines.push(`Missing workflow doc topics: ${report.missingDocTopics.join(', ')}`)
  }

  if (report.unsafeFindings.length > 0) {
    lines.push('Unsafe findings:')
    for (const item of report.unsafeFindings) {
      lines.push(`- ${item.file}: ${item.label}`)
    }
  }

  return lines.join('\n')
}

export function runCodexWorkflowAuditCli({
  cwd = process.cwd(),
  stdout = console.log,
  stderr = console.error,
} = {}) {
  try {
    const report = createCodexWorkflowAudit({ cwd })
    stdout(formatCodexWorkflowAudit(report))

    if (
      report.missingConfig.length > 0 ||
      report.missingAgentFields.length > 0 ||
      report.missingSkillFrontmatter ||
      report.missingDocTopics.length > 0 ||
      report.unsafeFindings.length > 0
    ) {
      return 1
    }

    return 0
  } catch (error) {
    stderr(error instanceof Error ? error.message : 'Codex workflow audit failed.')
    return 1
  }
}

function isCliEntrypoint() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
}

if (isCliEntrypoint()) {
  process.exit(runCodexWorkflowAuditCli())
}
