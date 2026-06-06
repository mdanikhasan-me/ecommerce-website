# Step 327 Terminal Loop Env Read Guard Coverage

## Scope

Step 327 skips the still-blocked media decision and completes a narrow non-media Terminal Loop workflow-helper test coverage hardening task.

Latest commit before Step 327:

```text
1d10dca fix: guard advisor env file reads
```

The remaining media files are still unapproved and were not touched.

## Problem

Step 326 added focused regression coverage proving Advisor `readSafeFile` refuses all private env filename variants before attempting reads.

`scripts/boilabin-terminal-loop-state.mjs` already used the stricter `.env` / `.env.*` guard, but `tests/boilabin-terminal-loop-workflow.test.ts` did not have matching coverage for that behavior.

That left the Terminal Loop private env read boundary less explicitly protected by tests than the Advisor boundary.

## Fix

Added a Terminal Loop regression test that imports `readSafeFile` and asserts private env filename variants are refused before file reads.

No runtime code changed.

## Tests

Updated `tests/boilabin-terminal-loop-workflow.test.ts` with a focused regression test that asserts `readSafeFile` refuses:

- `.env`
- `.env.local`
- `.env.production`
- `config/.env.staging`

The test checks the path is refused before any file read attempt.

## Validation Results

Focused and standard helper validation passed:

- `git diff --check -- tests/boilabin-terminal-loop-workflow.test.ts audit-reports/327_TERMINAL_LOOP_ENV_READ_GUARD_COVERAGE.md audit-reports/327_NEXT_PROMPT_DRAFT.md audit-reports/327-terminal-loop-env-read-guard-coverage` passed.
- `npx tsx --test tests/boilabin-terminal-loop-workflow.test.ts` passed: 15 tests, 0 failures.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts` passed: 33 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 560 tests, 83 suites, 0 failures.

Evidence:

- `audit-reports/327-terminal-loop-env-read-guard-coverage/baseline-git-status.txt`
- `audit-reports/327-terminal-loop-env-read-guard-coverage/source-diff.patch`
- `audit-reports/327-terminal-loop-env-read-guard-coverage/validation-diff-check.txt`
- `audit-reports/327-terminal-loop-env-read-guard-coverage/validation-focused-terminal-loop-tests.txt`
- `audit-reports/327-terminal-loop-env-read-guard-coverage/validation-workflow-tests.txt`
- `audit-reports/327-terminal-loop-env-read-guard-coverage/validation-advisor-state.txt`
- `audit-reports/327-terminal-loop-env-read-guard-coverage/validation-terminal-loop-state.txt`
- `audit-reports/327-terminal-loop-env-read-guard-coverage/validation-typecheck.txt`
- `audit-reports/327-terminal-loop-env-read-guard-coverage/validation-lint.txt`
- `audit-reports/327-terminal-loop-env-read-guard-coverage/validation-npm-test.txt`
- `audit-reports/327-terminal-loop-env-read-guard-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only focused workflow-helper tests and audit docs. The changed behavior is covered by the focused Terminal Loop test, both workflow-helper tests, and the full test suite.

## Guardrail Confirmation

Step 327 did not touch:

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

- `tests/boilabin-terminal-loop-workflow.test.ts`
- `audit-reports/327_TERMINAL_LOOP_ENV_READ_GUARD_COVERAGE.md`
- `audit-reports/327_NEXT_PROMPT_DRAFT.md`
- `audit-reports/327-terminal-loop-env-read-guard-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- The Terminal Loop private env read guard is path-based; it is intended to prevent accidental private env file reads, not detect every possible secret-bearing filename in arbitrary directories.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another explicitly non-media prelaunch closure task.
