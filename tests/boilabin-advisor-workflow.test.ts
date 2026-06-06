import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import {
  ADVISOR_ACTIVATION_PHRASE,
  createBoilabinAdvisorState,
  extractLatestCommit,
  extractSectionSummary,
  findRecommendedBroadStaging,
  findSuspiciousSecrets,
  formatBoilabinAdvisorState,
  listAuditReports,
  readSafeFile,
  readCurrentGitCommit,
} from '../scripts/boilabin-advisor-state.mjs';

const repoRoot = process.cwd();

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const advisorFiles = [
  '.codex/agents/boilabin-advisor.toml',
  '.agents/skills/boilabin-advisor/SKILL.md',
  'docs/development/BOILABIN_ADVISOR_WORKFLOW.md',
  'docs/development/BOILABIN_ADVISOR_QUICKSTART.md',
  'scripts/boilabin-advisor-state.mjs',
  'tests/boilabin-advisor-workflow.test.ts',
  'audit-reports/123_BOILABIN_ADVISOR_NEXT_STEP_WORKFLOW.md',
  'audit-reports/124_ADVISOR_DRY_RUN_AND_INVOCATION_REVIEW.md',
  'audit-reports/124_NEXT_PROMPT_DRAFT.md',
];

test('Step 123 Advisor files exist', () => {
  for (const relativePath of advisorFiles) {
    assert.equal(existsSync(path.join(repoRoot, relativePath)), true, `${relativePath} should exist`);
  }
});

test('Advisor skill frontmatter uses only name and description', () => {
  const skill = readRepoFile('.agents/skills/boilabin-advisor/SKILL.md');
  const match = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(match, 'skill should have YAML frontmatter');

  const keys = match[1]
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(':')[0].trim());

  assert.deepEqual(keys, ['name', 'description']);
  assert.match(match[1], /name:\s+boilabin-advisor/);
  assert.match(match[1], /description:.*Codex outputs.*audit reports/i);
});

test('Advisor skill includes required workflow sections', () => {
  const skill = readRepoFile('.agents/skills/boilabin-advisor/SKILL.md');

  for (const heading of [
    'Purpose',
    'When To Use',
    'Required Review Sequence',
    'Next Prompt Generation Rules',
    'Bigger Task Rules',
    'Multi-Agent Coordination Rules',
    'Risk And Stop Condition Rules',
    'Project Decisions To Preserve',
    'Exact Staging Rules',
    'Reusable Next-Prompt Skeleton',
  ]) {
    assert.match(skill, new RegExp(`## ${heading}`), `missing ${heading}`);
  }
});

test('Advisor skill preserves major Boilabin decisions', () => {
  const skill = readRepoFile('.agents/skills/boilabin-advisor/SKILL.md');

  assert.match(skill, /pre-launch\/local-development/i);
  assert.match(skill, /https:\/\/boilabin\.com/i);
  assert.match(skill, /Flash Deals and Flash Sales were removed/i);
  assert.match(skill, /\/deals/i);
  assert.match(skill, /\/api\/admin\/flash-sales/i);
  assert.match(skill, /baby-kids\.jpg/i);
  assert.match(skill, /Toys\s+&\s+Collectibles/i);
  assert.match(skill, /Footer, newsletter, payment-logo, and PromoSection visual work is paused/i);
  assert.match(skill, /Payment, tracking, seller marketplace/i);
  assert.match(skill, /mobile app implementation remain separate/i);
});

test('Advisor workflow doc describes human approval and realistic automation limits', () => {
  const doc = readRepoFile('docs/development/BOILABIN_ADVISOR_WORKFLOW.md');

  assert.match(doc, /previous ChatGPT review loop/i);
  assert.match(doc, /must not blindly run future risky work/i);
  assert.match(doc, /Human approval is required/i);
  assert.match(doc, /not guaranteed/i);
  assert.match(doc, /one VS Code Codex chat/i);
  assert.match(doc, /prompt trigger/i);
  assert.match(doc, /does not create a forever-running background process/i);
});

