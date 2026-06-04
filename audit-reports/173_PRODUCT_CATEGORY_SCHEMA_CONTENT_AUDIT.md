# Step 173 - Product Category Schema Content Audit

## Scope

This loop audited product/category SEO content and schema without rewriting content.

## Product Metadata

`generateProductMetadata` creates:

- title;
- description;
- keywords;
- canonical URL;
- Open Graph data;
- Twitter card data;
- robots policy.

Risk: fallback copy uses "secure checkout", "fast delivery", and price wording that should match real operational capability.

## Category Metadata

`generateCategoryMetadata` creates:

- category title;
- description;
- keywords;
- canonical URL;
- Open Graph data;
- noindex support for faceted pages.

Risk: fallback copy uses "best prices" and generic "wide selection" wording.

## JSON-LD

Current structured data includes:

- Product with Offer;
- shipping details;
- merchant return policy;
- aggregate rating;
- reviews;
- BreadcrumbList;
- Organization;
- WebSite;
- OnlineStore;
- FAQPage;
- ItemList for category pages.

## Content Gaps

- Category intro copy is optional and can be missing.
- Product descriptions depend on admin/seed quality.
- Brand pages do not exist yet.
- Buying-guide pages do not exist yet.
- Product variant schema policy is not defined.
- SKU sensitivity remains policy-gated for admin export, but product page SKU display/schema policy also needs owner review.

## Open Graph And Social

Product pages use primary product images when available. The site has a generated Open Graph image fallback.

Risk: remote or stale images can weaken social previews and image search consistency.

## Canonical/Noindex

Current canonical/noindex behavior is strong:

- product pages canonicalize to `/products/[slug]`;
- base category pages are indexable;
- faceted category pages are noindex;
- search pages are noindex;
- private routes are blocked/noindexed by policy.

## Recommended Content System

Add structured content fields or conventions for:

- category intro copy;
- category buying advice;
- brand/collection pages;
- product buying guides;
- search-intent landing pages;
- factual summaries for AI answer systems;
- human-written content review rules.

## Recommendation

Do not rewrite all product/category content blindly. Start with content-quality guardrails, then improve metadata fallbacks and category copy in a scoped implementation batch.
