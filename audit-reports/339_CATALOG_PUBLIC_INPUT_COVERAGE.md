# Step 339 Catalog Public Input Coverage

## Scope

Step 339 skips the still-blocked media decision and completes a bounded non-media no-DB test bundle for catalog, public API input, callback URL, and mutation request-origin guard contracts.

Latest commit before Step 339:

```text
591f9a3 test: cover customer input validation
```

Step 338 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

Recent steps expanded admin and customer parser coverage, but several public navigation/input helpers still lacked direct boundary tests:

- `URLSearchParams` search parsing, control-character query cleanup, exact boolean handling, decimal filter preservation, and product API upper bounds;
- public id/coupon/search parser handling for safe hyphen/underscore tokens, non-string values, decimal coupon amounts, and capped search words;
- callback URL trimming, relative-path rejection, JavaScript URL rejection, and custom fallback behavior;
- mutation request guard reason codes, lower-case safe methods, explicit origin precedence, permissive missing-source behavior outside strict mode, and origin normalization boundaries.

These are no-DB public input contracts that can be tested without media changes, auth browser flows, migrations, or provider decisions.

## Fix

Added focused no-DB test coverage across existing test files:

- `tests/search-params.test.ts`
- `tests/public-input.test.ts`
- `tests/safe-callback-url.test.ts`
- `tests/request-guard.test.ts`

No runtime code changed.

## Validation Results

Focused and standard validation passed:

- `git diff --check -- tests/search-params.test.ts tests/public-input.test.ts tests/safe-callback-url.test.ts tests/request-guard.test.ts audit-reports/339_CATALOG_PUBLIC_INPUT_COVERAGE.md audit-reports/339_NEXT_PROMPT_DRAFT.md audit-reports/339-catalog-public-input-coverage` passed.
- `npx tsx --test tests/search-params.test.ts tests/public-input.test.ts tests/safe-callback-url.test.ts tests/request-guard.test.ts` passed: 30 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 603 tests, 83 suites, 0 failures.

Evidence:

- `audit-reports/339-catalog-public-input-coverage/baseline-git-status.txt`
- `audit-reports/339-catalog-public-input-coverage/source-diff.patch`
- `audit-reports/339-catalog-public-input-coverage/validation-diff-check.txt`
- `audit-reports/339-catalog-public-input-coverage/validation-focused-tests.txt`
- `audit-reports/339-catalog-public-input-coverage/validation-advisor-state.txt`
- `audit-reports/339-catalog-public-input-coverage/validation-terminal-loop-state.txt`
- `audit-reports/339-catalog-public-input-coverage/validation-typecheck.txt`
- `audit-reports/339-catalog-public-input-coverage/validation-lint.txt`
- `audit-reports/339-catalog-public-input-coverage/validation-npm-test.txt`
- `audit-reports/339-catalog-public-input-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only no-DB tests and audit docs. The changed public input contracts are covered by focused tests and the full test suite.

## Push Rule

The user gave standing permission in this chat to push each completed step to GitHub after commit.

Use:

```text
git push origin main
```

Git account targeting for this repo is pinned to:

```text
mdanikhasan-dev
```

Do not print or store GitHub credentials.

## Guardrail Confirmation

Step 339 did not touch:

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

- `tests/search-params.test.ts`
- `tests/public-input.test.ts`
- `tests/safe-callback-url.test.ts`
- `tests/request-guard.test.ts`
- `audit-reports/339_CATALOG_PUBLIC_INPUT_COVERAGE.md`
- `audit-reports/339_NEXT_PROMPT_DRAFT.md`
- `audit-reports/339-catalog-public-input-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step adds no-DB public input coverage only. It does not prove authenticated browser flows, database-backed catalog queries, production security headers, or provider behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
