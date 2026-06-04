# Step 174 - Multi-Vendor Scale Performance Risk Audit

## Scope

This loop reviewed system-level scale risks for a future marketplace. No database or schema changes were made.

## Building Analogy

Do not only patch one room. A marketplace needs plumbing, wiring, storage, and load-bearing structure. One slow query or one careless upload rule can affect thousands of pages later.

## Product Count Growth

Product lists currently use pagination and selected includes, which is good. Risk grows around sorting by effective price, broad searches, homepage multiple product queries, and sitemap generation.

## Vendor Count Growth

Seller models exist, but full seller marketplace behavior is paused. Future vendor onboarding needs permissions, media quotas, product review flows, moderation, and abuse controls.

## Image Count Growth

The largest near-term risk is image volume. Product images, variants, thumbnails, detail images, banners, category images, cache variants, backups, and CDN copies multiply quickly.

## Variant Count Growth

Variant count can create admin form complexity and product detail page payload growth. Current admin product payload allows up to 100 variants and 20 images.

## Search/Category Pagination

Search/category pages use skip/take and count queries. At larger scale, this may need indexes, cursor pagination for some surfaces, search-specific infrastructure, or precomputed facets.

## Sorting/Filtering Cost

Effective-price sorting currently fetches IDs for price sorting before loading the page subset. This is acceptable at small scale but should be reviewed before large catalogs.

## Sitemap Scaling

Current sitemap collects all eligible products and categories in one route. At marketplace scale, it should be split into sitemap indexes by type/date/range.

## Homepage Sections

Homepage uses multiple concurrent product/category/banner queries. This is manageable now but should eventually use caching and operational limits.

## Admin Tables

Admin product/order/user/report pages need pagination, filters, and indexes before real growth. Export routes need permission and audit decisions before wider production use.

## Upload Storage

Local filesystem upload storage is not a production multi-vendor strategy. Object storage, CDN, quotas, lifecycle cleanup, and variant generation should be designed before production vendor uploads.

## Image Optimization Cost

Next/Image optimization and Sharp transforms have CPU/storage/cache cost. AVIF can reduce size but may cost more CPU. Measure before enabling expensive conversions everywhere.

## Database Index Readiness

No DB schema changes were made. Future index review should happen with real query plans after local/staging DB readiness.

## Build-Time Risk

Static generation touches DB-backed pages and sitemap data. Build and cache strategy must be designed around DB availability and product count growth.

## Product Feed Risk

Merchant feed generation can become heavy if it reads all products/images at once. It should be incremental or batched.

## Recommendation

Handle media/upload scale first, then sitemap/feed scaling, then DB query/index review when DB-backed QA is approved.
