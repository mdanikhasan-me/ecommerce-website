# Step 363 CSP Pathname Normalization Hardening

## Scope

Step 363 skips the still-blocked media decision and completes a bounded non-media CSP helper hardening step.

Latest commit before Step 363:

```text
6f1f9c5 fix: harden middleware matcher segments
```

Step 362 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`classifyCspRoute` is a report-only helper, but it accepts a value named `pathname` directly. After the segment-boundary hardening in Steps 359 and 361, the helper still assumed callers supplied a clean pathname.

Direct helper callers could pass values with query strings, hashes, relative paths, or full URLs. That meant examples like `/admin?preview=1`, `/account/orders#latest`, or `https://shop.example.com/checkout?step=payment` could be classified using the raw string instead of the actual path.

## Fix

Updated:

- `src/backend/security/csp.ts`

Added focused coverage in:

- `tests/csp.test.ts`

`normalizePathname` now:

- trims input
- returns `/` for blank input
- extracts `.pathname` from full URLs
- strips query strings and hashes from path-like inputs
- preserves relative path support by adding a leading slash
- falls back to `/` for malformed full URL inputs

The focused test covers query strings, hashes, full URLs, framework static URLs, relative paths, and blank input.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/csp.test.ts` passed: 13 tests, 2 suites, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 680 tests, 85 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/363-csp-pathname-normalization-hardening/baseline-git-status.txt`
- `audit-reports/363-csp-pathname-normalization-hardening/pre-stage-git-status.txt`
- `audit-reports/363-csp-pathname-normalization-hardening/finding-note.txt`
- `audit-reports/363-csp-pathname-normalization-hardening/source-diff.patch`
- `audit-reports/363-csp-pathname-normalization-hardening/validation-diff-check.txt`
- `audit-reports/363-csp-pathname-normalization-hardening/validation-focused-tests.txt`
- `audit-reports/363-csp-pathname-normalization-hardening/validation-advisor-state-initial.txt`
- `audit-reports/363-csp-pathname-normalization-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/363-csp-pathname-normalization-hardening/validation-advisor-state.txt`
- `audit-reports/363-csp-pathname-normalization-hardening/validation-terminal-loop-state.txt`
- `audit-reports/363-csp-pathname-normalization-hardening/validation-typecheck.txt`
- `audit-reports/363-csp-pathname-normalization-hardening/validation-lint.txt`
- `audit-reports/363-csp-pathname-normalization-hardening/validation-npm-test.txt`
- `audit-reports/363-csp-pathname-normalization-hardening/validation-build.txt`

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

Step 363 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside the CSP helper

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/backend/security/csp.ts`
- `tests/csp.test.ts`
- `audit-reports/363_CSP_PATHNAME_NORMALIZATION_HARDENING.md`
- `audit-reports/363_NEXT_PROMPT_DRAFT.md`
- `audit-reports/363-csp-pathname-normalization-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens report-only CSP route classification helper inputs. It does not change enforced CSP headers, auth provider configuration, session validation, middleware matching, or static asset serving behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
