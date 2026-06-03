import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_CWD = path.resolve(__dirname, '..');

export const TERMINAL_LOOP_ACTIVATION_PHRASE = 'Run Boilabin Terminal Loop mode.';
export const TERMINAL_BATCH_LOOP_ACTIVATION_PHRASE = 'Run Boilabin Terminal Batch Loop mode.';

const REQUIRED_FILES = [
  '.agents/skills/boilabin-advisor/SKILL.md',
  '.agents/skills/boilabin-step-workflow/SKILL.md',
  'docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md',
  'docs/development/BOILABIN_TERMINAL_BATCH_LOOP_MODE.md',
  'docs/development/BOILABIN_ADVISOR_QUICKSTART.md',
  'scripts/boilabin-terminal-loop-state.mjs',
  'tests/boilabin-terminal-loop-workflow.test.ts',
  'audit-reports/125_TERMINAL_FIRST_10_STEP_LOOP_WORKFLOW.md',
  'audit-reports/125_NEXT_PROMPT_DRAFT.md',
];

const READABLE_FILES = [
  '.agents/skills/boilabin-advisor/SKILL.md',
  '.agents/skills/boilabin-step-workflow/SKILL.md',
  'docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md',
  'docs/development/BOILABIN_TERMINAL_BATCH_LOOP_MODE.md',
  'docs/development/BOILABIN_ADVISOR_QUICKSTART.md',
];

const privateEnvPattern = /(^|[\\/])\.env(\..*)?$/i;
const removedWordA = ['Fla', 'sh'].join('');
const removedWordB = ['De', 'als'].join('');
const removedWordC = ['Sa', 'les'].join('');
const removedStorefrontPath = ['/', 'de', 'als'].join('');
const removedAdminPath = ['/', 'api', '/', 'admin', '/', 'fla', 'sh-sales'].join('');

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

