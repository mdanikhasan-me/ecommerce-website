# Step 340 Commerce Utility Coverage

## Scope

Step 340 skips the still-blocked media decision and completes a bounded non-media no-DB test bundle for shared commerce and formatting utility contracts.

Latest commit before Step 340:

```text
2f5362b test: cover catalog public input
```

Step 339 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

Shared utility tests covered the basics, but several customer-facing helper contracts were not directly locked down:

- non-BDT currency formatting through `Intl.NumberFormat`;
- sale-discount rounding and zero-sale behavior;
- custom shipping thresholds and fees;
- uncapped percentage coupons and smaller fixed coupons;
- generated order number public shape;
- short English date formatting;
- rating-label threshold boundaries;
- stock-status threshold edges, including negative and exact low-stock values.

These helpers are no-DB and can be validated without media changes, browser auth, migrations, or provider decisions.

## Fix

Added focused utility coverage in:

- `tests/commerce-utils.test.ts`

No runtime code changed.

During focused validation, the non-BDT currency test was corrected to document the existing `Intl.NumberFormat` contract: EUR decimal values keep normal currency fractional digits.

## Validation Results

Focused and standard validation passed:

- `git diff --check -- tests/commerce-utils.test.ts audit-reports/340_COMMERCE_UTILITY_COVERAGE.md audit-reports/340_NEXT_PROMPT_DRAFT.md audit-reports/340-commerce-utility-coverage` passed.
- `npx tsx --test tests/commerce-utils.test.ts` passed: 10 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 607 tests, 83 suites, 0 failures.

Evidence:

- `audit-reports/340-commerce-utility-coverage/baseline-git-status.txt`
- `audit-reports/340-commerce-utility-coverage/source-diff.patch`
- `audit-reports/340-commerce-utility-coverage/validation-diff-check.txt`
- `audit-reports/340-commerce-utility-coverage/validation-focused-tests.txt`
- `audit-reports/340-commerce-utility-coverage/validation-advisor-state.txt`
- `audit-reports/340-commerce-utility-coverage/validation-terminal-loop-state.txt`
- `audit-reports/340-commerce-utility-coverage/validation-typecheck.txt`
- `audit-reports/340-commerce-utility-coverage/validation-lint.txt`
- `audit-reports/340-commerce-utility-coverage/validation-npm-test.txt`
- `audit-reports/340-commerce-utility-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only no-DB tests and audit docs. The changed utility contracts are covered by focused tests and the full test suite.

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

Step 340 did not touch:

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

- `tests/commerce-utils.test.ts`
- `audit-reports/340_COMMERCE_UTILITY_COVERAGE.md`
- `audit-reports/340_NEXT_PROMPT_DRAFT.md`
- `audit-reports/340-commerce-utility-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step adds no-DB utility coverage only. It does not prove end-to-end storefront rendering, database-backed checkout writes, or production provider behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
