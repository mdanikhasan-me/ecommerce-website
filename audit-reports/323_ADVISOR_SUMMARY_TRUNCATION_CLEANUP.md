# Step 323 Advisor Summary Truncation Cleanup

## Scope

Step 323 skips the still-blocked media decision and completes a narrow non-media workflow-helper cleanup.

Latest commit before Step 323:

```text
3213098 fix: show current git commit in workflow state
```

The remaining media files are still unapproved and were not touched.

## Problem

`scripts/boilabin-advisor-state.mjs` summarized report sections by joining the first six non-empty lines and slicing the resulting string to 600 characters.

For long validation sections, this could cut output mid-line or mid-token. The Step 322 state output showed a dangling phrase:

```text
... passed and now prints both `Latest report commit
```

That made the helper output look messy even though the underlying state was healthy.

## Fix

Changed Advisor summary extraction to be line-aware:

- whole summary lines are included until the configured length limit is reached;
- if the next whole line would exceed the limit, the summary ends cleanly with `...`;
- a single overlong line is truncated at a word boundary and ends with `...`.

This keeps Advisor output readable without changing report parsing, state readiness, secret scanning, broad-staging scanning, or Terminal Loop behavior.

## Tests

Updated `tests/boilabin-advisor-workflow.test.ts` with coverage for:

- multi-line summaries stopping cleanly instead of cutting mid-line;
- single overlong lines truncating at word boundaries.

Focused Advisor tests passed:

```text
17 tests, 0 failures
```

## Validation Results

Focused and full validation passed:

- `git diff --check -- scripts/boilabin-advisor-state.mjs tests/boilabin-advisor-workflow.test.ts audit-reports/323_ADVISOR_SUMMARY_TRUNCATION_CLEANUP.md audit-reports/323_NEXT_PROMPT_DRAFT.md audit-reports/323-advisor-summary-truncation-cleanup` passed.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts` passed: 17 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed and now ends the long validation summary cleanly with `...`.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 558 tests, 83 suites, 0 failures.

`npm run build` was not rerun because this step changed only the Advisor workflow helper, its focused tests, and audit docs. The changed behavior is covered by focused tests and the full test suite.

Evidence:

- `audit-reports/323-advisor-summary-truncation-cleanup/baseline-git-status.txt`
- `audit-reports/323-advisor-summary-truncation-cleanup/validation-diff-check.txt`
- `audit-reports/323-advisor-summary-truncation-cleanup/validation-focused-advisor-tests.txt`
- `audit-reports/323-advisor-summary-truncation-cleanup/validation-advisor-state.txt`
- `audit-reports/323-advisor-summary-truncation-cleanup/validation-terminal-loop-state.txt`
- `audit-reports/323-advisor-summary-truncation-cleanup/validation-typecheck.txt`
- `audit-reports/323-advisor-summary-truncation-cleanup/validation-lint.txt`
- `audit-reports/323-advisor-summary-truncation-cleanup/validation-npm-test.txt`
- `audit-reports/323-advisor-summary-truncation-cleanup/pre-stage-git-status.txt`
- `audit-reports/323-advisor-summary-truncation-cleanup/source-diff.patch`

## Guardrail Confirmation

Step 323 did not touch:

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

- `scripts/boilabin-advisor-state.mjs`
- `tests/boilabin-advisor-workflow.test.ts`
- `audit-reports/323_ADVISOR_SUMMARY_TRUNCATION_CLEANUP.md`
- `audit-reports/323_NEXT_PROMPT_DRAFT.md`
- `audit-reports/323-advisor-summary-truncation-cleanup/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- Advisor summaries intentionally remain concise; they are not a replacement for opening the full report.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another explicitly non-media prelaunch closure task.
