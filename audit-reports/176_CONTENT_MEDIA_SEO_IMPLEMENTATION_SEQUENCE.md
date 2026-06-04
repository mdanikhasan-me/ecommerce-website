# Step 176 - Content Media SEO Implementation Sequence

## Scope

This loop compared likely next implementation batches and chose the safest sequence.

## Option A - Owner Project Overview Only

- Benefit: helps owner understanding.
- Risk: low.
- Files likely needed: docs only.
- Validation: docs/state/build.
- Before UI/UX: yes.
- Backend behavior: no.
- Approval needed: no.

Status: completed in this batch.

## Option B - Content Quality Guardrail Implementation

- Benefit: reduces fake/AI-sounding copy.
- Risk: low to medium if visible copy changes.
- Files likely needed: docs, audit script, tests, selected metadata/page copy.
- Validation: script, tests, typecheck, lint, build.
- Before UI/UX: yes.
- Backend behavior: no unless metadata helpers change.
- Approval needed: for broad visible copy changes.

## Option C - Image Upload Compression Implementation

- Benefit: high. Prevents storage/performance damage.
- Risk: medium because upload behavior changes.
- Files likely needed: image-processing helper, admin upload forms, tests, maybe docs.
- Validation: image upload tests, browser smoke if UI changes, build.
- Before UI/UX: yes.
- Backend behavior: yes, but contained.
- Approval needed: for original retention/storage policy.

## Option D - Product/Category Schema Hardening

- Benefit: high for search and AI discovery.
- Risk: medium if metadata/schema claims exceed visible content.
- Files likely needed: SEO helpers, product/category pages, tests.
- Validation: SEO tests, rich-result manual checks later, build.
- Before UI/UX: preferably yes or parallel.
- Backend behavior: mostly metadata, not business logic.
- Approval needed: for shipping/return/brand/GTIN claims.

## Option E - Buying Guide/Collection Page System

- Benefit: high for category/search intent.
- Risk: medium because new route/content system may be needed.
- Files likely needed: routes, content model or static content, SEO tests.
- Validation: route tests, SEO tests, build.
- Before UI/UX: after content policy.
- Backend behavior: maybe.
- Approval needed: yes for content direction.

## Option F - UI/UX Redesign Batch

- Benefit: visible buyer experience.
- Risk: medium to high if mixed with backend.
- Files likely needed: frontend components/styles only.
- Validation: browser visual QA, typecheck, lint, tests, build.
- Before UI/UX: this is UI/UX.
- Backend behavior: should be no.
- Approval needed: yes.

## Option G - Merchant Feed Readiness

- Benefit: future product discovery.
- Risk: medium due feed accuracy, availability, images, identifiers.
- Files likely needed: feed planning, helpers, tests.
- Validation: feed contract tests, build.
- Before UI/UX: after schema/content basics.
- Backend behavior: yes if route/feed is added.
- Approval needed: yes.

## Option H - Sitemap Scaling/Performance Batch

- Benefit: important at catalog scale.
- Risk: medium because sitemap route behavior changes.
- Files likely needed: sitemap helpers/tests.
- Validation: SEO tests, build.
- Before UI/UX: not required, but before large catalog launch.
- Backend behavior: yes for sitemap output.
- Approval needed: maybe.

## Recommended Sequence

1. Image upload/media performance implementation.
2. Content quality guardrail and visible copy cleanup.
3. Search Everywhere/product schema implementation.
4. Public storefront UI/UX redesign.
5. Merchant/feed/sitemap scaling.

## Recommended Next Batch

Choose Option C first: admin image upload/media performance implementation. It has the highest infrastructure benefit before multi-vendor growth and before visual redesign.
