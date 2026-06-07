# Step 362 Middleware Matcher Segment Hardening

## Scope

Step 362 skips the still-blocked media decision and completes a bounded non-media middleware matcher boundary hardening step.

Latest commit before Step 362:

```text
1c6d94c fix: harden csp static route segments
```

Step 361 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`src/middleware.ts` excluded framework/static paths from middleware using broad negative lookahead prefixes:

- `_next/static`
- `_next/image`
- `favicon.ico`
- `apple-touch-icon.png`

That correctly skipped real framework assets and icons, but it could also skip public lookalike paths such as `/_next/staticish/chunks/app.js`, `/_next/image-proxy`, `/favicon.icology`, and `/apple-touch-icon.png.backup`.

This was the middleware matcher counterpart to the route-boundary work completed in Steps 359 to 361.

## Fix

Updated:

- `src/middleware.ts`

Added focused coverage in:

- `tests/security-runtime-boundary.test.ts`

The middleware matcher now uses route-segment boundaries for Next framework static paths and exact matches for icon files. The focused test evaluates real excluded paths and public lookalike paths directly against the exported matcher pattern.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/security-runtime-boundary.test.ts` passed: 8 tests, 3 suites, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 679 tests, 85 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/362-middleware-matcher-segment-hardening/baseline-git-status.txt`
- `audit-reports/362-middleware-matcher-segment-hardening/pre-stage-git-status.txt`
- `audit-reports/362-middleware-matcher-segment-hardening/finding-note.txt`
- `audit-reports/362-middleware-matcher-segment-hardening/source-diff.patch`
- `audit-reports/362-middleware-matcher-segment-hardening/validation-diff-check.txt`
- `audit-reports/362-middleware-matcher-segment-hardening/validation-focused-tests.txt`
- `audit-reports/362-middleware-matcher-segment-hardening/validation-advisor-state-initial.txt`
- `audit-reports/362-middleware-matcher-segment-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/362-middleware-matcher-segment-hardening/validation-advisor-state.txt`
- `audit-reports/362-middleware-matcher-segment-hardening/validation-terminal-loop-state.txt`
- `audit-reports/362-middleware-matcher-segment-hardening/validation-typecheck.txt`
- `audit-reports/362-middleware-matcher-segment-hardening/validation-lint.txt`
- `audit-reports/362-middleware-matcher-segment-hardening/validation-npm-test.txt`
- `audit-reports/362-middleware-matcher-segment-hardening/validation-build.txt`

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

Step 362 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside middleware matcher configuration

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/middleware.ts`
- `tests/security-runtime-boundary.test.ts`
- `audit-reports/362_MIDDLEWARE_MATCHER_SEGMENT_HARDENING.md`
- `audit-reports/362_NEXT_PROMPT_DRAFT.md`
- `audit-reports/362-middleware-matcher-segment-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens middleware matcher exclusions only. It does not change auth provider configuration, session validation, or static asset serving behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
