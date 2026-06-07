# Step 375 SEO URL Userinfo Hardening

## Scope

Step 375 skips the still-blocked media decision and completes a bounded non-media SEO URL helper hardening step.

Latest commit before Step 375:

```text
8d5aaf6 fix: harden security log URL userinfo
```

Step 374 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`src/backend/seo/urls.ts` accepted HTTP(S) URLs containing username/password userinfo in canonical SEO helpers.

Examples:

- `https://user:pass@shop.example.com/path`
- `https://user:pass@cdn.example.com/image.jpg`
- `//user:pass@cdn.example.com/image.jpg`

`normalizeSiteUrl` could canonicalize credential-bearing site URLs to a clean origin such as `https://shop.example.com`. `toAbsoluteUrl` could also return credential-bearing absolute or protocol-relative URLs for media/Open Graph/JSON-LD fields.

## Fix

Updated:

- `src/backend/seo/urls.ts`
- `tests/seo-policy.test.ts`

The SEO URL helpers now:

- reject username/password userinfo when normalizing the canonical site URL
- reject credential-bearing absolute URLs
- reject credential-bearing protocol-relative URLs
- normalize relative URL fallbacks through a safe site URL
- ensure `canonicalUrl` falls back to a safe normalized site URL rather than returning an unsafe caller-provided base

Focused tests cover canonical site URL fallback, absolute media URL rejection, protocol-relative media URL rejection, relative URL fallback behavior, and canonical URL fallback behavior.

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 374 handoff, Step 321 media gate, current status, SEO URL helpers, metadata usage, and focused SEO tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused SEO policy tests and standard validation.
- Docs Auditor: created this Step 375 report, evidence folder, and Step 376 handoff prompt.
- Implementer: edited only the SEO URL helper and focused SEO policy tests.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/seo-policy.test.ts` passed: 14 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 699 tests, 86 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/375-seo-url-userinfo-hardening/baseline-git-status.txt`
- `audit-reports/375-seo-url-userinfo-hardening/pre-stage-git-status.txt`
- `audit-reports/375-seo-url-userinfo-hardening/finding-note.txt`
- `audit-reports/375-seo-url-userinfo-hardening/source-diff.patch`
- `audit-reports/375-seo-url-userinfo-hardening/validation-diff-check.txt`
- `audit-reports/375-seo-url-userinfo-hardening/validation-focused-tests.txt`
- `audit-reports/375-seo-url-userinfo-hardening/validation-advisor-state-initial.txt`
- `audit-reports/375-seo-url-userinfo-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/375-seo-url-userinfo-hardening/validation-advisor-state.txt`
- `audit-reports/375-seo-url-userinfo-hardening/validation-terminal-loop-state.txt`
- `audit-reports/375-seo-url-userinfo-hardening/validation-typecheck.txt`
- `audit-reports/375-seo-url-userinfo-hardening/validation-lint.txt`
- `audit-reports/375-seo-url-userinfo-hardening/validation-npm-test.txt`
- `audit-reports/375-seo-url-userinfo-hardening/validation-build.txt`

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

Step 375 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside SEO URL normalization

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/backend/seo/urls.ts`
- `tests/seo-policy.test.ts`
- `audit-reports/375_SEO_URL_USERINFO_HARDENING.md`
- `audit-reports/375_NEXT_PROMPT_DRAFT.md`
- `audit-reports/375-seo-url-userinfo-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens SEO URL helpers only. It does not change auth providers, sessions, distributed rate limiting, payment/tracking/seller behavior, or media handling.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
