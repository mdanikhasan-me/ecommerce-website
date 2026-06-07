# Step 379 SEO Faceted Page Hardening

## Scope

Step 379 skips the still-blocked media decision and completes a bounded non-media SEO category page query hardening step.

Latest commit before Step 379:

```text
2d44749 fix: harden order page query parsing
```

Step 378 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`src/backend/seo/robots.ts` used `Number(page)` when deciding whether category metadata should treat a `page` query as a faceted noindex URL.

That allowed non-decimal or unsafe page values such as:

- `0x10`
- `1e3`
- `1.5`
- `999999999999999999999`

Those values could mark category metadata as faceted even though storefront category/search parsing treats malformed or unsafe page values as invalid/default page input.

## Fix

Updated:

- `src/backend/seo/robots.ts`
- `tests/seo-policy.test.ts`

The SEO helper now treats `page` as faceted only when it is a trimmed whole decimal safe integer greater than `1`.

Preserved behavior:

- no query params remain indexable
- `page=1` remains indexable
- `page=2` remains faceted/noindex
- other filter params such as `sort` and `minPrice` remain faceted/noindex

New focused coverage rejects malformed page values such as:

- `0`
- `-1`
- `1.5`
- `2abc`
- `0x10`
- `1e3`
- `Infinity`
- `NaN`
- unsafe-large integer strings

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 378 handoff, Step 321 media gate, current status, SEO robots helper, and SEO policy tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused SEO tests, search-param alignment tests, and standard validation.
- Docs Auditor: created this Step 379 report, evidence folder, and Step 380 handoff prompt.
- Implementer: edited only the SEO robots helper and focused SEO policy tests.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/seo-policy.test.ts` passed: 15 tests, 1 suite, 0 failures.
- `npx tsx --test tests/search-params.test.ts` passed: 17 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 704 tests, 87 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/379-seo-faceted-page-hardening/baseline-git-status.txt`
- `audit-reports/379-seo-faceted-page-hardening/pre-stage-git-status.txt`
- `audit-reports/379-seo-faceted-page-hardening/finding-note.txt`
- `audit-reports/379-seo-faceted-page-hardening/source-diff.patch`
- `audit-reports/379-seo-faceted-page-hardening/validation-diff-check.txt`
- `audit-reports/379-seo-faceted-page-hardening/validation-focused-tests.txt`
- `audit-reports/379-seo-faceted-page-hardening/validation-search-params-tests.txt`
- `audit-reports/379-seo-faceted-page-hardening/validation-advisor-state-initial.txt`
- `audit-reports/379-seo-faceted-page-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/379-seo-faceted-page-hardening/validation-advisor-state.txt`
- `audit-reports/379-seo-faceted-page-hardening/validation-terminal-loop-state.txt`
- `audit-reports/379-seo-faceted-page-hardening/validation-typecheck.txt`
- `audit-reports/379-seo-faceted-page-hardening/validation-lint.txt`
- `audit-reports/379-seo-faceted-page-hardening/validation-npm-test.txt`
- `audit-reports/379-seo-faceted-page-hardening/validation-build.txt`

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

Step 379 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside SEO category page faceted detection

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/backend/seo/robots.ts`
- `tests/seo-policy.test.ts`
- `audit-reports/379_SEO_FACETED_PAGE_HARDENING.md`
- `audit-reports/379_NEXT_PROMPT_DRAFT.md`
- `audit-reports/379-seo-faceted-page-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens SEO faceted page detection only. It does not change category product querying, product search, auth, payment/tracking/seller behavior, DB data, or media handling.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
