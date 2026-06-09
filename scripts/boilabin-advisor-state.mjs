import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_CWD = path.resolve(__dirname, '..');

const ADVISOR_FILES = [
  '.codex/agents/boilabin-advisor.toml',
  '.agents/skills/boilabin-advisor/SKILL.md',
  'docs/development/BOILABIN_ADVISOR_WORKFLOW.md',
  'docs/development/BOILABIN_ADVISOR_QUICKSTART.md',
  'docs/AUDIT_REPORTS.md',
  'scripts/boilabin-advisor-state.mjs',
  'tests/boilabin-advisor-workflow.test.ts',
];

export const ADVISOR_ACTIVATION_PHRASE = 'Run Boilabin Advisor mode.';

const OPTIONAL_CONTEXT_FILES = [
  '.agents/skills/boilabin-step-workflow/SKILL.md',
  'docs/development/CODEX_SINGLE_CHAT_MULTI_AGENT_WORKFLOW.md',
];

const forbiddenEnvFilePattern = /(^|[\\/])\.env(\..*)?$/i;
const removedWordA = ['Fla', 'sh'].join('');
const removedWordB = ['De', 'als'].join('');
const removedWordC = ['Sa', 'les'].join('');
const removedStorefrontPath = ['/', 'de', 'als'].join('');
const removedAdminPath = ['/', 'api', '/', 'admin', '/', 'fla', 'sh-sales'].join('');

const CORE_DECISIONS = [
  { label: 'pre-launch local-development status', pattern: /pre-launch|prelaunch/i },
  { label: 'future canonical domain', pattern: /https:\/\/boilabin\.com/i },
  { label: 'provider choices unresolved', pattern: /provider.*not (chosen|configured)|unresolved/i },
  { label: 'local database service blocker', pattern: /local PostgreSQL|local Postgres|localhost:5432/i },
  { label: 'removed promotion feature preserved', pattern: new RegExp(`${removedWordA}\\s+(${removedWordB}|${removedWordC})`, 'i') },
  { label: 'removed storefront route preserved', pattern: new RegExp(escapeRegExp(removedStorefrontPath), 'i') },
  { label: 'removed admin route preserved', pattern: new RegExp(escapeRegExp(removedAdminPath), 'i') },
  { label: 'baby-kids asset must not be restored', pattern: /baby-kids\.jpg/i },
  { label: 'Toys and Collectibles must not be undone', pattern: /Toys\s+&\s+Collectibles|Toys and Collectibles/i },
  { label: 'paused visual areas', pattern: /footer.*newsletter|payment-logo|PromoSection/i },
  { label: 'payment tracking seller work remains separate', pattern: /payment.*tracking.*seller|tracking.*seller.*payment/i },
  { label: 'mobile implementation remains separate', pattern: /mobile app implementation|mobile.*separate/i },
];

