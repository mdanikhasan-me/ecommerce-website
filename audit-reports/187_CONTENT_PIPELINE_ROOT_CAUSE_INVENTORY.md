# Step 187 - Content Pipeline Root-Cause Inventory

## Scope

This loop inspected the current content-quality findings before editing. It treated the issue as a pipeline problem across buyer copy, metadata, schema wording, admin helper text, docs, and seed/demo content.

## Commands Run

- `git status --short`
- `git diff --cached --name-only`
- `git log -1 --oneline`
- `node scripts/audit-ai-marketing-copy.mjs`
- targeted `rg` searches for unsupported marketplace wording

## Latest Context Verified

- Latest commit before this batch: `f182fb1 fix: harden media upload optimization guardrails`
- Previous media batch summary present: `audit-reports/185_MEDIA_BATCH_SUMMARY.md`
- Working tree and staged set were clean before edits.

## Baseline Audit Result

The pre-edit scanner reported 31 findings across 228 files.

## Finding Classification

| Area | Findings | Safe to rewrite now | Notes |
| --- | ---: | --- | --- |
| Buyer-visible copy | 8 | Partial | About, homepage, hero, FAQ, and shipping were in scope. Footer was protected. |
| Metadata fallback copy | 7 | Yes | Layout, site config, SEO constants, product/category metadata fallbacks were in scope. |
| Open Graph/Twitter copy | 2 | Yes | Layout and homepage metadata use shared SEO fallbacks. |
| JSON-LD/schema wording | 0 scanner hits | No edit | JSON-LD lives in `src/backend/seo/structured-data.ts`, outside the edit allowlist. |
| Help/policy page copy | 4 | Yes | FAQ and shipping had unsupported guarantees. Contact/returns/track-order had no hard-blocked findings. |
| Homepage/component copy | 3 | Yes | Homepage subtitles and empty-hero fallback were in scope. |
| Admin input helper copy | 2 | Yes | Product SEO placeholders encouraged unsupported copy. |
| Seed/demo content | 10 | No | `prisma/seed.ts` was intentionally out of scope. |
| Docs-only copy | 3 README findings | No | README was intentionally out of scope. |
| Internal identifiers | 0 baseline findings | No | `isBestSeller`, schema flags, and auth trust identifiers are functional labels. |
| False positives | Several possible | No edit | Product-level use of "premium" may describe product positioning, but seed was out of scope. |

## Root Cause

Unsupported copy entered through multiple fallback paths rather than one page:

- global layout and SEO constants used "best price" language;
- category metadata generated "Best Prices" titles by default;
- product metadata and admin placeholders encouraged "fast delivery" and "secure checkout" claims;
- homepage sections used "premium quality" and "Loved by thousands";
- the About and FAQ pages claimed trust, authenticity, or broad operational guarantees;
- seed/demo product descriptions still contain old marketplace language.

## Safe Replacement Direction

- Describe page contents: product listings, prices, images, availability, categories, order support, and policy pages.
- Preserve functional labels such as `Best Sellers` where they are tied to existing product flags.
- Skip seed/demo, README, footer, and other protected files until a dedicated approved step.

## Risks If Changed

- Overwriting seed/demo or footer content would violate this batch's guardrails.
- Changing schema, routes, UI structure, or SEO index rules would exceed wording cleanup.
- Inventing delivery, authenticity, or customer-count claims would make the content problem worse.

## Decision

Proceed with wording-only edits in the allowed source/docs/script/test files. Do not edit protected or out-of-scope files.
