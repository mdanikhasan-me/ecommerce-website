# Step 338 Customer Input Validation Coverage

## Scope

Step 338 skips the still-blocked media decision and completes a bounded non-media no-DB test bundle for customer/account input parser contracts.

Latest commit before Step 338:

```text
b562d65 test: cover admin mutation parsers
```

Step 337 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

The customer/account validation tests covered basic happy paths and a few rejection paths, but several no-DB boundaries were not directly locked down:

- address required-field, optional-field, phone, length, and strict boolean behavior;
- profile omitted-phone normalization and name/phone length boundaries;
- review safe-id trimming, integer rating strictness, title/body length boundaries, and default title normalization;
- buyer checkout optional field normalization, blank coupon handling, client image URL filtering, note truncation, and safe item quantity behavior;
- buyer return request blank/omitted description normalization and reason length boundaries.

These are prelaunch user-facing input contracts that can be tested without database access, browser auth, media changes, or provider decisions.

## Fix

Added focused no-DB test coverage across existing customer/account validation files:

- `tests/address-validation.test.ts`
- `tests/profile-validation.test.ts`
- `tests/review-validation.test.ts`
- `tests/buyer-order-return-validation.test.ts`

No runtime code changed.

During focused validation, the buyer checkout test was corrected to import the existing `MAX_ORDER_NOTES_LENGTH` constant before asserting note truncation.

## Validation Results

Focused and standard validation passed:

- `git diff --check -- tests/address-validation.test.ts tests/profile-validation.test.ts tests/review-validation.test.ts tests/buyer-order-return-validation.test.ts audit-reports/338_CUSTOMER_INPUT_VALIDATION_COVERAGE.md audit-reports/338_NEXT_PROMPT_DRAFT.md audit-reports/338-customer-input-validation-coverage` passed.
- `npx tsx --test tests/address-validation.test.ts tests/profile-validation.test.ts tests/review-validation.test.ts tests/buyer-order-return-validation.test.ts` passed: 29 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 599 tests, 83 suites, 0 failures.

Evidence:

- `audit-reports/338-customer-input-validation-coverage/baseline-git-status.txt`
- `audit-reports/338-customer-input-validation-coverage/source-diff.patch`
- `audit-reports/338-customer-input-validation-coverage/validation-diff-check.txt`
- `audit-reports/338-customer-input-validation-coverage/validation-focused-tests.txt`
- `audit-reports/338-customer-input-validation-coverage/validation-advisor-state.txt`
- `audit-reports/338-customer-input-validation-coverage/validation-terminal-loop-state.txt`
- `audit-reports/338-customer-input-validation-coverage/validation-typecheck.txt`
- `audit-reports/338-customer-input-validation-coverage/validation-lint.txt`
- `audit-reports/338-customer-input-validation-coverage/validation-npm-test.txt`
- `audit-reports/338-customer-input-validation-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only no-DB tests and audit docs. The changed input contracts are covered by focused tests and the full test suite.

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

Step 338 did not touch:

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

- `tests/address-validation.test.ts`
- `tests/profile-validation.test.ts`
- `tests/review-validation.test.ts`
- `tests/buyer-order-return-validation.test.ts`
- `audit-reports/338_CUSTOMER_INPUT_VALIDATION_COVERAGE.md`
- `audit-reports/338_NEXT_PROMPT_DRAFT.md`
- `audit-reports/338-customer-input-validation-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step adds no-DB input parser coverage only. It does not prove authenticated browser flows, database-backed checkout/return/review writes, or production provider behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
