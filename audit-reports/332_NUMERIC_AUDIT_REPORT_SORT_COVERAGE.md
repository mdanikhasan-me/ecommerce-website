# Step 332 Numeric Audit Report Sort Coverage

## Scope

Step 332 skips the still-blocked media decision and completes a narrow non-media workflow-helper test coverage task.

Latest commit before Step 332:

```text
b2cb3c7 test: cover malformed audit report filtering
```

The remaining media files are still unapproved and were not touched.

## Problem

Advisor and Terminal Loop `listAuditReports` helpers parse numeric audit step prefixes and sort by numeric step value.

Previous synthetic tests covered same-step prompt/report ordering and malformed-file filtering, but they did not explicitly prove numeric ordering differs from lexicographic filename ordering.

Without that coverage, a future helper change could accidentally sort `10_...` before `2_...`.

## Fix

Added numeric sort tests for both helper surfaces.

Each test creates a temporary `audit-reports` directory containing:

- `10_TEN.md`
- `2_TWO.md`
- `001_ONE.md`

The tests assert the reports are returned as:

```text
001_ONE.md
2_TWO.md
10_TEN.md
```

No runtime code changed.

## Tests

Updated:

- `tests/boilabin-advisor-workflow.test.ts`
- `tests/boilabin-terminal-loop-workflow.test.ts`

The new tests use temporary directories and remove them in `finally` blocks.

## Validation Results

Focused and standard helper validation passed:

- `git diff --check -- tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts audit-reports/332_NUMERIC_AUDIT_REPORT_SORT_COVERAGE.md audit-reports/332_NEXT_PROMPT_DRAFT.md audit-reports/332-numeric-audit-report-sort-coverage` passed.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts` passed: 39 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 566 tests, 83 suites, 0 failures.

Evidence:

- `audit-reports/332-numeric-audit-report-sort-coverage/baseline-git-status.txt`
- `audit-reports/332-numeric-audit-report-sort-coverage/source-diff.patch`
- `audit-reports/332-numeric-audit-report-sort-coverage/validation-diff-check.txt`
- `audit-reports/332-numeric-audit-report-sort-coverage/validation-workflow-tests.txt`
- `audit-reports/332-numeric-audit-report-sort-coverage/validation-advisor-state.txt`
- `audit-reports/332-numeric-audit-report-sort-coverage/validation-terminal-loop-state.txt`
- `audit-reports/332-numeric-audit-report-sort-coverage/validation-typecheck.txt`
- `audit-reports/332-numeric-audit-report-sort-coverage/validation-lint.txt`
- `audit-reports/332-numeric-audit-report-sort-coverage/validation-npm-test.txt`
- `audit-reports/332-numeric-audit-report-sort-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only focused workflow-helper tests and audit docs. The changed behavior is covered by both workflow-helper tests and the full test suite.

## Guardrail Confirmation

Step 332 did not touch:

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
- `audit-reports/332_NUMERIC_AUDIT_REPORT_SORT_COVERAGE.md`
- `audit-reports/332_NEXT_PROMPT_DRAFT.md`
- `audit-reports/332-numeric-audit-report-sort-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- The audit report sorting tests now cover numeric ordering, same-step prompt/report ordering, and malformed-file filtering, but they do not cover every possible audit-report naming edge case.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another explicitly non-media prelaunch closure task.
