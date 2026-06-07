# Step 352 Public Input Boundary Coverage

## Scope

Step 352 skips the still-blocked media decision and completes a bounded non-media no-DB test bundle for shared public API input parser boundaries.

Latest commit before Step 352:

```text
1f2d162 test: cover public review boundaries
```

Step 351 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

Step 339 covered broad public-input parsing behavior, but several exact shared utility contracts were still worth locking down directly:

- exact maximum public id length acceptance;
- public id overflow, slash, and dot rejection;
- public id list entry trimming before dedupe;
- first-valid-id preservation in public id lists;
- exact maximum coupon code length acceptance after normalization;
- coupon code overflow and dot-character rejection;
- zero coupon amount acceptance;
- `Infinity` and `NaN` coupon amount rejection;
- tab and newline search-query whitespace normalization;
- unique public search word capping at `MAX_PUBLIC_SEARCH_WORDS`.

These contracts protect review, coupon, search suggestion, product-view, and order helper callers before they reach route-side database work.

## Fix

Expanded focused no-DB validation coverage in:

- `tests/public-input.test.ts`

No runtime code changed.

## Validation Results

Focused and standard validation passed:

- `git diff --check -- tests/public-input.test.ts audit-reports/352_PUBLIC_INPUT_BOUNDARY_COVERAGE.md audit-reports/352_NEXT_PROMPT_DRAFT.md audit-reports/352-public-input-boundary-coverage` passed.
- `npx tsx --test tests/public-input.test.ts` passed: 8 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 660 tests, 84 suites, 0 failures.

Evidence:

- `audit-reports/352-public-input-boundary-coverage/baseline-git-status.txt`
- `audit-reports/352-public-input-boundary-coverage/source-diff.patch`
- `audit-reports/352-public-input-boundary-coverage/validation-diff-check.txt`
- `audit-reports/352-public-input-boundary-coverage/validation-focused-tests.txt`
- `audit-reports/352-public-input-boundary-coverage/validation-advisor-state.txt`
- `audit-reports/352-public-input-boundary-coverage/validation-terminal-loop-state.txt`
- `audit-reports/352-public-input-boundary-coverage/validation-typecheck.txt`
- `audit-reports/352-public-input-boundary-coverage/validation-lint.txt`
- `audit-reports/352-public-input-boundary-coverage/validation-npm-test.txt`
- `audit-reports/352-public-input-boundary-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only no-DB tests and audit docs. The changed public-input utility contracts are covered by focused tests and the full test suite.

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

Step 352 did not touch:

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

- `tests/public-input.test.ts`
- `audit-reports/352_PUBLIC_INPUT_BOUNDARY_COVERAGE.md`
- `audit-reports/352_NEXT_PROMPT_DRAFT.md`
- `audit-reports/352-public-input-boundary-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step adds no-DB shared public-input parser coverage only. It does not prove database-backed coupon validation, search suggestions, order validation, product view tracking, browser rendering, or production rate limiting behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
