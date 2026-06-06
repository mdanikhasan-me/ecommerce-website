# Step 325 Terminal Loop Latest Title State

## Scope

Step 325 skips the still-blocked media decision and completes a narrow non-media Terminal Loop workflow-helper parity fix.

Latest commit before Step 325:

```text
7275cbc fix: align advisor staging warning scanner
```

The remaining media files are still unapproved and were not touched.

## Problem

`scripts/boilabin-advisor-state.mjs` prints both the latest audit report path and the latest audit title.

`scripts/boilabin-terminal-loop-state.mjs` printed the latest audit report path, latest commit mention, and current git commit, but it did not print the report title. During repeated `next` handoffs, that made Terminal Loop state slightly less scannable than Advisor state.

## Fix

Added latest audit title extraction to the Terminal Loop state helper.

The helper now:

- extracts the first Markdown H1 from the latest audit report;
- stores it as `latestReportTitle`;
- prints `Latest audit title: ...` in formatted Terminal Loop state output.

## Tests

Updated `tests/boilabin-terminal-loop-workflow.test.ts` so the ready-state regression test asserts:

- the parsed state includes a `Step <number> ...` latest report title;
- formatted output includes the latest audit title line.

## Validation Results

Focused and standard helper validation passed:

- `git diff --check -- scripts/boilabin-terminal-loop-state.mjs tests/boilabin-terminal-loop-workflow.test.ts audit-reports/325_TERMINAL_LOOP_LATEST_TITLE_STATE.md audit-reports/325_NEXT_PROMPT_DRAFT.md audit-reports/325-terminal-loop-latest-title-state` passed.
- `npx tsx --test tests/boilabin-terminal-loop-workflow.test.ts` passed: 14 tests, 0 failures.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts` passed: 31 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed and now prints `Latest audit title: Step 325 Terminal Loop Latest Title State`.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 558 tests, 83 suites, 0 failures.

Evidence:

- `audit-reports/325-terminal-loop-latest-title-state/baseline-git-status.txt`
- `audit-reports/325-terminal-loop-latest-title-state/source-diff.patch`
- `audit-reports/325-terminal-loop-latest-title-state/validation-diff-check.txt`
- `audit-reports/325-terminal-loop-latest-title-state/validation-focused-terminal-loop-tests.txt`
- `audit-reports/325-terminal-loop-latest-title-state/validation-workflow-tests.txt`
- `audit-reports/325-terminal-loop-latest-title-state/validation-advisor-state.txt`
- `audit-reports/325-terminal-loop-latest-title-state/validation-terminal-loop-state.txt`
- `audit-reports/325-terminal-loop-latest-title-state/validation-typecheck.txt`
- `audit-reports/325-terminal-loop-latest-title-state/validation-lint.txt`
- `audit-reports/325-terminal-loop-latest-title-state/validation-npm-test.txt`
- `audit-reports/325-terminal-loop-latest-title-state/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only a workflow state helper, focused workflow tests, and audit docs. The changed behavior is covered by focused tests, both workflow-helper tests, and the full test suite.

## Guardrail Confirmation

Step 325 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- Prisma schema/migrations
- DB rows
- env files
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior

No seed, reset, db push, destructive SQL, migration, provider CLI, package update, media deletion, media restore, media move, or media staging was run.

## Files To Stage

Stage only:

- `scripts/boilabin-terminal-loop-state.mjs`
- `tests/boilabin-terminal-loop-workflow.test.ts`
- `audit-reports/325_TERMINAL_LOOP_LATEST_TITLE_STATE.md`
- `audit-reports/325_NEXT_PROMPT_DRAFT.md`
- `audit-reports/325-terminal-loop-latest-title-state/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- Terminal Loop latest title extraction intentionally reads only the first Markdown H1 in the latest audit report.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another explicitly non-media prelaunch closure task.
