# Step 334 Invalid Commit Reference Coverage

## Scope

Step 334 skips the still-blocked media decision and completes a narrow non-media workflow-helper test coverage task.

Latest commit before Step 334:

```text
0b2cc69 test: cover latest commit extraction
```

The remaining media files are still unapproved and were not touched.

## Problem

Step 333 added synthetic latest-commit extraction tests for common valid audit-report formats.

Those tests proved fenced latest-commit blocks and inline commit-hash references are parsed, but they did not prove invalid prose is ignored.

Without negative coverage, a future parser change could accidentally treat non-commit text, short hashes, or non-hex strings as valid latest commit references.

## Fix

Added invalid latest-commit reference tests for both helper surfaces.

The tests assert `extractLatestCommit` returns `null` for:

- prose with no commit hash;
- a short six-character pseudo-hash;
- a seven-character non-hex pseudo-hash.

No runtime code changed.

## Tests

Updated:

- `tests/boilabin-advisor-workflow.test.ts`
- `tests/boilabin-terminal-loop-workflow.test.ts`

The new tests import each helper's `extractLatestCommit` function and verify invalid references are not treated as commits.

## Validation Results

Focused and standard helper validation passed:

- `git diff --check -- tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts audit-reports/334_INVALID_COMMIT_REFERENCE_COVERAGE.md audit-reports/334_NEXT_PROMPT_DRAFT.md audit-reports/334-invalid-commit-reference-coverage` passed.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts` passed: 43 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 570 tests, 83 suites, 0 failures.

Evidence:

- `audit-reports/334-invalid-commit-reference-coverage/baseline-git-status.txt`
- `audit-reports/334-invalid-commit-reference-coverage/source-diff.patch`
- `audit-reports/334-invalid-commit-reference-coverage/validation-diff-check.txt`
- `audit-reports/334-invalid-commit-reference-coverage/validation-workflow-tests.txt`
- `audit-reports/334-invalid-commit-reference-coverage/validation-advisor-state.txt`
- `audit-reports/334-invalid-commit-reference-coverage/validation-terminal-loop-state.txt`
- `audit-reports/334-invalid-commit-reference-coverage/validation-typecheck.txt`
- `audit-reports/334-invalid-commit-reference-coverage/validation-lint.txt`
- `audit-reports/334-invalid-commit-reference-coverage/validation-npm-test.txt`
- `audit-reports/334-invalid-commit-reference-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only focused workflow-helper tests and audit docs. The changed behavior is covered by both workflow-helper tests and the full test suite.

## Guardrail Confirmation

Step 334 did not touch:

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
- `audit-reports/334_INVALID_COMMIT_REFERENCE_COVERAGE.md`
- `audit-reports/334_NEXT_PROMPT_DRAFT.md`
- `audit-reports/334-invalid-commit-reference-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- Commit-reference parsing coverage now covers common valid formats and invalid pseudo-references, but it does not attempt to parse every possible prose variation.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another explicitly non-media prelaunch closure task.
