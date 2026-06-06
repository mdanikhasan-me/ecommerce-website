# Step 337 Admin Mutation Parser Coverage

## Scope

Step 337 skips the still-blocked media decision and completes a bounded non-media no-DB test bundle for admin mutation parser contracts.

Latest commit before Step 337:

```text
9e5eb81 test: cover admin no-db validation
```

Step 336 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

Step 336 covered settings, moderation, returns, and reports. Other admin mutation parsers still had only basic coverage and did not directly lock down several no-DB edge cases:

- order and payment status note normalization and invalid enum handling;
- inventory duplicate variant handling after trimming, numeric boundaries, and adjustment-note boundaries;
- coupon defaults, relation id trimming/deduping, invalid limits, blank relation ids, malformed required fields, and invalid dates;
- notification defaulting, direct-user trimming, recipient/type/link strictness, copy bounds, read-toggle shape, and audience filters;
- admin user sparse updates, boolean strictness, profile length boundaries, list-filter fallback, and empty where clauses.

These contracts are important prelaunch admin safety checks and can be validated without database access, migrations, browser auth, media changes, or provider decisions.

## Fix

Added focused parser coverage across existing no-DB test files:

- `tests/order-update-validation.test.ts`
- `tests/inventory-validation.test.ts`
- `tests/coupon-validation.test.ts`
- `tests/notification-validation.test.ts`
- `tests/admin-user-validation.test.ts`

No runtime code changed.

During focused validation, the sparse admin user update test was corrected to document the existing parser contract: sparse updates normalize `name` and `phone` to `null`.

## Validation Results

Focused and standard validation passed:

- `git diff --check -- tests/order-update-validation.test.ts tests/inventory-validation.test.ts tests/coupon-validation.test.ts tests/notification-validation.test.ts tests/admin-user-validation.test.ts audit-reports/337_ADMIN_MUTATION_PARSER_COVERAGE.md audit-reports/337_NEXT_PROMPT_DRAFT.md audit-reports/337-admin-mutation-parser-coverage` passed.
- `npx tsx --test tests/order-update-validation.test.ts tests/inventory-validation.test.ts tests/coupon-validation.test.ts tests/notification-validation.test.ts tests/admin-user-validation.test.ts` passed: 37 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 591 tests, 83 suites, 0 failures.

Evidence:

- `audit-reports/337-admin-mutation-parser-coverage/baseline-git-status.txt`
- `audit-reports/337-admin-mutation-parser-coverage/source-diff.patch`
- `audit-reports/337-admin-mutation-parser-coverage/validation-diff-check.txt`
- `audit-reports/337-admin-mutation-parser-coverage/validation-focused-tests.txt`
- `audit-reports/337-admin-mutation-parser-coverage/validation-advisor-state.txt`
- `audit-reports/337-admin-mutation-parser-coverage/validation-terminal-loop-state.txt`
- `audit-reports/337-admin-mutation-parser-coverage/validation-typecheck.txt`
- `audit-reports/337-admin-mutation-parser-coverage/validation-lint.txt`
- `audit-reports/337-admin-mutation-parser-coverage/validation-npm-test.txt`
- `audit-reports/337-admin-mutation-parser-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only no-DB tests and audit docs. The changed parser contracts are covered by focused tests and the full test suite.

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

Step 337 did not touch:

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

- `tests/order-update-validation.test.ts`
- `tests/inventory-validation.test.ts`
- `tests/coupon-validation.test.ts`
- `tests/notification-validation.test.ts`
- `tests/admin-user-validation.test.ts`
- `audit-reports/337_ADMIN_MUTATION_PARSER_COVERAGE.md`
- `audit-reports/337_NEXT_PROMPT_DRAFT.md`
- `audit-reports/337-admin-mutation-parser-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step adds no-DB parser coverage only. It does not prove authenticated admin browser flows, database-backed mutations, or production provider behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
