# Step 200 - Next Implementation Sequence

## Scope

This loop compares the next possible implementation batches after the content-quality cleanup.

## Option Comparison

| Option | Benefit | Risk | Backend impact | Before UI/UX? | Validation needed | Owner approval |
| --- | --- | --- | --- | --- | --- | --- |
| A. Structured data/content alignment | Improves Search Everywhere accuracy and reduces schema overclaims | Medium if shipping/return/payment schema is changed carelessly | SEO helpers/tests only if scoped | Yes | SEO tests, content audit, build | Low/medium |
| B. Media derived image variants | Improves image performance and future vendor scale | Medium/high because upload/output behavior changes | Upload processing/storage behavior | Can happen before or after UI | image tests, browser image checks, build | Medium |
| C. Public storefront UI/UX redesign | Improves buyer experience visually | High because visual regressions need browser QA | Frontend only if scoped | After content/schema foundations | screenshots, browser smoke, build | High |
| D. Merchant feed readiness | Prepares product discovery surfaces | Medium/high because product data contracts matter | Potential export/feed helpers | After metadata/schema audit | feed tests, schema tests | High |
| E. Sitemap scaling/performance | Helps large catalog crawlability | Medium with DB-backed sitemap behavior | SEO route/performance behavior | Yes | sitemap tests, build, DB smoke | Medium |
| F. Buying-guide/collection pages | Adds useful crawlable content | Medium because owner facts are needed | New pages/routes/content | Before visual redesign if content is approved | content audit, route tests, build | High |
| G. Image alt text/admin content fields | Improves accessibility and image discovery | Medium if schema/forms change | Admin/product data behavior | Before UI polish | admin tests, DB-backed smoke | High |
| H. Product/category metadata completeness | Improves search snippets and AI answer clarity | Low/medium if no schema behavior change | SEO helpers and tests | Yes | SEO tests, content audit, build | Low |

## Recommended Next Batch

Recommended: Option A plus H as one bounded SEO/schema factual-alignment batch.

## Why

The content wording is now calmer, but JSON-LD and metadata still need a focused pass to ensure shipping, return, payment, organization, product, category, and social-preview claims match visible page facts. This is higher-impact and safer than a visual redesign or upload behavior change.

## Not Recommended Next

- Public storefront UI/UX redesign should wait until factual content/schema foundations are cleaner.
- Media derived variants should wait for a dedicated upload behavior step.
- Buying guides need owner-approved facts and content direction.
- Merchant feeds should wait until metadata/schema policies are tighter.

## Validation For Next Batch

- content audit;
- SEO policy tests;
- structured data tests;
- typecheck;
- lint;
- full tests;
- build;
- browser/manual smoke only if safe and non-mutating.
