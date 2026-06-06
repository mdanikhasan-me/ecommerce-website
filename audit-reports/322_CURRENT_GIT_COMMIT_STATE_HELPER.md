# Step 322 Current Git Commit State Helper

## Scope

Step 322 skips the blocked media decision and completes a narrow non-media helper improvement.

The repeated user request was:

```text
next
```

Because Step 321 requires explicit media approval, this step did not touch, stage, restore, delete, move, rename, or rewrite any media files. Instead, it fixes a small workflow-reporting ambiguity in the Boilabin Advisor and Terminal Loop state helpers.

Latest commit before Step 322:

```text
39fc364 docs: record pending media approval decision
```

## Problem

The state helpers parsed commit references from the latest audit report, but report-only steps often mention the commit that existed before the step. After committing a report-only step, helper output could look stale because it showed only the report-embedded commit reference.

Example before this fix:

```text
Latest report commit reference: c28c735 docs: document remaining media approval gate
```

while the actual current repository commit was:

```text
39fc364 docs: record pending media approval decision
```

The parsed report reference is still useful, but it should not be the only commit signal.

## Fix

Added a separate current `git log -1 --oneline` read to both helper scripts:

- `scripts/boilabin-advisor-state.mjs`
- `scripts/boilabin-terminal-loop-state.mjs`

The helpers now show both:

- the latest report commit reference parsed from the audit report, and
- the current repository `HEAD` commit from Git.

This preserves the previous audit-report parsing behavior while making post-commit state output clearer.

## Tests

Updated focused workflow tests:

- `tests/boilabin-advisor-workflow.test.ts`
- `tests/boilabin-terminal-loop-workflow.test.ts`

Coverage added:

- Advisor state includes `currentGitCommit`.
- Advisor formatted output includes `Current git commit: ...`.
- Terminal Loop state includes `currentGitCommit`.
- Terminal Loop formatted output includes `Current git commit: ...`.
- Both helpers can read the current Git commit without relying on report text.

## Validation Results

Focused and full validation passed:

- `git diff --check -- scripts/boilabin-advisor-state.mjs scripts/boilabin-terminal-loop-state.mjs tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts audit-reports/322_CURRENT_GIT_COMMIT_STATE_HELPER.md audit-reports/322_NEXT_PROMPT_DRAFT.md audit-reports/322-current-git-commit-state-helper` passed.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts` passed: 28 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed and now prints both `Latest report commit reference` and `Current git commit`.
- `node scripts/boilabin-terminal-loop-state.mjs` passed and now prints both `Latest commit mention` and `Current git commit`.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 555 tests, 83 suites, 0 failures.

`npm run build` was not rerun because this step changed only workflow helper scripts/tests plus audit docs; the changed code is covered by the focused tests and full test suite.

Evidence:

- `audit-reports/322-current-git-commit-state-helper/baseline-git-status.txt`
- `audit-reports/322-current-git-commit-state-helper/validation-diff-check.txt`
- `audit-reports/322-current-git-commit-state-helper/validation-focused-tests.txt`
- `audit-reports/322-current-git-commit-state-helper/validation-advisor-state.txt`
- `audit-reports/322-current-git-commit-state-helper/validation-terminal-loop-state.txt`
- `audit-reports/322-current-git-commit-state-helper/validation-typecheck.txt`
- `audit-reports/322-current-git-commit-state-helper/validation-lint.txt`
- `audit-reports/322-current-git-commit-state-helper/validation-npm-test.txt`
- `audit-reports/322-current-git-commit-state-helper/pre-stage-git-status.txt`
- `audit-reports/322-current-git-commit-state-helper/source-diff.patch`

## Guardrail Confirmation

Step 322 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- source/catalog/banner/product media files
- Prisma schema/migrations
- DB rows
- env files
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior

No seed, reset, db push, destructive SQL, migration, provider CLI, package update, media deletion, media restore, media move, or media staging was run.

## Files To Stage

Stage only:

- `scripts/boilabin-advisor-state.mjs`
- `scripts/boilabin-terminal-loop-state.mjs`
- `tests/boilabin-advisor-workflow.test.ts`
- `tests/boilabin-terminal-loop-workflow.test.ts`
- `audit-reports/322_CURRENT_GIT_COMMIT_STATE_HELPER.md`
- `audit-reports/322_NEXT_PROMPT_DRAFT.md`
- `audit-reports/322-current-git-commit-state-helper/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The media approval decision remains blocked because the user has not explicitly approved keep, restore, remove, or promote.
- Current Git commit reporting requires the repository to be available to `git`; helpers fall back to `not detected` if Git is unavailable.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another explicitly non-media prelaunch closure task.
