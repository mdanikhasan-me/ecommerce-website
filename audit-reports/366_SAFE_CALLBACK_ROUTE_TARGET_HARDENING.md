# Step 366 Safe Callback Route Target Hardening

## Scope

Step 366 skips the still-blocked media decision and completes a bounded non-media safe callback route-target hardening step.

Latest commit before Step 366:

```text
8b42a46 fix: preserve middleware login callback search
```

Step 365 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`getSafeCallbackUrl` rejected external, protocol-relative, non-path, and raw backslash callback URLs, but it still allowed poor internal post-auth destinations such as:

- `/auth/login`
- `/auth/register`
- `/api/orders`
- `/_next/static/chunks/app.js`
- `/assets/logo.svg`
- `/uploads/admin/product.webp`

Those values are not external open redirects, but they can create auth loops, send users to API/framework routes, or send users to static/upload assets after login/register.

## Fix

Updated:

- `src/frontend/utils/safe-callback-url.ts`

Added focused coverage in:

- `tests/safe-callback-url.test.ts`

The callback sanitizer now rejects:

- auth route segment targets
- API route segment targets
- framework route segment targets under `/_next`
- static/upload prefixes under `/assets/` and `/uploads/`

The helper still preserves normal internal page callbacks and does not catch public prefix lookalikes such as `/authentication`, `/apiary`, `/assetsish/logo.svg`, or `/uploadsish/product.webp`.

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 365 handoff, current status, callback sanitizer, auth callback usage, and focused callback tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused safe callback tests plus standard validation.
- Docs Auditor: created this Step 366 report, evidence folder, and Step 367 handoff prompt.
- Implementer: edited only the authorized callback helper and focused test files.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/safe-callback-url.test.ts` passed: 6 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 684 tests, 85 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/366-safe-callback-route-target-hardening/baseline-git-status.txt`
- `audit-reports/366-safe-callback-route-target-hardening/pre-stage-git-status.txt`
- `audit-reports/366-safe-callback-route-target-hardening/finding-note.txt`
- `audit-reports/366-safe-callback-route-target-hardening/source-diff.patch`
- `audit-reports/366-safe-callback-route-target-hardening/validation-diff-check.txt`
- `audit-reports/366-safe-callback-route-target-hardening/validation-focused-tests.txt`
- `audit-reports/366-safe-callback-route-target-hardening/validation-advisor-state-initial.txt`
- `audit-reports/366-safe-callback-route-target-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/366-safe-callback-route-target-hardening/validation-advisor-state.txt`
- `audit-reports/366-safe-callback-route-target-hardening/validation-terminal-loop-state.txt`
- `audit-reports/366-safe-callback-route-target-hardening/validation-typecheck.txt`
- `audit-reports/366-safe-callback-route-target-hardening/validation-lint.txt`
- `audit-reports/366-safe-callback-route-target-hardening/validation-npm-test.txt`
- `audit-reports/366-safe-callback-route-target-hardening/validation-build.txt`

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

Step 366 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside safe callback target normalization

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/frontend/utils/safe-callback-url.ts`
- `tests/safe-callback-url.test.ts`
- `audit-reports/366_SAFE_CALLBACK_ROUTE_TARGET_HARDENING.md`
- `audit-reports/366_NEXT_PROMPT_DRAFT.md`
- `audit-reports/366-safe-callback-route-target-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens login/register callback target selection only. It does not change auth providers, session validation, middleware matching, or payment/tracking/seller behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
