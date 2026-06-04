# Step 202 - Search Everywhere Official Research Notes

## Scope

This report records official references inspected before changing Boilabin schema, metadata, social preview, or Search Everywhere guardrails.

## Official References

| Area | Official reference | Notes for Boilabin |
| --- | --- | --- |
| Product structured data | Google Search Central Product structured data: https://developers.google.com/search/docs/appearance/structured-data/product | Product structured data can help Google understand price, availability, reviews, images, and product facts. Product markup should describe the product page and should not invent product identifiers, brands, ratings, or policies. |
| Merchant listings | Google Search Central Merchant listing structured data: https://developers.google.com/search/docs/appearance/structured-data/merchant-listing | Merchant listing enhancements support shipping and return policy markup, but shipping and returns need accurate policy facts. If shipping/returns are incomplete or changing, Merchant Center/Search Console account-level settings may be better later. |
| Structured data policy | Google Search Central General structured data guidelines: https://developers.google.com/search/docs/appearance/structured-data/sd-policies | Structured data must follow content and spam policies. Correct markup is not a guarantee of rich result display. Boilabin should prioritize factual page-aligned schema. |
| Image SEO | Google Search Central Image SEO best practices: https://developers.google.com/search/docs/appearance/google-images | Images need crawlable pages, useful landing pages, descriptive context, and stable image discovery. This batch does not change media assets. |
| AI features | Google Search Central AI features and your website: https://developers.google.com/search/docs/appearance/ai-features | Google says normal SEO fundamentals remain relevant for AI features. There are no special AI-only optimizations required. |
| Helpful content | Google Search Central Creating helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content | Page titles and content should avoid exaggeration and serve people first. This supports removing hype from schema/social surfaces. |
| AI-generated content | Google Search Central Blog guidance on AI-generated content: https://developers.google.com/search/blog/2023/02/google-search-and-ai-content | Google focuses on content quality rather than production method. Automation used to manipulate rankings is risky. Boilabin should keep factual owner-approved content. |
| Next.js metadata | Next.js Metadata and Open Graph image docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image | File-based Open Graph image routes can export `alt`, `size`, and `contentType`. Social preview copy should match page facts because it appears when links are shared. |
| Next.js JSON-LD | Next.js JSON-LD guide: https://nextjs.org/docs/app/guides/json-ld | Next recommends rendering JSON-LD in pages/layouts and validating with Rich Results Test or Schema Markup Validator. Payloads should be sanitized when dynamic strings are used. |
| Schema.org | Schema.org Product and Offer: https://schema.org/Product and https://schema.org/Offer | Schema.org defines vocabulary; Google eligibility still depends on Google guidance and page-aligned facts. |

## Practical Implications For Boilabin

- Keep Product, Offer, Breadcrumb, FAQ, Organization, WebSite, OnlineStore, and ItemList schema where they map to current pages/data.
- Keep data-driven price, availability, URL, image, category, SKU, reviews, and aggregate rating fields when inputs exist.
- Do not add GTIN, MPN, official brand relationships, authenticity guarantees, seller marketplace claims, online payment provider claims, or customer/review counts without source data.
- Shipping schema should not publish exact handling/transit timing unless the visible policy supports the same facts.
- Return schema can use the seven-day return window only because the visible FAQ already states that policy.
- Do not publish a return method such as mail return unless visible policy clearly supports that method.
- Social preview text should describe the site factually and avoid authenticity, guarantee, speed, or vague trust claims.
- Merchant feed readiness should remain a future planning item until product identifiers, image policy, price/availability sync, shipping, and return rules are operationally approved.

## What Not To Implement In This Batch

- No Merchant Center feed.
- No shipping account settings.
- No online payment gateway claims.
- No GTIN/MPN/brand enrichment.
- No AI-specific hidden content.
- No image asset or media upload changes.
- No sitemap scaling changes.
- No Search Console/Bing verification setup.
