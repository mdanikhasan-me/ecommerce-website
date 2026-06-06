# Step 342 Admin Catalog Payload Coverage

## Scope

Step 342 skips the still-blocked media decision and completes a bounded non-media no-DB test bundle for admin catalog payload parser contracts.

Latest commit before Step 342:

```text
5f0d6c3 test: cover string utilities
```

Step 341 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

The existing admin validation tests covered the happy path and a few rejection cases, but several important catalog parser contracts were not directly locked down:

- product defaults for blank optionals, booleans, numeric fallbacks, images, and variants;
- product rejection for variant sale-price violations and negative numeric values;
- category inactive state preservation, allowed negative sort order, and sort boundary rejection;
- banner default normalization, explicit inactive state, external http links, invalid dates, and sort boundary rejection;
- homepage section blank config normalization and JSON-safe config rejection.

These parser contracts are shared by admin create/edit flows and can be validated without database access, media changes, browser auth, migrations, or provider decisions.

## Fix

Expanded focused no-DB validation coverage in:

- `tests/product-validation.test.ts`
- `tests/category-validation.test.ts`
- `tests/banner-validation.test.ts`
- `tests/homepage-section-validation.test.ts`

No runtime code changed.

## Validation Results

Focused and standard validation passed:

- `git diff --check -- tests/product-validation.test.ts tests/category-validation.test.ts tests/banner-validation.test.ts tests/homepage-section-validation.test.ts audit-reports/342_ADMIN_CATALOG_PAYLOAD_COVERAGE.md audit-reports/342_NEXT_PROMPT_DRAFT.md audit-reports/342-admin-catalog-payload-coverage` passed.
- `npx tsx --test tests/product-validation.test.ts tests/category-validation.test.ts tests/banner-validation.test.ts tests/homepage-section-validation.test.ts` passed: 30 tests, 4 suites, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 624 tests, 84 suites, 0 failures.

Evidence:

- `audit-reports/342-admin-catalog-payload-coverage/baseline-git-status.txt`
- `audit-reports/342-admin-catalog-payload-coverage/source-diff.patch`
- `audit-reports/342-admin-catalog-payload-coverage/validation-diff-check.txt`
- `audit-reports/342-admin-catalog-payload-coverage/validation-focused-tests.txt`
- `audit-reports/342-admin-catalog-payload-coverage/validation-advisor-state.txt`
- `audit-reports/342-admin-catalog-payload-coverage/validation-terminal-loop-state.txt`
- `audit-reports/342-admin-catalog-payload-coverage/validation-typecheck.txt`
- `audit-reports/342-admin-catalog-payload-coverage/validation-lint.txt`
- `audit-reports/342-admin-catalog-payload-coverage/validation-npm-test.txt`
- `audit-reports/342-admin-catalog-payload-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only no-DB tests and audit docs. The changed admin parser contracts are covered by focused tests and the full test suite.

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

Step 342 did not touch:

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

- `tests/product-validation.test.ts`
- `tests/category-validation.test.ts`
- `tests/banner-validation.test.ts`
- `tests/homepage-section-validation.test.ts`
- `audit-reports/342_ADMIN_CATALOG_PAYLOAD_COVERAGE.md`
- `audit-reports/342_NEXT_PROMPT_DRAFT.md`
- `audit-reports/342-admin-catalog-payload-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step adds no-DB parser coverage only. It does not prove database-backed admin saves, browser rendering, or production provider behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