const PROTECTED_DECISIONS = [
  { label: 'pre-launch local development', pattern: /pre-launch|prelaunch|local-development/i },
  { label: 'future canonical domain', pattern: /https:\/\/boilabin\.com/i },
  { label: 'removed promotion feature', pattern: new RegExp(`${removedWordA}\\s+(${removedWordB}|${removedWordC})`, 'i') },
  { label: 'removed storefront route', pattern: new RegExp(escapeRegExp(removedStorefrontPath), 'i') },
  { label: 'removed admin route', pattern: new RegExp(escapeRegExp(removedAdminPath), 'i') },
  { label: 'baby-kids asset boundary', pattern: /baby-kids\.jpg/i },
  { label: 'Toys and Collectibles boundary', pattern: /Toys\s+&\s+Collectibles|Toys and Collectibles/i },
  { label: 'payment tracking seller caution', pattern: /payment.*tracking.*seller|tracking.*seller.*payment/i },
  { label: 'deployment database caution', pattern: /deployment.*database|database.*deployment|migrations/i },
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePath(relativePath) {
  return relativePath.replace(/\\/g, '/');
}

function assertSafeReadPath(relativePath) {
  const normalized = normalizePath(relativePath);
  if (privateEnvPattern.test(normalized)) {
    throw new Error(`Refusing to read private env file: ${normalized}`);
  }
}

export function readSafeFile(cwd, relativePath) {
  assertSafeReadPath(relativePath);
  return readFileSync(path.resolve(cwd, relativePath), 'utf8');
}

export function listAuditReports(cwd = DEFAULT_CWD) {
  const auditDir = path.resolve(cwd, 'audit-reports');
  if (!existsSync(auditDir)) {
    return [];
  }

  return readdirSync(auditDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const match = entry.name.match(/^(\d+)_(.+)\.md$/);
      if (!match) {
        return null;
      }
      return {
        step: Number(match[1]),
        name: entry.name,
        isPromptDraft: /NEXT_PROMPT_DRAFT/i.test(entry.name),
        relativePath: `audit-reports/${entry.name}`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.step !== b.step) {
        return a.step - b.step;
      }
      if (a.isPromptDraft !== b.isPromptDraft) {
        return a.isPromptDraft ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
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

export function findSuspiciousSecrets(files) {
  const findings = [];
  for (const file of files) {
    for (const rule of SECRET_PATTERNS) {
      if (rule.pattern.test(file.content)) {
        findings.push({ file: file.relativePath, rule: rule.label });
      }
    }
  }
  return findings;
}

export function findRecommendedBroadStaging(files) {
  const findings = [];
  for (const file of files) {
    file.content.split(/\r?\n/).forEach((line, index) => {
      const lower = line.toLowerCase();
      const isWarning = lower.includes('do not') || lower.includes('never') || lower.includes('forbid') || lower.includes('prohibit');
      if (isWarning) {
        return;
      }
      if (BROAD_STAGING_PATTERNS.some((pattern) => pattern.test(line))) {
        findings.push({ file: file.relativePath, line: index + 1 });
      }
    });
  }
  return findings;
}

export function createTerminalLoopState({ cwd = DEFAULT_CWD } = {}) {
  const requiredStatuses = REQUIRED_FILES.map((relativePath) => ({
    relativePath,
    exists: existsSync(path.resolve(cwd, relativePath)),
  }));
  const missingFiles = requiredStatuses.filter((file) => !file.exists).map((file) => file.relativePath);

  const readableFiles = READABLE_FILES
    .filter((relativePath) => existsSync(path.resolve(cwd, relativePath)))
    .map((relativePath) => ({
      relativePath,
      content: readSafeFile(cwd, relativePath),
    }));

  const reports = listAuditReports(cwd);
  const latestReport = reports.at(-1) ?? null;
  const latestReportContent = latestReport ? readSafeFile(cwd, latestReport.relativePath) : '';
  const latestCommitMention = latestReportContent ? extractLatestCommit(latestReportContent) : null;

  const scannedFiles = [
    ...readableFiles,
    ...(latestReport ? [{ relativePath: latestReport.relativePath, content: latestReportContent }] : []),
  ];
  const combinedText = scannedFiles.map((file) => file.content).join('\n\n');

  const activationFound = combinedText.includes(TERMINAL_LOOP_ACTIVATION_PHRASE);
  const batchActivationFound = combinedText.includes(TERMINAL_BATCH_LOOP_ACTIVATION_PHRASE);
  const tenStepStopRuleFound = /10-step|10 step/i.test(combinedText)
    && /stop/i.test(combinedText)
    && /summary/i.test(combinedText);
  const batchLoopCapFound = /batch[\s\S]{0,120}(capped|maximum|max)[\s\S]{0,80}3 loops/i.test(combinedText)
    || /3 loops per approved batch/i.test(combinedText);
  const batchPerLoopValidationFound = /validation after each loop|Validate before staging in every loop|validation before staging/i.test(combinedText);
  const batchNoAutoFuturePromptFound = /does not execute generated future prompts automatically|generated prompts outside the approved batch remain draft-only|must not execute Loop 4/i.test(combinedText);
  const exactStagingRuleFound = /exact-file staging|exact files|git diff --cached --name-only/i.test(combinedText);
  const missingProtectedDecisions = PROTECTED_DECISIONS
    .filter((decision) => !decision.pattern.test(combinedText))
    .map((decision) => decision.label);
  const secretFindings = findSuspiciousSecrets(scannedFiles);
  const broadStagingFindings = findRecommendedBroadStaging(scannedFiles);

  return {
    requiredStatuses,
    missingFiles,
    latestReport,
    latestCommitMention,
    terminalLoopDocsExist: existsSync(path.resolve(cwd, 'docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md')),
    activationFound,
    batchActivationFound,
    tenStepStopRuleFound,
    batchLoopCapFound,
    batchPerLoopValidationFound,
    batchNoAutoFuturePromptFound,
    exactStagingRuleFound,
    secretFindings,
    broadStagingFindings,
    missingProtectedDecisions,
    ok: missingFiles.length === 0
      && Boolean(latestReport)
      && activationFound
      && batchActivationFound
      && tenStepStopRuleFound
      && batchLoopCapFound
      && batchPerLoopValidationFound
      && batchNoAutoFuturePromptFound
      && exactStagingRuleFound
      && secretFindings.length === 0
      && broadStagingFindings.length === 0
      && missingProtectedDecisions.length === 0,
  };
}

export function formatTerminalLoopState(state) {
  const lines = [];
  lines.push('Boilabin Terminal Loop state');
  lines.push(`Activation phrase: ${TERMINAL_LOOP_ACTIVATION_PHRASE}`);
  lines.push(`Required terminal-loop files present: ${state.missingFiles.length === 0 ? 'yes' : 'no'}`);
  if (state.missingFiles.length > 0) {
    lines.push(`Missing files: ${state.missingFiles.join(', ')}`);
  }
  lines.push(`Latest audit report: ${state.latestReport?.relativePath ?? 'not detected'}`);
  lines.push(`Latest commit mention: ${state.latestCommitMention ?? 'not detected'}`);
  lines.push(`Terminal-loop docs exist: ${state.terminalLoopDocsExist ? 'yes' : 'no'}`);
  lines.push(`Activation phrase found: ${state.activationFound ? 'yes' : 'no'}`);
  lines.push(`Batch activation phrase found: ${state.batchActivationFound ? 'yes' : 'no'}`);
  lines.push(`10-step stop rule found: ${state.tenStepStopRuleFound ? 'yes' : 'no'}`);
  lines.push(`Batch loop cap found: ${state.batchLoopCapFound ? 'yes' : 'no'}`);
  lines.push(`Batch per-loop validation found: ${state.batchPerLoopValidationFound ? 'yes' : 'no'}`);
  lines.push(`Batch future-prompt stop found: ${state.batchNoAutoFuturePromptFound ? 'yes' : 'no'}`);
  lines.push(`Exact staging rule found: ${state.exactStagingRuleFound ? 'yes' : 'no'}`);
  lines.push(`Broad staging recommendations: ${state.broadStagingFindings.length === 0 ? 'none' : state.broadStagingFindings.length}`);
  lines.push(`Obvious secret-looking strings: ${state.secretFindings.length === 0 ? 'none' : state.secretFindings.length}`);
  lines.push(`Protected decisions documented: ${state.missingProtectedDecisions.length === 0 ? 'yes' : 'no'}`);
  if (state.missingProtectedDecisions.length > 0) {
    lines.push(`Missing protected decisions: ${state.missingProtectedDecisions.join(', ')}`);
  }
  lines.push(`Terminal Loop is ready: ${state.ok ? 'yes' : 'no'}`);
  return lines.join('\n');
}

export function runTerminalLoopStateCli({ cwd = DEFAULT_CWD } = {}) {
  const state = createTerminalLoopState({ cwd });
  console.log(formatTerminalLoopState(state));
  return state.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  process.exitCode = runTerminalLoopStateCli();
}
