import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import {
  TERMINAL_LOOP_ACTIVATION_PHRASE,
  createTerminalLoopState,
  findRecommendedBroadStaging,
  findSuspiciousSecrets,
  formatTerminalLoopState,
} from '../scripts/boilabin-terminal-loop-state.mjs';

const repoRoot = process.cwd();

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const terminalLoopFiles = [
  '.agents/skills/boilabin-advisor/SKILL.md',
  '.agents/skills/boilabin-step-workflow/SKILL.md',
  'docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md',
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
  assert.equal(state.secretFindings.length, 0);
  assert.equal(state.broadStagingFindings.length, 0);
  assert.match(formatted, /Boilabin Terminal Loop state/);
  assert.match(formatted, /Terminal Loop is ready: yes/);
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
