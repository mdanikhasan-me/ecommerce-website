# Step 377 Coupon Amount Decimal Hardening

## Scope

Step 377 skips the still-blocked media decision and completes a bounded non-media public API input hardening step.

Latest commit before Step 377:

```text
77502e3 fix: harden search numeric filters
```

Step 376 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`src/backend/api/public-input.ts` used `Number(...)` after trimming the public coupon validation `amount` input.

That already rejected `Infinity`, `NaN`, and negative values, but JavaScript numeric parsing still accepted non-decimal spellings such as:

- `0x10`
- `1e3`

Those values could become coupon validation amount input even though the public API and storefront behavior expect a plain decimal amount string.

## Fix

Updated:

- `src/backend/api/public-input.ts`
- `tests/public-input.test.ts`

The public coupon amount parser now requires plain decimal numeric strings before numeric conversion.

Preserved behavior:

- blank amount strings still normalize to `0`
- decimal values remain accepted
- negative, `Infinity`, and `NaN` remain rejected
- high values still clamp to `MAX_COUPON_AMOUNT`

New focused coverage rejects:

- `0x10`
- `1e3`

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 376 handoff, Step 321 media gate, current status, public input parser, and focused tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused public-input tests, API contract tests, and standard validation.
- Docs Auditor: created this Step 377 report, evidence folder, and Step 378 handoff prompt.
- Implementer: edited only the public input parser and focused public-input tests.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/public-input.test.ts` passed: 8 tests, 1 suite, 0 failures.
- `npx tsx --test tests/api-error-contract.test.ts` passed: 28 tests, 0 suites, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 700 tests, 86 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/377-coupon-amount-decimal-hardening/baseline-git-status.txt`
- `audit-reports/377-coupon-amount-decimal-hardening/pre-stage-git-status.txt`
- `audit-reports/377-coupon-amount-decimal-hardening/finding-note.txt`
- `audit-reports/377-coupon-amount-decimal-hardening/source-diff.patch`
- `audit-reports/377-coupon-amount-decimal-hardening/validation-diff-check.txt`
- `audit-reports/377-coupon-amount-decimal-hardening/validation-focused-tests.txt`
- `audit-reports/377-coupon-amount-decimal-hardening/validation-api-contract-tests.txt`
- `audit-reports/377-coupon-amount-decimal-hardening/validation-advisor-state-initial.txt`
- `audit-reports/377-coupon-amount-decimal-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/377-coupon-amount-decimal-hardening/validation-advisor-state.txt`
- `audit-reports/377-coupon-amount-decimal-hardening/validation-terminal-loop-state.txt`
- `audit-reports/377-coupon-amount-decimal-hardening/validation-typecheck.txt`
- `audit-reports/377-coupon-amount-decimal-hardening/validation-lint.txt`
- `audit-reports/377-coupon-amount-decimal-hardening/validation-npm-test.txt`
- `audit-reports/377-coupon-amount-decimal-hardening/validation-build.txt`

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

Step 377 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside public coupon amount parsing

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/backend/api/public-input.ts`
- `tests/public-input.test.ts`
- `audit-reports/377_COUPON_AMOUNT_DECIMAL_HARDENING.md`
- `audit-reports/377_NEXT_PROMPT_DRAFT.md`
- `audit-reports/377-coupon-amount-decimal-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens public coupon amount parsing only. It does not change coupon rules, auth, payment/tracking/seller behavior, DB data, or media handling.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
