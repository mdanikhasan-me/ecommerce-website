# Step 219 - Staging Search Verification Official Research

## Scope

Recorded official references for staging/search verification readiness. No external account workflow was opened, and no verification/submission was performed.

## Official References

| Area | Official reference | Boilabin implication |
| --- | --- | --- |
| Search Console ownership | Google Search Console Help, Verify your site ownership: https://support.google.com/webmasters/answer/9008080 | Boilabin needs hosted/DNS or supported verification access before claiming Search Console ownership. |
| URL Inspection | Google Search Console Help, URL Inspection tool: https://support.google.com/webmasters/answer/9012289 | URL Inspection requires a Search Console property and fully qualified URL. It is blocked until hosting/ownership exists. |
| Recrawl and sitemap | Google Search Central, Ask Google to recrawl your website: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl | Sitemap submission and URL inspection are future production-domain actions, not local tasks. |
| Sitemaps | Google Search Central, Build and submit a sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap | Local source/tests can check sitemap behavior; submission waits for production. |
| Large sitemaps | Google Search Central, Manage sitemaps with sitemap index files: https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps | Future large catalog may need sitemap indexes and batching. |
| Robots/noindex | Google Search Central, Robots meta tag: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag | Page-level noindex must be verified separately from robots allow/disallow behavior. |
| Structured data/rich results | Google Search Central structured data docs: https://developers.google.com/search/docs/appearance/structured-data and Rich Results Test help: https://support.google.com/webmasters/answer/7445569 | Rich-result eligibility should be tested later on hosted public pages; validation does not guarantee display. |
| Merchant data | Google Merchant Center product data specification: https://support.google.com/merchants/answer/7052112 | Feed requires product IDs, titles, descriptions, image links, price, availability, identifiers, shipping, and policy alignment. |
| Merchant images | Google Merchant Center image link requirements: https://support.google.com/merchants/answer/14779112 | Product feed image URLs must be stable, crawlable, and actual product images. |
| Google image SEO | Google Search Central Image SEO: https://developers.google.com/search/docs/appearance/google-images | Image discovery depends on crawlable pages, useful context, and image accessibility. |
| AI features | Google Search Central AI features and your website: https://developers.google.com/search/docs/appearance/ai-features | Normal search fundamentals remain relevant; no AI-only shortcut should be claimed. |
| Core Web Vitals | Google Search Central Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals and Search Console CWV report: https://support.google.com/webmasters/answer/9205520 | Local/lab checks do not equal Search Console field data. Hosted traffic is needed later. |
| PageSpeed Insights | Google PageSpeed Insights docs: https://developers.google.com/speed/docs/insights/v5/about | PSI can be used later against hosted pages for lab and field performance signals. |
| Bing URL Inspection | Bing Webmaster Tools URL Inspection: https://www.bing.com/webmasters/help/URL-Inspection-55a30305 | Bing inspection requires the site in Bing Webmaster Tools. |
| Bing sitemaps | Bing Webmaster Tools Sitemaps: https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed | Production sitemap submission waits for verified site. |
| Bing URL submission/IndexNow | Bing URL Submission: https://www4.bing.com/webmasters/help/url-submission-62f2860b | IndexNow is a future owner-approved implementation, not incidental setup. |
| Next.js env vars | Next.js environment variables: https://nextjs.org/docs/14/pages/building-your-application/configuring/environment-variables | `NEXT_PUBLIC_*` values are bundled for browser use; secrets must stay server-side/provider-managed. |
| Open Graph | The Open Graph protocol: https://ogp.me/ | Social previews depend on public metadata and image URLs; final checks need hosted URLs. |

## Practical Implications

- Local verification can cover build, source policy, tests, scanner, metadata helpers, robots source, sitemap source, and documentation readiness.
- Hosted staging can verify rendered routes and search surfaces, but staging must not be indexed or submitted.
- Production verification requires the real domain, account ownership, public crawlability, and manual evidence collection.
- Merchant feed submission, Search Console/Bing ownership, URL submission, Core Web Vitals field data, and AI answer behavior must wait.
