# Step 171 - Search Everywhere Optimization Audit

## Scope

This loop audited readiness for Google, Bing, AI answer systems, social previews, image discovery, and product surfaces.

Created:

- `docs/SEO_SEARCH_EVERYWHERE_STRATEGY.md`

## References

- Google product structured data: https://developers.google.com/search/docs/appearance/structured-data/product
- Google merchant listing structured data: https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
- Google ecommerce SEO: https://developers.google.com/search/docs/specialty/ecommerce
- Google image SEO: https://developers.google.com/search/docs/appearance/google-images
- Google helpful content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google robots.txt: https://developers.google.com/search/reference/robots_txt
- Next.js Image: https://nextjs.org/docs/app/api-reference/components/image

## Current Strengths

- Canonical URL helper uses the future public domain.
- Product metadata and category metadata helpers exist.
- Product JSON-LD includes Product and Offer with BDT price.
- Product pages render Breadcrumb JSON-LD.
- Category pages render ItemList JSON-LD.
- Homepage renders Organization, WebSite, and OnlineStore JSON-LD.
- FAQ page renders FAQ JSON-LD.
- Search and faceted category pages are noindex-aware.
- Robots disallows private/admin/API routes and exposes sitemap.
- Sitemap includes static pages plus active products/categories.

## Main Gaps

- Some metadata uses "best prices" wording that should be made factual.
- Product descriptions depend heavily on seed/admin text quality.
- Product structured data could be expanded with brand, GTIN/MPN, richer return/shipping fields, and variant policy once accurate data exists.
- Category pages need stronger unique intro copy by category.
- No merchant feed readiness implementation exists yet.
- No buying-guide or brand/collection content system exists yet.
- Dynamic sitemap may need partitioning at scale.

## Search Everywhere Meaning For Boilabin

Search readiness should cover:

- Google Search and Images;
- Google Lens/product discovery;
- Bing;
- AI browsing and answer systems;
- social previews;
- merchant/product feeds.

## AI/Search Content Conclusion

Factual, crawlable, structured content is more valuable than broad "trusted/premium" claims. Boilabin needs pages that state what products are sold, where they are available, how checkout works, and what shipping/returns apply.

## Recommended First Implementation

After media upload hardening, improve content-quality guardrails and product/category metadata copy. Then add structured-data completeness only where page-visible facts support it.
