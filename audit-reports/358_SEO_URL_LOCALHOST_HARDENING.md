# Step 358 SEO URL Localhost Hardening

## Scope

Step 358 skips the still-blocked media decision and completes a bounded non-media SEO URL boundary hardening step.

Latest commit before Step 358:

```text
c7e74aa fix: harden auth host boundaries
```

Step 357 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`normalizeSiteUrl` already blocked ordinary localhost values from leaking into production canonical URLs, metadata, sitemap entries, and JSON-LD.

After Step 357 fixed the same boundary shape for auth host trust, Step 358 checked the SEO URL helper and found the same bracketed IPv6 localhost risk: Node URL parsing can expose the IPv6 loopback hostname as `[::1]`, while the SEO local-host set only included `::1`.

This meant an input such as `http://[::1]:3000/products/test` could be treated as a valid canonical site origin instead of falling back to the public default.

## Fix

Updated:

- `src/backend/seo/urls.ts`

Added focused coverage in:

- `tests/seo-policy.test.ts`

The SEO URL helper now treats bracketed IPv6 loopback hostnames as local and falls back to the default public site URL.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/seo-policy.test.ts` passed: 13 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 675 tests, 85 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/358-seo-url-localhost-hardening/baseline-git-status.txt`
- `audit-reports/358-seo-url-localhost-hardening/pre-stage-git-status.txt`
- `audit-reports/358-seo-url-localhost-hardening/finding-note.txt`
- `audit-reports/358-seo-url-localhost-hardening/source-diff.patch`
- `audit-reports/358-seo-url-localhost-hardening/validation-diff-check.txt`
- `audit-reports/358-seo-url-localhost-hardening/validation-focused-tests.txt`
- `audit-reports/358-seo-url-localhost-hardening/validation-advisor-state-initial.txt`
- `audit-reports/358-seo-url-localhost-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/358-seo-url-localhost-hardening/validation-advisor-state.txt`
- `audit-reports/358-seo-url-localhost-hardening/validation-terminal-loop-state.txt`
- `audit-reports/358-seo-url-localhost-hardening/validation-typecheck.txt`
- `audit-reports/358-seo-url-localhost-hardening/validation-lint.txt`
- `audit-reports/358-seo-url-localhost-hardening/validation-npm-test.txt`
- `audit-reports/358-seo-url-localhost-hardening/validation-build.txt`

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

Step 358 did not touch:

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

- `src/backend/seo/urls.ts`
- `tests/seo-policy.test.ts`
- `audit-reports/358_SEO_URL_LOCALHOST_HARDENING.md`
- `audit-reports/358_NEXT_PROMPT_DRAFT.md`
- `audit-reports/358-seo-url-localhost-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens SEO URL normalization only. Final canonical domain readiness still depends on the production `NEXT_PUBLIC_SITE_URL` value chosen for launch.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