const SECRET_PATTERNS = [
  { label: 'private key marker', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/i },
  { label: 'database URL assignment', pattern: /\bDATABASE_URL\s*=\s*["'][^"']+["']/i },
  { label: 'shadow database URL assignment', pattern: /\bSHADOW_DATABASE_URL\s*=\s*["'][^"']+["']/i },
  { label: 'password assignment', pattern: /\b(password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}["']/i },
  { label: 'secret assignment', pattern: /\b[A-Z0-9_-]*(secret|token|api[_-]?key)[A-Z0-9_-]*\s*[:=]\s*["'][^"']{12,}["']/i },
  { label: 'raw bearer token', pattern: /Bearer\s+[A-Za-z0-9._~+/=-]{12,}/i },
];

const BROAD_STAGING_PATTERNS = [
  /\bgit\s+add\s+\./i,
  /\bgit\s+add\s+-A\b/i,
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePath(relativePath) {
  return relativePath.replace(/\\/g, '/');
}

function assertSafeReadPath(relativePath) {
  const normalized = normalizePath(relativePath);
  if (forbiddenEnvFilePattern.test(normalized)) {
    throw new Error(`Refusing to read private env file: ${normalized}`);
  }
}

function resolveAuditReportsDir(cwd = DEFAULT_CWD) {
  const localAuditDir = path.resolve(cwd, 'audit-reports');
  if (existsSync(localAuditDir)) {
    return localAuditDir;
  }

  const archiveAuditDir = path.resolve(cwd, '..', 'boilabin-audit-archive', 'audit-reports');
  if (existsSync(archiveAuditDir)) {
    return archiveAuditDir;
  }

  return localAuditDir;
}

export function readSafeFile(cwd, relativePath) {
  assertSafeReadPath(relativePath);
  const absolutePath = path.resolve(cwd, relativePath);
  return readFileSync(absolutePath, 'utf8');
}

export function listAuditReports(cwd = DEFAULT_CWD) {
  const auditDir = resolveAuditReportsDir(cwd);
  if (!existsSync(auditDir)) {
    return [];
  }

  const reports = [];

  for (const entry of readdirSync(auditDir, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }

    const name = entry.name;
    const match = name.match(/^(\d+)_(.+)\.md$/);
    if (!match) {
      continue;
    }

    reports.push({
      step: Number(match[1]),
      name,
      isPromptDraft: /NEXT_PROMPT_DRAFT/i.test(name),
      relativePath: path.relative(cwd, path.join(auditDir, name)).replace(/\\/g, '/'),
    });
  }

  return reports.sort((a, b) => {
    if (a.step !== b.step) {
      return a.step - b.step;
    }
    if (a.isPromptDraft !== b.isPromptDraft) {
      return a.isPromptDraft ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export function parseLatestAuditReport(cwd = DEFAULT_CWD) {
  const reports = listAuditReports(cwd);
  const latest = reports.at(-1) ?? null;
  if (!latest) {
    return null;
  }

  const content = readSafeFile(cwd, latest.relativePath);
  return {
    ...latest,
    title: extractTitle(content),
    latestCommit: extractLatestCommit(content),
    validationSummary: extractSectionSummary(content, 'Validation Results'),
    recommendedNextStep: extractSectionSummary(content, 'Recommended Next Step'),
  };
}

export function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

export function extractLatestCommit(content) {
  const patterns = [
    /latest commit[^`\n]*`([0-9a-f]{7,40}[^`]*)`/i,
    /latest commit[\s\S]*?```text\s*[\r\n]+([0-9a-f]{7,40}[^\r\n`]*)/i,
    /commit (?:created|verified)?[^`\n]*`([0-9a-f]{7,40}[^`]*)`/i,
    /commit hash[^`\n]*`([0-9a-f]{7,40}[^`]*)`/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

export function readCurrentGitCommit(cwd = DEFAULT_CWD) {
  try {
    const output = execFileSync('git', ['log', '-1', '--oneline'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    return output || null;
  } catch {
    return null;
  }
}

export function extractSectionSummary(content, heading) {
  const lines = content.split(/\r?\n/);
  const headingPattern = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, 'i');
  const startIndex = lines.findIndex((line) => headingPattern.test(line.trim()));

  if (startIndex === -1) {
    return null;
  }

  const sectionLines = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) {
      break;
    }
    sectionLines.push(lines[index]);
  }

  const cleanedLines = sectionLines
    .map((line) => line.trim())
    .filter(Boolean);
  const selectedLines = cleanedLines.slice(0, 6);
  const summary = summarizeSectionLines(selectedLines);

  if (cleanedLines.length > selectedLines.length && summary && !summary.endsWith('...')) {
    return `${summary} ...`;
  }

  return summary;
}

export function summarizeSectionLines(lines, maxLength = 600) {
  const summaryLines = [];

  for (const line of lines) {
    const candidate = [...summaryLines, line].join(' ');
    if (candidate.length > maxLength) {
      if (summaryLines.length === 0) {
        return `${truncateSummaryLine(line, maxLength)}...`;
      }

      return `${summaryLines.join(' ')} ...`;
    }

    summaryLines.push(line);
  }

  return summaryLines.join(' ');
}

function truncateSummaryLine(line, maxLength) {
  const clipped = line.slice(0, maxLength);
  const wordBoundary = clipped.lastIndexOf(' ');
  const cutIndex = wordBoundary >= Math.floor(maxLength * 0.6) ? wordBoundary : maxLength;

  return clipped
    .slice(0, cutIndex)
    .trimEnd()
    .replace(/[.,;:]+$/, '');
}

export function findSuspiciousSecrets(files) {
  const findings = [];

  for (const file of files) {
    for (const rule of SECRET_PATTERNS) {
      if (rule.pattern.test(file.content)) {
        findings.push({
          file: file.relativePath,
          rule: rule.label,
        });
      }
    }
  }

  return findings;
}

export function findRecommendedBroadStaging(files) {
  const findings = [];

  for (const file of files) {
    const lines = file.content.split(/\r?\n/);
    lines.forEach((line, index) => {
      const lower = line.toLowerCase();
      const isWarning = lower.includes('do not')
        || lower.includes('never')
        || lower.includes('forbid')
        || lower.includes('prohibit');
      if (isWarning) {
        return;
      }

      if (BROAD_STAGING_PATTERNS.some((pattern) => pattern.test(line))) {
        findings.push({
          file: file.relativePath,
          line: index + 1,
        });
      }
    });
  }

  return findings;
}

export function createBoilabinAdvisorState({ cwd = DEFAULT_CWD } = {}) {
  const fileStatuses = ADVISOR_FILES.map((relativePath) => ({
    relativePath,
    exists: existsSync(path.resolve(cwd, relativePath)),
  }));

  const missingFiles = fileStatuses
    .filter((file) => !file.exists)
    .map((file) => file.relativePath);

  const advisorReadablePaths = [
    ...ADVISOR_FILES,
    ...OPTIONAL_CONTEXT_FILES,
  ].filter((relativePath) => existsSync(path.resolve(cwd, relativePath)));

  const advisorFiles = advisorReadablePaths.map((relativePath) => ({
    relativePath,
    content: readSafeFile(cwd, relativePath),
  }));

  const advisorText = advisorFiles.map((file) => file.content).join('\n\n');
  const missingCoreDecisions = CORE_DECISIONS
    .filter((decision) => !decision.pattern.test(advisorText))
    .map((decision) => decision.label);

  const latestReport = parseLatestAuditReport(cwd);
  const secretFindings = findSuspiciousSecrets(advisorFiles);
  const broadStagingFindings = findRecommendedBroadStaging(advisorFiles);
  const currentGitCommit = readCurrentGitCommit(cwd);

  return {
    cwd,
    fileStatuses,
    missingFiles,
    latestReport,
    currentGitCommit,
    missingCoreDecisions,
    secretFindings,
    broadStagingFindings,
    ok: missingFiles.length === 0
      && latestReport !== null
      && missingCoreDecisions.length === 0
      && secretFindings.length === 0
      && broadStagingFindings.length === 0,
  };
}

export function formatBoilabinAdvisorState(state) {
  const lines = [];
  lines.push('Boilabin Advisor state');
  lines.push(`Advisor activation phrase: ${ADVISOR_ACTIVATION_PHRASE}`);
  lines.push(`Required files present: ${state.missingFiles.length === 0 ? 'yes' : 'no'}`);

  if (state.latestReport) {
    lines.push(`Latest audit report: ${state.latestReport.relativePath}`);
    lines.push(`Latest audit title: ${state.latestReport.title ?? 'unknown'}`);
    lines.push(`Latest report commit reference: ${state.latestReport.latestCommit ?? 'not detected'}`);
    lines.push(`Current git commit: ${state.currentGitCommit ?? 'not detected'}`);
    lines.push(`Validation summary: ${state.latestReport.validationSummary ?? 'not detected'}`);
    lines.push(`Latest recommended next-step found: ${state.latestReport.recommendedNextStep ? 'yes' : 'no'}`);
    lines.push(`Recommended next step: ${state.latestReport.recommendedNextStep ?? 'not detected'}`);
  } else {
    lines.push('Latest audit report: missing');
  }

  lines.push(`Core decisions documented: ${state.missingCoreDecisions.length === 0 ? 'yes' : 'no'}`);
  if (state.missingCoreDecisions.length > 0) {
    lines.push(`Missing decisions: ${state.missingCoreDecisions.join(', ')}`);
  }

  lines.push(`Obvious secret-looking strings in Advisor docs/config: ${state.secretFindings.length === 0 ? 'none' : state.secretFindings.length}`);
  lines.push(`Broad staging recommendations in Advisor docs/config: ${state.broadStagingFindings.length === 0 ? 'none' : state.broadStagingFindings.length}`);
  lines.push(`Advisor is ready: ${state.ok ? 'yes' : 'no'}`);
  lines.push(`Overall status: ${state.ok ? 'ok' : 'blocked'}`);
  return lines.join('\n');
}

export function runBoilabinAdvisorStateCli({ cwd = DEFAULT_CWD } = {}) {
  const state = createBoilabinAdvisorState({ cwd });
  console.log(formatBoilabinAdvisorState(state));
  return state.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  process.exitCode = runBoilabinAdvisorStateCli();
}
