import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import {
  TERMINAL_BATCH_LOOP_ACTIVATION_PHRASE,
  TERMINAL_LOOP_ACTIVATION_PHRASE,
  createTerminalLoopState,
  extractLatestCommit,
  extractTitle,
  findRecommendedBroadStaging,
  findSuspiciousSecrets,
  formatTerminalLoopState,
  listAuditReports,
  readCurrentGitCommit,
  readSafeFile,
} from '../scripts/boilabin-terminal-loop-state.mjs';

const repoRoot = process.cwd();

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function reportNames(reports: Array<{ name: string } | null>) {
  return reports.map((report) => {
    if (!report) {
      assert.fail('audit report listing should not include null entries');
    }

    return report.name;
  });
}

const terminalLoopFiles = [
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

test('terminal-loop workflow files exist', () => {
  for (const relativePath of terminalLoopFiles) {
    assert.equal(existsSync(path.join(repoRoot, relativePath)), true, `${relativePath} should exist`);
  }
});

test('terminal-loop activation phrase is documented across workflow surfaces', () => {
  for (const relativePath of [
    '.agents/skills/boilabin-advisor/SKILL.md',
    '.agents/skills/boilabin-step-workflow/SKILL.md',
    'docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md',
    'docs/development/BOILABIN_ADVISOR_QUICKSTART.md',
    'audit-reports/125_NEXT_PROMPT_DRAFT.md',
  ]) {
    assert.match(readRepoFile(relativePath), new RegExp(TERMINAL_LOOP_ACTIVATION_PHRASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('terminal-loop doc defines the bounded 10-step terminal-first workflow', () => {
  const doc = readRepoFile('docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md');

  assert.match(doc, /terminal-first/i);
  assert.match(doc, /10-Step Loop/i);
  assert.match(doc, /Terminal baseline/i);
  assert.match(doc, /Multi-agent planning/i);
  assert.match(doc, /Evidence review/i);
  assert.match(doc, /Coordinator decision/i);
  assert.match(doc, /one writer/i);
  assert.match(doc, /Create the audit `\.md`/i);
  assert.match(doc, /Validate/i);
  assert.match(doc, /Stage exact files/i);
});

test('terminal batch loop mode is documented as optional and capped', () => {
  const batchDoc = readRepoFile('docs/development/BOILABIN_TERMINAL_BATCH_LOOP_MODE.md');
  const terminalDoc = readRepoFile('docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md');

  assert.match(batchDoc, new RegExp(TERMINAL_BATCH_LOOP_ACTIVATION_PHRASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(batchDoc, /optional/i);
  assert.match(batchDoc, /capped at 3 loops/i);
  assert.match(batchDoc, /one shared bounded theme/i);
  assert.match(batchDoc, /exact allowed files for each loop/i);
  assert.match(batchDoc, /validation/i);
  assert.match(batchDoc, /exact-file staging/i);
  assert.match(batchDoc, /one commit per successful loop/i);
  assert.match(batchDoc, /stop conditions after every loop/i);
  assert.match(batchDoc, /reviewer checks/i);
  assert.match(batchDoc, /must not execute Loop 4/i);
  assert.match(terminalDoc, /default remains one approved 10-step loop/i);
});

test('terminal batch loop mode rejects autonomous automation language', () => {
  const combined = [
    readRepoFile('docs/development/BOILABIN_TERMINAL_BATCH_LOOP_MODE.md'),
    readRepoFile('docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md'),
    readRepoFile('docs/development/CODEX_SINGLE_CHAT_MULTI_AGENT_WORKFLOW.md'),
  ].join('\n');

  assert.match(combined, /not forever-running automation/i);
  assert.match(combined, /not background automation/i);
  assert.match(combined, /not automatic approval/i);
  assert.match(combined, /Generated prompts outside the approved batch remain draft-only/i);
  assert.doesNotMatch(combined, /run forever/i);
  assert.doesNotMatch(combined, /may auto-approve|can auto-approve|will auto-approve/i);
});

test('terminal-loop docs preserve stop and approval boundaries', () => {
  const combined = [
    readRepoFile('docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md'),
    readRepoFile('.agents/skills/boilabin-step-workflow/SKILL.md'),
    readRepoFile('.agents/skills/boilabin-advisor/SKILL.md'),
  ].join('\n');

  assert.match(combined, /not a forever-running/i);
  assert.match(combined, /does not auto-approve/i);
  assert.match(combined, /Do not execute the next prompt until the user approves it|Do not execute the next prompt until I approve it/i);
  assert.match(combined, /After step 10, Codex must stop/i);
  assert.match(combined, /real read-only subagents|simulated lanes/i);
});

test('terminal-loop docs preserve exact-file staging rules', () => {
  const doc = readRepoFile('docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md');

  assert.match(doc, /Stage exact files only/i);
  assert.match(doc, /Never use `git add \.`/i);
  assert.match(doc, /Never use `git add -A`/i);
  assert.match(doc, /git diff --cached --name-only/i);
});

test('terminal-loop docs preserve protected Boilabin decisions', () => {
  const combined = [
    readRepoFile('docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md'),
    readRepoFile('.agents/skills/boilabin-step-workflow/SKILL.md'),
    readRepoFile('.agents/skills/boilabin-advisor/SKILL.md'),
  ].join('\n');

  assert.match(combined, /Flash Deals or Flash Sales/i);
  assert.match(combined, /\/deals/i);
  assert.match(combined, /\/api\/admin\/flash-sales/i);
  assert.match(combined, /Baby & Kids/i);
  assert.match(combined, /Toys & Collectibles/i);
  assert.match(combined, /payment.*tracking.*seller/i);
  assert.match(combined, /deployment/i);
  assert.match(combined, /migrations/i);
});

test('terminal-loop state script avoids removed promotion literals that active script scans reject', () => {
  const script = readRepoFile('scripts/boilabin-terminal-loop-state.mjs');
  assert.doesNotMatch(script, /flash[\s_-]*(sale|deal)s?|FlashSale|FlashDeal|\/deals/i);
});

test('terminal-loop state script reports ready state', () => {
  const state = createTerminalLoopState({ cwd: repoRoot });
  const formatted = formatTerminalLoopState(state);

  assert.equal(state.ok, true);
  assert.equal(state.missingFiles.length, 0);
  assert.equal(state.batchActivationFound, true);
  assert.equal(state.batchLoopCapFound, true);
  assert.equal(state.batchPerLoopValidationFound, true);
  assert.equal(state.batchNoAutoFuturePromptFound, true);
  assert.equal(state.secretFindings.length, 0);
  assert.equal(state.broadStagingFindings.length, 0);
  assert.doesNotMatch(state.latestReport?.relativePath ?? '', /NEXT_PROMPT_DRAFT/i);
  assert.match(state.latestReportTitle ?? '', /^Step \d+ .+/);
  assert.match(state.currentGitCommit ?? '', /^[0-9a-f]{7,40}\s+.+/);
  assert.match(formatted, /Boilabin Terminal Loop state/);
  assert.match(formatted, /Terminal Loop is ready: yes/);
  assert.doesNotMatch(formatted, /Latest audit report: .*NEXT_PROMPT_DRAFT/i);
  assert.match(formatted, /Latest audit title: Step \d+ .+/);
  assert.match(formatted, /Current git commit: [0-9a-f]{7,40}\s+.+/);
  assert.match(formatted, /Batch loop cap found: yes/);
});

test('terminal-loop audit report listing keeps same-step prompt drafts before completed reports', () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'boilabin-terminal-audit-'));

  try {
    mkdirSync(path.join(tempRoot, 'audit-reports'));
    writeFileSync(path.join(tempRoot, 'audit-reports', '998_OLDER_REPORT.md'), '# Step 998 Older\n');
    writeFileSync(path.join(tempRoot, 'audit-reports', '999_NEXT_PROMPT_DRAFT.md'), '# Step 1000 Next Prompt Draft\n');
    writeFileSync(path.join(tempRoot, 'audit-reports', '999_COMPLETED_REPORT.md'), '# Step 999 Completed Report\n');

    const reports = listAuditReports(tempRoot);

    assert.deepEqual(
      reportNames(reports),
      ['998_OLDER_REPORT.md', '999_NEXT_PROMPT_DRAFT.md', '999_COMPLETED_REPORT.md'],
    );
    assert.equal(reports.at(-1)?.name, '999_COMPLETED_REPORT.md');
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('terminal-loop audit report listing ignores malformed files and directories', () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'boilabin-terminal-audit-'));

  try {
    const auditDir = path.join(tempRoot, 'audit-reports');
    mkdirSync(auditDir);
    mkdirSync(path.join(auditDir, '999_DIRECTORY.md'));
    writeFileSync(path.join(auditDir, 'README.md'), '# Notes\n');
    writeFileSync(path.join(auditDir, 'LATEST_REPORT.md'), '# Missing step prefix\n');
    writeFileSync(path.join(auditDir, '999_VALID_REPORT.md'), '# Step 999 Valid Report\n');

    const reports = listAuditReports(tempRoot);

    assert.deepEqual(
      reportNames(reports),
      ['999_VALID_REPORT.md'],
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('terminal-loop audit report listing sorts numeric step prefixes numerically', () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'boilabin-terminal-audit-'));

  try {
    const auditDir = path.join(tempRoot, 'audit-reports');
    mkdirSync(auditDir);
    writeFileSync(path.join(auditDir, '10_TEN.md'), '# Step 10 Ten\n');
    writeFileSync(path.join(auditDir, '2_TWO.md'), '# Step 2 Two\n');
    writeFileSync(path.join(auditDir, '001_ONE.md'), '# Step 1 One\n');

    const reports = listAuditReports(tempRoot);

    assert.deepEqual(
      reportNames(reports),
      ['001_ONE.md', '2_TWO.md', '10_TEN.md'],
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('terminal-loop state can read the current git commit without relying on report text', () => {
  assert.match(readCurrentGitCommit(repoRoot) ?? '', /^[0-9a-f]{7,40}\s+.+/);
});

test('terminal-loop latest commit extraction supports fenced and inline report formats', () => {
  assert.equal(
    extractLatestCommit(['Latest commit before this step:', '', '```text', 'abc1234 fix thing', '```'].join('\n')),
    'abc1234 fix thing',
  );
  assert.equal(
    extractLatestCommit('Commit hash: `deadbee test thing`'),
    'deadbee test thing',
  );
});

test('terminal-loop latest commit extraction ignores invalid commit references', () => {
  assert.equal(extractLatestCommit('Latest commit before this step: not-a-commit'), null);
  assert.equal(extractLatestCommit('Commit hash: `abc123 too short`'), null);
  assert.equal(extractLatestCommit('Commit hash: `zzzzzzz not hex`'), null);
});

test('terminal-loop title extraction reads the first markdown H1 only', () => {
  assert.equal(extractTitle(['Intro', '', '# Step 999 Report Title', '', '## Scope'].join('\n')), 'Step 999 Report Title');
  assert.equal(extractTitle('## Scope\nNo top-level heading'), null);
});

test('terminal-loop safe file reader rejects all private env filename variants', () => {
  for (const relativePath of ['.env', '.env.local', '.env.production', '.ENV.PRODUCTION', 'config/.env.staging', 'config\\.env.staging']) {
    assert.throws(
      () => readSafeFile(repoRoot, relativePath),
      /Refusing to read private env file/,
      `${relativePath} should be refused before any file read`,
    );
  }
});

test('terminal-loop scanner flags unsafe broad staging recommendations', () => {
  const findings = findRecommendedBroadStaging([
    {
      relativePath: 'safe.md',
      content: 'Never use git add .\nDo not run git add -A',
    },
    {
      relativePath: 'unsafe.md',
      content: ['Run git', 'add . before commit'].join(' '),
    },
  ]);

  assert.deepEqual(findings, [{ file: 'unsafe.md', line: 1 }]);
});

test('terminal-loop scanner flags obvious secret-like strings', () => {
  const findings = findSuspiciousSecrets([
    {
      relativePath: 'example.md',
      content: ['AUTH_', 'SEC', 'RET="this-is-a-long-real-looking-secret"'].join(''),
    },
  ]);

  assert.equal(findings.length, 1);
});

test('terminal-loop files do not contain obvious secret-looking values', () => {
  const files = terminalLoopFiles.map((relativePath) => ({
    relativePath,
    content: readRepoFile(relativePath),
  }));

  assert.deepEqual(findSuspiciousSecrets(files), []);
});
