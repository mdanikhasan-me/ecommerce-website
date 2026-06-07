# Step 378 Buyer Order Page Query Hardening

## Scope

Step 378 skips the still-blocked media decision and completes a bounded non-media buyer order list query parsing hardening step.

Latest commit before Step 378:

```text
29f4f77 fix: harden coupon amount parsing
```

Step 377 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`src/app/api/orders/route.ts` parsed the authenticated buyer order list `page` query with `parseInt(...)`.

That allowed partial numeric values such as:

- `2abc`
- `1e3`
- `0x10`

It also left very large page values uncapped before Prisma `skip` calculation.

## Fix

Updated:

- `src/app/api/orders/route.ts`
- `src/backend/orders/buyer-order-list.ts`
- `tests/buyer-order-list-query.test.ts`

The buyer order list route now uses a dedicated page parser that:

- accepts only whole positive decimal integers
- trims normal whitespace around valid page values
- defaults malformed, partial, non-positive, and unsafe values to page `1`
- caps very large safe page values at `MAX_ORDER_LIST_PAGE`
- centralizes the order list page size as `ORDER_LIST_PAGE_SIZE`

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 377 handoff, Step 321 media gate, current status, public/buyer query parsing, and order route coverage.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused buyer order list query tests, API contract tests, and standard validation.
- Docs Auditor: created this Step 378 report, evidence folder, and Step 379 handoff prompt.
- Implementer: edited only the order list parser helper, the orders route import/use, and focused tests.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/buyer-order-list-query.test.ts` passed: 3 tests, 1 suite, 0 failures.
- `npx tsx --test tests/api-error-contract.test.ts` passed: 28 tests, 0 suites, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 703 tests, 87 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/378-public-query-decimal-hardening/baseline-git-status.txt`
- `audit-reports/378-public-query-decimal-hardening/pre-stage-git-status.txt`
- `audit-reports/378-public-query-decimal-hardening/finding-note.txt`
- `audit-reports/378-public-query-decimal-hardening/source-diff.patch`
- `audit-reports/378-public-query-decimal-hardening/validation-diff-check.txt`
- `audit-reports/378-public-query-decimal-hardening/validation-focused-tests.txt`
- `audit-reports/378-public-query-decimal-hardening/validation-api-contract-tests.txt`
- `audit-reports/378-public-query-decimal-hardening/validation-advisor-state-initial.txt`
- `audit-reports/378-public-query-decimal-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/378-public-query-decimal-hardening/validation-advisor-state.txt`
- `audit-reports/378-public-query-decimal-hardening/validation-terminal-loop-state.txt`
- `audit-reports/378-public-query-decimal-hardening/validation-typecheck.txt`
- `audit-reports/378-public-query-decimal-hardening/validation-lint.txt`
- `audit-reports/378-public-query-decimal-hardening/validation-npm-test.txt`
- `audit-reports/378-public-query-decimal-hardening/validation-build.txt`

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

Step 378 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside authenticated buyer order list page parsing

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/app/api/orders/route.ts`
- `src/backend/orders/buyer-order-list.ts`
- `tests/buyer-order-list-query.test.ts`
- `audit-reports/378_BUYER_ORDER_PAGE_QUERY_HARDENING.md`
- `audit-reports/378_NEXT_PROMPT_DRAFT.md`
- `audit-reports/378-public-query-decimal-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens authenticated buyer order list page parsing only. It does not change order creation, payment/tracking/seller behavior, DB data, or media handling.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
