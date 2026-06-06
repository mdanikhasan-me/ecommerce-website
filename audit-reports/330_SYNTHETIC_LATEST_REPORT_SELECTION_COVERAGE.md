# Step 330 Synthetic Latest Report Selection Coverage

## Scope

Step 330 skips the still-blocked media decision and completes a narrow non-media workflow-helper test coverage task.

Latest commit before Step 330:

```text
8b2712e test: cover latest report selection
```

The remaining media files are still unapproved and were not touched.

## Problem

Step 329 added live-state coverage proving Advisor and Terminal Loop helpers do not report `NEXT_PROMPT_DRAFT` files as the latest completed audit report.

That test used the repository's current audit-report set. It protected the active behavior, but it did not construct a synthetic same-step report/draft pair to prove the tie-break rule directly.

## Fix

Added synthetic audit-report listing tests for both helper surfaces.

Each test creates a temporary `audit-reports` directory containing:

- an older completed report;
- a same-step `NEXT_PROMPT_DRAFT`;
- a same-step completed report.

The tests assert that the same-step prompt draft sorts before the completed report, so `.at(-1)` returns the completed report.

No runtime code changed.

## Tests

Updated:

- `tests/boilabin-advisor-workflow.test.ts`
- `tests/boilabin-terminal-loop-workflow.test.ts`

The new tests use temporary directories and remove them in `finally` blocks.

## Validation Results

Focused and standard helper validation passed:

- `git diff --check -- tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts audit-reports/330_SYNTHETIC_LATEST_REPORT_SELECTION_COVERAGE.md audit-reports/330_NEXT_PROMPT_DRAFT.md audit-reports/330-synthetic-latest-report-selection-coverage` passed.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts` passed: 35 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 562 tests, 83 suites, 0 failures.

Evidence:

- `audit-reports/330-synthetic-latest-report-selection-coverage/baseline-git-status.txt`
- `audit-reports/330-synthetic-latest-report-selection-coverage/source-diff.patch`
- `audit-reports/330-synthetic-latest-report-selection-coverage/validation-diff-check.txt`
- `audit-reports/330-synthetic-latest-report-selection-coverage/validation-workflow-tests.txt`
- `audit-reports/330-synthetic-latest-report-selection-coverage/validation-advisor-state.txt`
- `audit-reports/330-synthetic-latest-report-selection-coverage/validation-terminal-loop-state.txt`
- `audit-reports/330-synthetic-latest-report-selection-coverage/validation-typecheck.txt`
- `audit-reports/330-synthetic-latest-report-selection-coverage/validation-lint.txt`
- `audit-reports/330-synthetic-latest-report-selection-coverage/validation-npm-test.txt`
- `audit-reports/330-synthetic-latest-report-selection-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only focused workflow-helper tests and audit docs. The changed behavior is covered by both workflow-helper tests and the full test suite.

## Guardrail Confirmation

Step 330 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior

No seed, reset, db push, destructive SQL, migration, provider CLI, package update, media deletion, media restore, media move, media staging, or private env read was run.

## Files To Stage

Stage only:

- `tests/boilabin-advisor-workflow.test.ts`
- `tests/boilabin-terminal-loop-workflow.test.ts`
- `audit-reports/330_SYNTHETIC_LATEST_REPORT_SELECTION_COVERAGE.md`
- `audit-reports/330_NEXT_PROMPT_DRAFT.md`
- `audit-reports/330-synthetic-latest-report-selection-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- The latest-report selection tests now cover live-state behavior and synthetic same-step sorting, but they do not cover every possible malformed audit filename.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another explicitly non-media prelaunch closure task.
