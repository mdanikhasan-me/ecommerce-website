# Step 329 Latest Report Selection Coverage

## Scope

Step 329 skips the still-blocked media decision and completes a narrow non-media workflow-helper test coverage task.

Latest commit before Step 329:

```text
77fa56c test: cover env read guard paths
```

The remaining media files are still unapproved and were not touched.

## Problem

Advisor and Terminal Loop state helpers scan numbered audit files and matching `NEXT_PROMPT_DRAFT` files.

The helpers intentionally report the latest completed audit report, not the matching next-prompt draft, but the ready-state tests did not assert that boundary explicitly.

That left a small coverage gap around a recurring handoff behavior: `audit-reports/<step>_NEXT_PROMPT_DRAFT.md` should guide the next step without becoming the "latest audit report" in helper state output.

## Fix

Expanded the Advisor and Terminal Loop ready-state tests to assert:

- parsed latest report paths do not contain `NEXT_PROMPT_DRAFT`;
- formatted helper output does not report a `NEXT_PROMPT_DRAFT` file as the latest audit report.

No runtime code changed.

## Tests

Updated:

- `tests/boilabin-advisor-workflow.test.ts`
- `tests/boilabin-terminal-loop-workflow.test.ts`

The existing ready-state tests now cover latest-report selection in both helper surfaces.

## Validation Results

Focused and standard helper validation passed:

- `git diff --check -- tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts audit-reports/329_LATEST_REPORT_SELECTION_COVERAGE.md audit-reports/329_NEXT_PROMPT_DRAFT.md audit-reports/329-latest-report-selection-coverage` passed.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts` passed: 33 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 560 tests, 83 suites, 0 failures.

Evidence:

- `audit-reports/329-latest-report-selection-coverage/baseline-git-status.txt`
- `audit-reports/329-latest-report-selection-coverage/source-diff.patch`
- `audit-reports/329-latest-report-selection-coverage/validation-diff-check.txt`
- `audit-reports/329-latest-report-selection-coverage/validation-workflow-tests.txt`
- `audit-reports/329-latest-report-selection-coverage/validation-advisor-state.txt`
- `audit-reports/329-latest-report-selection-coverage/validation-terminal-loop-state.txt`
- `audit-reports/329-latest-report-selection-coverage/validation-typecheck.txt`
- `audit-reports/329-latest-report-selection-coverage/validation-lint.txt`
- `audit-reports/329-latest-report-selection-coverage/validation-npm-test.txt`
- `audit-reports/329-latest-report-selection-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only focused workflow-helper tests and audit docs. The changed behavior is covered by both workflow-helper tests and the full test suite.

## Guardrail Confirmation

Step 329 did not touch:

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
- `audit-reports/329_LATEST_REPORT_SELECTION_COVERAGE.md`
- `audit-reports/329_NEXT_PROMPT_DRAFT.md`
- `audit-reports/329-latest-report-selection-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- The report-selection coverage uses the current repository audit-report set; it protects the active helper behavior but does not construct a synthetic audit-report directory.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another explicitly non-media prelaunch closure task.
