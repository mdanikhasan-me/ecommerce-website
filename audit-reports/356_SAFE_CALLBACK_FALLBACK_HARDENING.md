# Step 356 Safe Callback Fallback Hardening

## Scope

Step 356 skips the still-blocked media decision and completes a bounded non-media security utility hardening step for auth callback redirects.

Latest commit before Step 356:

```text
e388614 test: cover rate limit boundaries
```

Step 355 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`getSafeCallbackUrl` already rejected unsafe callback values such as external URLs, protocol-relative URLs, backslash paths, and non-root-relative paths.

However, the fallback argument was returned directly when the requested callback was blank or unsafe. Current callers pass fixed internal fallbacks, but directly returning fallback values leaves a future footgun if a caller ever passes an unchecked value as the fallback.

The safe contract should be:

- requested callback values must resolve to internal root-relative paths;
- fallback values must also resolve to internal root-relative paths;
- unsafe requested callback and unsafe fallback combinations must collapse to `/`;
- query strings and fragments remain supported for safe internal paths.

## Fix

Updated:

- `src/frontend/utils/safe-callback-url.ts`

Added focused coverage in:

- `tests/safe-callback-url.test.ts`

The utility now normalizes the requested callback and fallback through the same internal-path checker before returning a value.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/safe-callback-url.test.ts` passed: 4 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 671 tests, 85 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/356-safe-callback-fallback-hardening/baseline-git-status.txt`
- `audit-reports/356-safe-callback-fallback-hardening/pre-stage-git-status.txt`
- `audit-reports/356-safe-callback-fallback-hardening/source-diff.patch`
- `audit-reports/356-safe-callback-fallback-hardening/validation-diff-check.txt`
- `audit-reports/356-safe-callback-fallback-hardening/validation-focused-tests.txt`
- `audit-reports/356-safe-callback-fallback-hardening/validation-advisor-state.txt`
- `audit-reports/356-safe-callback-fallback-hardening/validation-terminal-loop-state.txt`
- `audit-reports/356-safe-callback-fallback-hardening/validation-typecheck.txt`
- `audit-reports/356-safe-callback-fallback-hardening/validation-lint.txt`
- `audit-reports/356-safe-callback-fallback-hardening/validation-npm-test.txt`
- `audit-reports/356-safe-callback-fallback-hardening/validation-build.txt`

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

Step 356 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior

No distributed rate-limit implementation, seed, reset, db push, destructive SQL, migration, provider CLI, package update, media deletion, media restore, media move, media staging, or private env read was run.

## Files To Stage

Stage only:

- `src/frontend/utils/safe-callback-url.ts`
- `tests/safe-callback-url.test.ts`
- `audit-reports/356_SAFE_CALLBACK_FALLBACK_HARDENING.md`
- `audit-reports/356_NEXT_PROMPT_DRAFT.md`
- `audit-reports/356-safe-callback-fallback-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens callback URL fallback handling only. It does not prove every auth provider callback path in a browser session.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
