# Step 364 Middleware Session Cookie Boundary Hardening

## Scope

Step 364 skips the still-blocked media decision and completes a bounded non-media middleware session-cookie boundary hardening step.

Latest commit before Step 364:

```text
ac4d81d fix: harden csp pathname normalization
```

Step 363 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`src/middleware.ts` used `startsWith` against known Auth.js and NextAuth session cookie prefixes when deciding whether a private route had a session cookie hint.

That preserved support for chunked session cookies, but it also accepted forged prefix lookalike names such as:

- `authjs.session-token-fake`
- `__Secure-authjs.session-token-old`
- `next-auth.session-tokenary`
- `__Secure-next-auth.session-token_backup`

The middleware session-cookie check is only a redirect hint, not final authorization, but prefix lookalikes should not be treated as valid session-cookie hints for private route segments.

## Fix

Updated:

- `src/middleware.ts`

Added focused coverage in:

- `tests/security-runtime-boundary.test.ts`

The middleware now accepts only:

- exact known session cookie names
- numeric chunk suffixes such as `.0`, `.1`, and `.2`

Prefix lookalike cookie names continue to redirect private admin/account paths to login.

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 363 handoff, current status, CSP helper, middleware, and security runtime tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused middleware runtime coverage plus standard validation.
- Docs Auditor: created this Step 364 report, evidence folder, and Step 365 handoff prompt.
- Implementer: edited only the authorized middleware and focused test files.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/security-runtime-boundary.test.ts` passed: 9 tests, 3 suites, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 681 tests, 85 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/364-middleware-session-cookie-boundary-hardening/baseline-git-status.txt`
- `audit-reports/364-middleware-session-cookie-boundary-hardening/pre-stage-git-status.txt`
- `audit-reports/364-middleware-session-cookie-boundary-hardening/finding-note.txt`
- `audit-reports/364-middleware-session-cookie-boundary-hardening/source-diff.patch`
- `audit-reports/364-middleware-session-cookie-boundary-hardening/validation-diff-check.txt`
- `audit-reports/364-middleware-session-cookie-boundary-hardening/validation-focused-tests.txt`
- `audit-reports/364-middleware-session-cookie-boundary-hardening/validation-advisor-state-initial.txt`
- `audit-reports/364-middleware-session-cookie-boundary-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/364-middleware-session-cookie-boundary-hardening/validation-advisor-state.txt`
- `audit-reports/364-middleware-session-cookie-boundary-hardening/validation-terminal-loop-state.txt`
- `audit-reports/364-middleware-session-cookie-boundary-hardening/validation-typecheck.txt`
- `audit-reports/364-middleware-session-cookie-boundary-hardening/validation-lint.txt`
- `audit-reports/364-middleware-session-cookie-boundary-hardening/validation-npm-test.txt`
- `audit-reports/364-middleware-session-cookie-boundary-hardening/validation-build.txt`

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

Step 364 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside middleware session-cookie hint matching

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/middleware.ts`
- `tests/security-runtime-boundary.test.ts`
- `audit-reports/364_MIDDLEWARE_SESSION_COOKIE_BOUNDARY_HARDENING.md`
- `audit-reports/364_NEXT_PROMPT_DRAFT.md`
- `audit-reports/364-middleware-session-cookie-boundary-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- Middleware still uses cookie presence only as a lightweight redirect hint. Final authorization remains the responsibility of server-side session checks on protected routes.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
