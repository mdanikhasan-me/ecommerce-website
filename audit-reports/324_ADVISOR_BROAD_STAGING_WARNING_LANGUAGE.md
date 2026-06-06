# Step 324 Advisor Broad Staging Warning Language

## Scope

Step 324 skips the still-blocked media decision and completes a narrow non-media Advisor workflow-helper consistency fix.

Latest commit before Step 324:

```text
5a83820 fix: clean up advisor summary truncation
```

The remaining media files are still unapproved and were not touched.

## Problem

`scripts/boilabin-advisor-state.mjs` scans Advisor docs/config for broad staging recommendations. Unsafe examples, which this workflow continues to prohibit, include `git add .` and `git add -A`.

It correctly ignored warning language containing `do not`, `never`, and `forbid`. The Terminal Loop scanner also ignored `prohibit` wording, but the Advisor scanner did not.

That meant policy text like this could be misclassified as a broad-staging recommendation:

```text
Broad staging is prohibited: git add -A
```

## Fix

Updated the Advisor broad-staging scanner to treat `prohibit` / `prohibited` language as warning text rather than a recommendation.

This aligns Advisor behavior with the Terminal Loop scanner and avoids false positives in guardrail documentation.

## Tests

Updated `tests/boilabin-advisor-workflow.test.ts` so the broad-staging scanner regression case includes:

- `Prohibit git add . in prompts`
- `Broad staging is prohibited: git add -A`

Focused Advisor tests passed:

```text
17 tests, 0 failures
```

## Validation Results

Focused and full validation passed:

- `git diff --check -- scripts/boilabin-advisor-state.mjs tests/boilabin-advisor-workflow.test.ts audit-reports/324_ADVISOR_BROAD_STAGING_WARNING_LANGUAGE.md audit-reports/324_NEXT_PROMPT_DRAFT.md audit-reports/324-advisor-broad-staging-warning-language` passed.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts` passed: 17 tests, 0 failures.
- `npx tsx --test tests/boilabin-advisor-workflow.test.ts tests/boilabin-terminal-loop-workflow.test.ts` passed: 31 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 558 tests, 83 suites, 0 failures.

The first full-test capture failed because this draft report briefly included standalone raw broad-staging examples, which the Terminal Loop scanner correctly flagged. The report wording was corrected so unsafe examples appear only as explicitly prohibited examples, and the workflow tests plus full suite then passed.

Evidence:

- `audit-reports/324-advisor-broad-staging-warning-language/baseline-git-status.txt`
- `audit-reports/324-advisor-broad-staging-warning-language/validation-diff-check.txt`
- `audit-reports/324-advisor-broad-staging-warning-language/validation-focused-advisor-tests.txt`
- `audit-reports/324-advisor-broad-staging-warning-language/validation-workflow-tests.txt`
- `audit-reports/324-advisor-broad-staging-warning-language/validation-advisor-state.txt`
- `audit-reports/324-advisor-broad-staging-warning-language/validation-terminal-loop-state.txt`
- `audit-reports/324-advisor-broad-staging-warning-language/validation-typecheck.txt`
- `audit-reports/324-advisor-broad-staging-warning-language/validation-lint.txt`
- `audit-reports/324-advisor-broad-staging-warning-language/validation-npm-test.txt`
- `audit-reports/324-advisor-broad-staging-warning-language/pre-stage-git-status.txt`
- `audit-reports/324-advisor-broad-staging-warning-language/source-diff.patch`

## Guardrail Confirmation

Step 324 did not touch:

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
- `audit-reports/324_ADVISOR_BROAD_STAGING_WARNING_LANGUAGE.md`
- `audit-reports/324_NEXT_PROMPT_DRAFT.md`
- `audit-reports/324-advisor-broad-staging-warning-language/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- Advisor broad-staging detection remains heuristic by design; it is intended to catch obvious unsafe recommendations in Advisor docs, not parse natural language perfectly.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another explicitly non-media prelaunch closure task.
