# Step 335 Title Extraction Coverage

## Scope

Step 335 skips the still-blocked media decision and completes a narrow non-media workflow-helper test coverage task.

Latest commit before Step 335:

```text
9e874e6 test: cover invalid commit references
```

The remaining media files are still unapproved and were not touched.

## Problem

Advisor and Terminal Loop helpers extract the latest audit report title from the first Markdown H1.

Live state tests prove current report titles are surfaced, but there was no direct synthetic coverage for the shared title-extraction behavior:

- reading the first Markdown H1 even when text appears before it;
- returning `null` when no top-level heading exists.

Without direct coverage, a future helper change could break title extraction while the current live report still happened to pass.

## Fix

Added synthetic title-extraction tests for both helper surfaces.

The tests assert:

- `# Step 999 Report Title` is extracted from report-like content;
- content with only `##` headings returns `null`.

No runtime code changed.

## Tests

Updated:

- `tests/boilabin-advisor-workflow.test.ts`
- `tests/boilabin-terminal-loop-workflow.test.ts`

The new tests import each helper's `extractTitle` function and verify the expected title and missing-title behavior.

## Validation Results

Focused and standard helper validation passed:

- `git diff --check -- tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts audit-reports/335_TITLE_EXTRACTION_COVERAGE.md audit-reports/335_NEXT_PROMPT_DRAFT.md audit-reports/335-title-extraction-coverage` passed.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts` passed: 45 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 572 tests, 83 suites, 0 failures.

Evidence:

- `audit-reports/335-title-extraction-coverage/baseline-git-status.txt`
- `audit-reports/335-title-extraction-coverage/source-diff.patch`
- `audit-reports/335-title-extraction-coverage/validation-diff-check.txt`
- `audit-reports/335-title-extraction-coverage/validation-workflow-tests.txt`
- `audit-reports/335-title-extraction-coverage/validation-advisor-state.txt`
- `audit-reports/335-title-extraction-coverage/validation-terminal-loop-state.txt`
- `audit-reports/335-title-extraction-coverage/validation-typecheck.txt`
- `audit-reports/335-title-extraction-coverage/validation-lint.txt`
- `audit-reports/335-title-extraction-coverage/validation-npm-test.txt`
- `audit-reports/335-title-extraction-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only focused workflow-helper tests and audit docs. The changed behavior is covered by both workflow-helper tests and the full test suite.

## Guardrail Confirmation

Step 335 did not touch:

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
- `audit-reports/335_TITLE_EXTRACTION_COVERAGE.md`
- `audit-reports/335_NEXT_PROMPT_DRAFT.md`
- `audit-reports/335-title-extraction-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- Title extraction coverage now covers normal and missing-H1 behavior, but it does not attempt to validate every possible malformed Markdown heading.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another explicitly non-media prelaunch closure task.
