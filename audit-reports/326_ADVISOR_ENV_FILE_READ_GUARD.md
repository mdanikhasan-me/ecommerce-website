# Step 326 Advisor Env File Read Guard

## Scope

Step 326 skips the still-blocked media decision and completes a narrow non-media Advisor workflow-helper guardrail fix.

Latest commit before Step 326:

```text
feb9eb1 fix: show terminal loop latest report title
```

The remaining media files are still unapproved and were not touched.

## Problem

`scripts/boilabin-advisor-state.mjs` uses `readSafeFile` to prevent accidental private env file reads.

Before this step, Advisor refused `.env` and `.env.local`, but it did not refuse other private env filename variants such as `.env.production` or nested `.env.staging` paths.

The Terminal Loop state helper already used the stricter all-variant private env filename pattern.

## Fix

Updated Advisor's private env filename guard to reject every `.env` and `.env.*` path variant, case-insensitively.

This keeps Advisor state reads aligned with the current "no private env reads" workflow boundary.

## Tests

Updated `tests/boilabin-advisor-workflow.test.ts` with a focused regression test that asserts `readSafeFile` refuses:

- `.env`
- `.env.local`
- `.env.production`
- `config/.env.staging`

The test checks the path is refused before any file read attempt.

## Validation Results

Focused and standard helper validation passed:

- `git diff --check -- scripts/boilabin-advisor-state.mjs tests/boilabin-advisor-workflow.test.ts audit-reports/326_ADVISOR_ENV_FILE_READ_GUARD.md audit-reports/326_NEXT_PROMPT_DRAFT.md audit-reports/326-advisor-env-file-read-guard` passed.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts` passed: 18 tests, 0 failures.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts` passed: 32 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 559 tests, 83 suites, 0 failures.

Evidence:

- `audit-reports/326-advisor-env-file-read-guard/baseline-git-status.txt`
- `audit-reports/326-advisor-env-file-read-guard/source-diff.patch`
- `audit-reports/326-advisor-env-file-read-guard/validation-diff-check.txt`
- `audit-reports/326-advisor-env-file-read-guard/validation-focused-advisor-tests.txt`
- `audit-reports/326-advisor-env-file-read-guard/validation-workflow-tests.txt`
- `audit-reports/326-advisor-env-file-read-guard/validation-advisor-state.txt`
- `audit-reports/326-advisor-env-file-read-guard/validation-terminal-loop-state.txt`
- `audit-reports/326-advisor-env-file-read-guard/validation-typecheck.txt`
- `audit-reports/326-advisor-env-file-read-guard/validation-lint.txt`
- `audit-reports/326-advisor-env-file-read-guard/validation-npm-test.txt`
- `audit-reports/326-advisor-env-file-read-guard/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only a workflow state helper, focused workflow tests, and audit docs. The changed behavior is covered by focused tests, both workflow-helper tests, and the full test suite.

## Guardrail Confirmation

Step 326 did not touch:

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

- `scripts/boilabin-advisor-state.mjs`
- `tests/boilabin-advisor-workflow.test.ts`
- `audit-reports/326_ADVISOR_ENV_FILE_READ_GUARD.md`
- `audit-reports/326_NEXT_PROMPT_DRAFT.md`
- `audit-reports/326-advisor-env-file-read-guard/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- The Advisor private env read guard is path-based; it is intended to prevent accidental private env file reads, not detect every possible secret-bearing filename in arbitrary directories.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another explicitly non-media prelaunch closure task.
