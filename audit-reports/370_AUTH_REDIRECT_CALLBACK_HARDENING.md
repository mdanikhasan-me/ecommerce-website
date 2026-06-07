# Step 370 Auth Redirect Callback Hardening

## Scope

Step 370 skips the still-blocked media decision and completes a bounded non-media NextAuth redirect callback hardening step.

Latest commit before Step 370:

```text
af1b8ea fix: harden auth host origin protocols
```

Step 369 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`authConfig` did not define a NextAuth `callbacks.redirect` handler.

Auth.js callback URL query/cookie handling therefore relied on the default same-origin redirect behavior instead of the stricter callback target rules hardened in Steps 366 to 368. Same-origin callback URLs could still point to poor post-auth destinations such as:

- `/auth/login`
- `/api/orders`
- `/_next/static/chunks/app.js`
- `/assets/logo.svg`
- `/uploads/admin/product.webp`
- `/robots.txt`
- `/%61uth/login`
- `/%2Fexample.com/phish`

## Fix

Added:

- `src/backend/auth/redirect.ts`
- `tests/auth-redirect.test.ts`

Updated:

- `src/backend/auth/config.ts`

`authConfig.callbacks.redirect` now uses a backend safe redirect helper that:

- allows same-origin page redirects and relative paths
- falls back to the canonical origin for external or unsupported redirect targets
- rejects auth, API, framework, static, upload, metadata, and encoded blocked targets
- rejects malformed encodings and decoded protocol-relative/backslash shapes
- preserves safe same-origin page routes with query strings and hashes

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 369 handoff, current status, NextAuth callback URL utility behavior, auth config, and callback target helper rules.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused auth redirect tests plus standard validation.
- Docs Auditor: created this Step 370 report, evidence folder, and Step 371 handoff prompt.
- Implementer: edited only the authorized auth redirect/config/test files.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/auth-redirect.test.ts` passed: 6 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 695 tests, 86 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/370-auth-redirect-callback-hardening/baseline-git-status.txt`
- `audit-reports/370-auth-redirect-callback-hardening/pre-stage-git-status.txt`
- `audit-reports/370-auth-redirect-callback-hardening/finding-note.txt`
- `audit-reports/370-auth-redirect-callback-hardening/source-diff.patch`
- `audit-reports/370-auth-redirect-callback-hardening/validation-diff-check.txt`
- `audit-reports/370-auth-redirect-callback-hardening/validation-focused-tests.txt`
- `audit-reports/370-auth-redirect-callback-hardening/validation-advisor-state-initial.txt`
- `audit-reports/370-auth-redirect-callback-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/370-auth-redirect-callback-hardening/validation-advisor-state.txt`
- `audit-reports/370-auth-redirect-callback-hardening/validation-terminal-loop-state.txt`
- `audit-reports/370-auth-redirect-callback-hardening/validation-typecheck.txt`
- `audit-reports/370-auth-redirect-callback-hardening/validation-lint.txt`
- `audit-reports/370-auth-redirect-callback-hardening/validation-npm-test.txt`
- `audit-reports/370-auth-redirect-callback-hardening/validation-build.txt`

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

Step 370 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside auth redirect callback handling

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/backend/auth/config.ts`
- `src/backend/auth/redirect.ts`
- `tests/auth-redirect.test.ts`
- `audit-reports/370_AUTH_REDIRECT_CALLBACK_HARDENING.md`
- `audit-reports/370_NEXT_PROMPT_DRAFT.md`
- `audit-reports/370-auth-redirect-callback-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens Auth.js redirect callback handling only. It does not change auth providers, session validation, middleware matching, callback UI behavior, or payment/tracking/seller behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