test('Advisor quickstart documents activation and approval boundaries', () => {
  const skill = readRepoFile('.agents/skills/boilabin-advisor/SKILL.md');
  const doc = readRepoFile('docs/development/BOILABIN_ADVISOR_WORKFLOW.md');
  const quickstart = readRepoFile('docs/development/BOILABIN_ADVISOR_QUICKSTART.md');

  for (const content of [skill, doc, quickstart]) {
    assert.match(content, new RegExp(ADVISOR_ACTIVATION_PHRASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(content, /not (?:a )?forever-running|does not run forever|cannot keep running/i);
    assert.match(content, /approval/i);
    assert.match(content, /Do not execute the next prompt until I approve it/i);
  }
});

test('Advisor quickstart includes required user-facing sections', () => {
  const quickstart = readRepoFile('docs/development/BOILABIN_ADVISOR_QUICKSTART.md');

  for (const heading of [
    'Purpose',
    'What To Type',
    'Best Short Prompt',
    'What The Advisor Will Do',
    'What It Cannot Do Automatically',
    'Human Approval Rules',
    'Example: After A Codex Task Finishes',
    'Example: Generate Only The Next Prompt',
    'Example: Bigger Safe Task',
    'Troubleshooting',
    'Recommended Default Prompt',
  ]) {
    assert.match(quickstart, new RegExp(`## ${heading}`), `missing ${heading}`);
  }
});

test('Advisor state script avoids removed promotion literals that existing script scans reject', () => {
  const script = readRepoFile('scripts/boilabin-advisor-state.mjs');
  assert.doesNotMatch(script, /flash[\s_-]*(sale|deal)s?|FlashSale|FlashDeal|\/deals/i);
});

test('Advisor state script reports ready state without reading env files', () => {
  const state = createBoilabinAdvisorState({ cwd: repoRoot });
  const formatted = formatBoilabinAdvisorState(state);

  assert.equal(state.ok, true);
  assert.equal(state.missingFiles.length, 0);
  assert.equal(state.secretFindings.length, 0);
  assert.equal(state.broadStagingFindings.length, 0);
  assert.doesNotMatch(state.latestReport?.relativePath ?? '', /NEXT_PROMPT_DRAFT/i);
  assert.match(state.currentGitCommit ?? '', /^[0-9a-f]{7,40}\s+.+/);
  assert.match(formatted, /Boilabin Advisor state/);
  assert.match(formatted, /Advisor activation phrase: Run Boilabin Advisor mode\./);
  assert.doesNotMatch(formatted, /Latest audit report: .*NEXT_PROMPT_DRAFT/i);
  assert.match(formatted, /Current git commit: [0-9a-f]{7,40}\s+.+/);
  assert.match(formatted, /Latest recommended next-step found: yes/);
  assert.match(formatted, /Advisor is ready: yes/);
  assert.match(formatted, /Overall status: ok/);
});

test('Advisor audit report listing keeps same-step prompt drafts before completed reports', () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'boilabin-advisor-audit-'));

  try {
    mkdirSync(path.join(tempRoot, 'audit-reports'));
    writeFileSync(path.join(tempRoot, 'audit-reports', '998_OLDER_REPORT.md'), '# Step 998 Older\n');
    writeFileSync(path.join(tempRoot, 'audit-reports', '999_NEXT_PROMPT_DRAFT.md'), '# Step 1000 Next Prompt Draft\n');
    writeFileSync(path.join(tempRoot, 'audit-reports', '999_COMPLETED_REPORT.md'), '# Step 999 Completed Report\n');

    const reports = listAuditReports(tempRoot);

    assert.deepEqual(
      reports.map((report) => report.name),
      ['998_OLDER_REPORT.md', '999_NEXT_PROMPT_DRAFT.md', '999_COMPLETED_REPORT.md'],
    );
    assert.equal(reports.at(-1)?.name, '999_COMPLETED_REPORT.md');
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('Advisor audit report listing ignores malformed files and directories', () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'boilabin-advisor-audit-'));

  try {
    const auditDir = path.join(tempRoot, 'audit-reports');
    mkdirSync(auditDir);
    mkdirSync(path.join(auditDir, '999_DIRECTORY.md'));
    writeFileSync(path.join(auditDir, 'README.md'), '# Notes\n');
    writeFileSync(path.join(auditDir, 'LATEST_REPORT.md'), '# Missing step prefix\n');
    writeFileSync(path.join(auditDir, '999_VALID_REPORT.md'), '# Step 999 Valid Report\n');

    const reports = listAuditReports(tempRoot);

    assert.deepEqual(
      reports.map((report) => report.name),
      ['999_VALID_REPORT.md'],
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('Advisor audit report listing sorts numeric step prefixes numerically', () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'boilabin-advisor-audit-'));

  try {
    const auditDir = path.join(tempRoot, 'audit-reports');
    mkdirSync(auditDir);
    writeFileSync(path.join(auditDir, '10_TEN.md'), '# Step 10 Ten\n');
    writeFileSync(path.join(auditDir, '2_TWO.md'), '# Step 2 Two\n');
    writeFileSync(path.join(auditDir, '001_ONE.md'), '# Step 1 One\n');

    const reports = listAuditReports(tempRoot);

    assert.deepEqual(
      reports.map((report) => report.name),
      ['001_ONE.md', '2_TWO.md', '10_TEN.md'],
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('Advisor safe file reader rejects all private env filename variants', () => {
  for (const relativePath of ['.env', '.env.local', '.env.production', '.ENV.PRODUCTION', 'config/.env.staging', 'config\\.env.staging']) {
    assert.throws(
      () => readSafeFile(repoRoot, relativePath),
      /Refusing to read private env file/,
      `${relativePath} should be refused before any file read`,
    );
  }
});

test('Advisor state can read the current git commit without relying on report text', () => {
  assert.match(readCurrentGitCommit(repoRoot) ?? '', /^[0-9a-f]{7,40}\s+.+/);
});

test('Advisor latest commit extraction supports fenced and inline report formats', () => {
  assert.equal(
    extractLatestCommit(['Latest commit before this step:', '', '```text', 'abc1234 fix thing', '```'].join('\n')),
    'abc1234 fix thing',
  );
  assert.equal(
    extractLatestCommit('Commit hash: `deadbee test thing`'),
    'deadbee test thing',
  );
});

test('Advisor latest commit extraction ignores invalid commit references', () => {
  assert.equal(extractLatestCommit('Latest commit before this step: not-a-commit'), null);
  assert.equal(extractLatestCommit('Commit hash: `abc123 too short`'), null);
  assert.equal(extractLatestCommit('Commit hash: `zzzzzzz not hex`'), null);
});

test('Advisor section summaries stop cleanly instead of cutting mid-line', () => {
  const oversizedBullet = `- ${'validated-helper-output '.repeat(40)}`;
  const content = [
    '# Example',
    '',
    '## Validation Results',
    '',
    'Focused validation passed.',
    oversizedBullet,
    '- This line should not be reached.',
    '',
    '## Recommended Next Step',
    '',
    'Continue safely.',
  ].join('\n');

  assert.equal(
    extractSectionSummary(content, 'Validation Results'),
    'Focused validation passed. ...',
  );
});

test('Advisor section summaries truncate single overlong lines at word boundaries', () => {
  const content = [
    '# Example',
    '',
    '## Recommended Next Step',
    '',
    'Continue with ' + 'bounded-workflow '.repeat(80),
  ].join('\n');
  const summary = extractSectionSummary(content, 'Recommended Next Step');

  assert.ok(summary.length <= 603);
  assert.match(summary, /\.\.\.$/);
  assert.doesNotMatch(summary, /bounded-wo\.\.\.$/);
});

test('Advisor section summaries signal omitted lines after the line cap', () => {
  const content = [
    '# Example',
    '',
    '## Validation Results',
    '',
    'Line one.',
    'Line two.',
    'Line three.',
    'Line four.',
    'Line five.',
    'Line six.',
    'Line seven.',
  ].join('\n');

  assert.equal(
    extractSectionSummary(content, 'Validation Results'),
    'Line one. Line two. Line three. Line four. Line five. Line six. ...',
  );
});

test('Advisor secret scanner flags obvious risky values in Advisor docs only', () => {
  const findings = findSuspiciousSecrets([
    {
      relativePath: 'example.md',
      content: ['AUTH_', 'SEC', 'RET="this-is-a-long-real-looking-secret"'].join(''),
    },
  ]);

  assert.equal(findings.length, 1);
  assert.equal(findings[0].file, 'example.md');
});

test('Advisor broad staging scanner ignores warnings but flags recommendations', () => {
  const findings = findRecommendedBroadStaging([
    {
      relativePath: 'safe.md',
      content: 'Never use git add .\nDo not run git add -A\nProhibit git add . in prompts\nBroad staging is prohibited: git add -A',
    },
    {
      relativePath: 'unsafe.md',
      content: ['Run git', 'add . before commit'].join(' '),
    },
  ]);

  assert.deepEqual(findings, [{ file: 'unsafe.md', line: 1 }]);
});

test('Advisor files do not contain obvious secret-looking values', () => {
  const files = advisorFiles.map((relativePath) => ({
    relativePath,
    content: readRepoFile(relativePath),
  }));

  assert.deepEqual(findSuspiciousSecrets(files), []);
});

test('Step 124 next prompt draft exists and is a single guarded prompt', () => {
  const draft = readRepoFile('audit-reports/124_NEXT_PROMPT_DRAFT.md');

  assert.match(draft, /^# Step 124 Next Prompt Draft/m);
  assert.match(draft, /\/plan/);
  assert.match(draft, /Step 125/i);
  assert.match(draft, /Do not execute/i);
  assert.match(draft, /Do not run migrations/i);
  assert.match(draft, /Do not deploy/i);
});
