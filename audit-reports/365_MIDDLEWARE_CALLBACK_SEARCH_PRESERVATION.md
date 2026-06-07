# Step 365 Middleware Callback Search Preservation

## Scope

Step 365 skips the still-blocked media decision and completes a bounded non-media middleware callback preservation step.

Latest commit before Step 365:

```text
27bfb09 fix: harden middleware session cookie matching
```

Step 364 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`src/middleware.ts` redirected unauthenticated private admin/account requests to `/auth/login`, but it built `callbackUrl` from `pathname` only.

That meant safe internal query strings were dropped before login, for example:

- `/admin/products?status=draft&page=2`
- `/account/orders?filter=returns&sort=recent`

The shared login callback sanitizer already accepts internal path query strings and rejects external, protocol-relative, or backslash-containing values, so middleware could preserve the original internal path plus search string without widening the callback origin boundary.

## Fix

Updated:

- `src/middleware.ts`

Added focused coverage in:

- `tests/security-runtime-boundary.test.ts`

The middleware now builds login redirect URLs with a small helper that:

- uses `/auth/login` as the fixed login path
- builds `callbackUrl` from `req.nextUrl.pathname` plus `req.nextUrl.search`
- sets the callback through `url.searchParams.set`
- avoids accepting caller-supplied external callback origins

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 364 handoff, current status, middleware, callback sanitizer, and security runtime tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused middleware runtime coverage plus standard validation.
- Docs Auditor: created this Step 365 report, evidence folder, and Step 366 handoff prompt.
- Implementer: edited only the authorized middleware and focused test files.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/security-runtime-boundary.test.ts` passed: 10 tests, 3 suites, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 682 tests, 85 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/365-middleware-callback-search-preservation/baseline-git-status.txt`
- `audit-reports/365-middleware-callback-search-preservation/pre-stage-git-status.txt`
- `audit-reports/365-middleware-callback-search-preservation/finding-note.txt`
- `audit-reports/365-middleware-callback-search-preservation/source-diff.patch`
- `audit-reports/365-middleware-callback-search-preservation/validation-diff-check.txt`
- `audit-reports/365-middleware-callback-search-preservation/validation-focused-tests.txt`
- `audit-reports/365-middleware-callback-search-preservation/validation-advisor-state-initial.txt`
- `audit-reports/365-middleware-callback-search-preservation/validation-terminal-loop-state-initial.txt`
- `audit-reports/365-middleware-callback-search-preservation/validation-advisor-state.txt`
- `audit-reports/365-middleware-callback-search-preservation/validation-terminal-loop-state.txt`
- `audit-reports/365-middleware-callback-search-preservation/validation-typecheck.txt`
- `audit-reports/365-middleware-callback-search-preservation/validation-lint.txt`
- `audit-reports/365-middleware-callback-search-preservation/validation-npm-test.txt`
- `audit-reports/365-middleware-callback-search-preservation/validation-build.txt`

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

Step 365 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside middleware private-login redirects

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/middleware.ts`
- `tests/security-runtime-boundary.test.ts`
- `audit-reports/365_MIDDLEWARE_CALLBACK_SEARCH_PRESERVATION.md`
- `audit-reports/365_NEXT_PROMPT_DRAFT.md`
- `audit-reports/365-middleware-callback-search-preservation/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- Middleware still uses cookie presence only as a lightweight redirect hint. Final authorization remains the responsibility of server-side session checks on protected routes.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
