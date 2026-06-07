# Step 357 Auth Host Boundary Hardening

## Scope

Step 357 skips the still-blocked media decision and completes a bounded non-media auth-host boundary hardening step.

Latest commit before Step 357:

```text
5fedd76 fix: harden callback fallback handling
```

Step 356 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

The auth host helper already covered local production verification, explicit `AUTH_TRUST_HOST` overrides, unknown production custom hosts, and canonical-origin warning behavior.

Step 357 added direct coverage for several missing host-trust boundaries:

- explicit `AUTH_TRUST_HOST` values with casing and whitespace;
- explicit false values taking precedence over managed-host signals;
- recognized managed-host signals such as Vercel and Netlify;
- `NEXT_PUBLIC_SITE_URL` as a local verification fallback;
- warning behavior when managed hosting has a canonical origin.

The new local IPv6 test exposed a small task-caused boundary gap: Node URL parsing reports the IPv6 loopback hostname as `[::1]`, while the local-host set only included `::1`.

## Fix

Updated:

- `src/backend/auth/host.ts`

Added focused coverage in:

- `tests/auth-host.test.ts`

The auth host helper now treats bracketed IPv6 loopback hostnames as local for production verification.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/auth-host.test.ts` passed: 8 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 675 tests, 85 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/357-auth-host-boundary-hardening/baseline-git-status.txt`
- `audit-reports/357-auth-host-boundary-hardening/pre-stage-git-status.txt`
- `audit-reports/357-auth-host-boundary-hardening/failure-classification.txt`
- `audit-reports/357-auth-host-boundary-hardening/source-diff.patch`
- `audit-reports/357-auth-host-boundary-hardening/validation-diff-check.txt`
- `audit-reports/357-auth-host-boundary-hardening/validation-focused-tests.txt`
- `audit-reports/357-auth-host-boundary-hardening/validation-advisor-state.txt`
- `audit-reports/357-auth-host-boundary-hardening/validation-terminal-loop-state.txt`
- `audit-reports/357-auth-host-boundary-hardening/validation-typecheck.txt`
- `audit-reports/357-auth-host-boundary-hardening/validation-lint.txt`
- `audit-reports/357-auth-host-boundary-hardening/validation-npm-test.txt`
- `audit-reports/357-auth-host-boundary-hardening/validation-build.txt`

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

Step 357 did not touch:

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

- `src/backend/auth/host.ts`
- `tests/auth-host.test.ts`
- `audit-reports/357_AUTH_HOST_BOUNDARY_HARDENING.md`
- `audit-reports/357_NEXT_PROMPT_DRAFT.md`
- `audit-reports/357-auth-host-boundary-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens helper behavior only. Final production `AUTH_TRUST_HOST` policy still depends on the selected hosting provider and reverse-proxy trust model.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
