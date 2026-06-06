# Step 331 Malformed Audit Report Filter Coverage

## Scope

Step 331 skips the still-blocked media decision and completes a narrow non-media workflow-helper test coverage task.

Latest commit before Step 331:

```text
7c62f25 test: cover synthetic latest report sorting
```

The remaining media files are still unapproved and were not touched.

## Problem

Step 330 added synthetic latest-report sorting coverage and noted that malformed audit filenames were still outside the tests.

Advisor and Terminal Loop `listAuditReports` helpers are expected to ignore non-report files and directories inside `audit-reports`, but the synthetic tests did not prove that behavior.

## Fix

Added malformed audit-report filter tests for both helper surfaces.

Each test creates a temporary `audit-reports` directory containing:

- a directory with an `.md`-looking name;
- a regular `README.md`;
- an `.md` file without a numeric step prefix;
- one valid numbered report.

The tests assert only the valid numbered report is returned.

No runtime code changed.

## Tests

Updated:

- `tests/boilabin-advisor-workflow.test.ts`
- `tests/boilabin-terminal-loop-workflow.test.ts`

The new tests use temporary directories and remove them in `finally` blocks.

## Validation Results

Focused and standard helper validation passed:

- `git diff --check -- tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts audit-reports/331_MALFORMED_AUDIT_REPORT_FILTER_COVERAGE.md audit-reports/331_NEXT_PROMPT_DRAFT.md audit-reports/331-malformed-audit-report-filter-coverage` passed.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts` passed: 37 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 564 tests, 83 suites, 0 failures.

Evidence:

- `audit-reports/331-malformed-audit-report-filter-coverage/baseline-git-status.txt`
- `audit-reports/331-malformed-audit-report-filter-coverage/source-diff.patch`
- `audit-reports/331-malformed-audit-report-filter-coverage/validation-diff-check.txt`
- `audit-reports/331-malformed-audit-report-filter-coverage/validation-workflow-tests.txt`
- `audit-reports/331-malformed-audit-report-filter-coverage/validation-advisor-state.txt`
- `audit-reports/331-malformed-audit-report-filter-coverage/validation-terminal-loop-state.txt`
- `audit-reports/331-malformed-audit-report-filter-coverage/validation-typecheck.txt`
- `audit-reports/331-malformed-audit-report-filter-coverage/validation-lint.txt`
- `audit-reports/331-malformed-audit-report-filter-coverage/validation-npm-test.txt`
- `audit-reports/331-malformed-audit-report-filter-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only focused workflow-helper tests and audit docs. The changed behavior is covered by both workflow-helper tests and the full test suite.

## Guardrail Confirmation

Step 331 did not touch:

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
- `audit-reports/331_MALFORMED_AUDIT_REPORT_FILTER_COVERAGE.md`
- `audit-reports/331_NEXT_PROMPT_DRAFT.md`
- `audit-reports/331-malformed-audit-report-filter-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- The latest-report selection tests now cover live-state behavior, synthetic same-step sorting, and malformed-file filtering, but they do not cover every possible audit-report naming edge case.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another explicitly non-media prelaunch closure task.
