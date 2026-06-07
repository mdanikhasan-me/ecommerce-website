# Step 361 CSP Static Route Segment Hardening

## Scope

Step 361 skips the still-blocked media decision and completes a bounded non-media CSP static-route boundary hardening step.

Latest commit before Step 361:

```text
0b3e7b5 fix: harden middleware route segments
```

Step 360 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`classifyCspRoute` skipped Next framework static routes using raw prefix checks for:

- `/_next/static`
- `/_next/image`

That correctly excluded real framework assets, but it could also exclude public lookalike paths such as `/_next/staticish/chunks/app.js`, `/_next/image-proxy`, and `/_next/images/product.webp` from report-only CSP route classification.

The existing `/assets/` and `/uploads/` checks were already slash-prefixed asset buckets, so the issue was limited to the framework static route prefixes.

## Fix

Updated:

- `src/backend/security/csp.ts`

Added focused coverage in:

- `tests/csp.test.ts`

Next framework static paths now use path-segment matching, while `/assets/` and `/uploads/` remain explicit slash-prefixed static asset buckets.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/csp.test.ts` passed: 12 tests, 2 suites, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 678 tests, 85 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/361-csp-static-route-segment-hardening/baseline-git-status.txt`
- `audit-reports/361-csp-static-route-segment-hardening/pre-stage-git-status.txt`
- `audit-reports/361-csp-static-route-segment-hardening/finding-note.txt`
- `audit-reports/361-csp-static-route-segment-hardening/source-diff.patch`
- `audit-reports/361-csp-static-route-segment-hardening/validation-diff-check.txt`
- `audit-reports/361-csp-static-route-segment-hardening/validation-focused-tests.txt`
- `audit-reports/361-csp-static-route-segment-hardening/validation-advisor-state-initial.txt`
- `audit-reports/361-csp-static-route-segment-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/361-csp-static-route-segment-hardening/validation-advisor-state.txt`
- `audit-reports/361-csp-static-route-segment-hardening/validation-terminal-loop-state.txt`
- `audit-reports/361-csp-static-route-segment-hardening/validation-typecheck.txt`
- `audit-reports/361-csp-static-route-segment-hardening/validation-lint.txt`
- `audit-reports/361-csp-static-route-segment-hardening/validation-npm-test.txt`
- `audit-reports/361-csp-static-route-segment-hardening/validation-build.txt`

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

Step 361 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside CSP route classification

No enforced CSP rollout, media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/backend/security/csp.ts`
- `tests/csp.test.ts`
- `audit-reports/361_CSP_STATIC_ROUTE_SEGMENT_HARDENING.md`
- `audit-reports/361_NEXT_PROMPT_DRAFT.md`
- `audit-reports/361-csp-static-route-segment-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens report-only CSP route-family classification only. It does not enable enforced CSP or change static asset serving behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
