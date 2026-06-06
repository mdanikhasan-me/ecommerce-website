# Step 328 Env Read Guard Path Coverage

## Scope

Step 328 skips the still-blocked media decision and completes a narrow non-media workflow-helper test coverage task.

Latest commit before Step 328:

```text
20abb56 test: cover terminal loop env read guard
```

The remaining media files are still unapproved and were not touched.

## Problem

Steps 326 and 327 added focused tests proving Advisor and Terminal Loop `readSafeFile` refuse `.env` and `.env.*` filename variants before attempting reads.

Those tests covered normal relative paths and forward-slash nested paths, but they did not explicitly cover:

- uppercase env filenames, even though the guard is case-insensitive;
- Windows-style backslash path separators, even though the helper normalizes them.

Because this project is commonly coordinated from Windows paths, that left a small but real guardrail coverage gap.

## Fix

Expanded the Advisor and Terminal Loop private env read tests to include:

- `.ENV.PRODUCTION`
- `config\\.env.staging`

No runtime code changed.

## Tests

Updated:

- `tests/boilabin-advisor-workflow.test.ts`
- `tests/boilabin-terminal-loop-workflow.test.ts`

The existing private env read guard tests now prove both helpers refuse lowercase, uppercase, forward-slash nested, and Windows-backslash nested private env paths before reading.

## Validation Results

Focused and standard helper validation passed:

- `git diff --check -- tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts audit-reports/328_ENV_READ_GUARD_PATH_COVERAGE.md audit-reports/328_NEXT_PROMPT_DRAFT.md audit-reports/328-env-read-guard-path-coverage` passed.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts` passed: 33 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 560 tests, 83 suites, 0 failures.

Evidence:

- `audit-reports/328-env-read-guard-path-coverage/baseline-git-status.txt`
- `audit-reports/328-env-read-guard-path-coverage/source-diff.patch`
- `audit-reports/328-env-read-guard-path-coverage/validation-diff-check.txt`
- `audit-reports/328-env-read-guard-path-coverage/validation-workflow-tests.txt`
- `audit-reports/328-env-read-guard-path-coverage/validation-advisor-state.txt`
- `audit-reports/328-env-read-guard-path-coverage/validation-terminal-loop-state.txt`
- `audit-reports/328-env-read-guard-path-coverage/validation-typecheck.txt`
- `audit-reports/328-env-read-guard-path-coverage/validation-lint.txt`
- `audit-reports/328-env-read-guard-path-coverage/validation-npm-test.txt`
- `audit-reports/328-env-read-guard-path-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only focused workflow-helper tests and audit docs. The changed behavior is covered by both workflow-helper tests and the full test suite.

## Guardrail Confirmation

Step 328 did not touch:

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
- `audit-reports/328_ENV_READ_GUARD_PATH_COVERAGE.md`
- `audit-reports/328_NEXT_PROMPT_DRAFT.md`
- `audit-reports/328-env-read-guard-path-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- The private env read guard remains path-based; it is intended to prevent accidental private env file reads, not detect every possible secret-bearing filename in arbitrary directories.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another explicitly non-media prelaunch closure task.
