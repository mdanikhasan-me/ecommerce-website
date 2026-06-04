# Step 228 - Sitemap, Robots, And Noindex Verification Plan

## Scope

Reviewed sitemap, robots, and noindex verification without changing behavior.

## Local Checks

- `src/app/robots.ts` exposes sitemap and blocks private/admin/API routes.
- `src/app/sitemap.ts` includes static pages and DB-backed active products/categories.
- SEO tests assert private/utility exclusions and noindex behavior for search/faceted pages.

## Hosted Checks Later

- Fetch `/robots.txt`.
- Fetch `/sitemap.xml`.
- Confirm staging is not submitted or indexable.
- Confirm production sitemap uses production domain.
- Confirm private/admin/API/account/cart/order routes are not in sitemap.
- Confirm search/faceted pages expose noindex where expected.

## Future Scale Risks

- Large product catalog may require sitemap indexes.
- Product/category last-modified policy may need tightening.
- DB-backed sitemap performance should be measured before large launch.

## Result

Current source policy is sound for prelaunch, with scaling work deferred.
