# Performance Audit

Performance score: 72/100.

## Top 25 Bottlenecks

1. Category effective-price sorting fetches all matching products before slicing. Evidence: E017.
2. Search effective-price sorting fetches all matching products before slicing. Evidence: E018.
3. Production build/bundle output not verified. Evidence: E035.
4. No Lighthouse/Core Web Vitals/browser measurements run. Evidence: E045.
5. Home page performs multiple parallel product/category/banner queries. Evidence: E015.
6. Product page combines product/review/distribution/related/auth-dependent DB work. Evidence: E016.
7. Sitemap queries all active products/categories without pagination. Evidence: E012.
8. Image upload Sharp work can be CPU-heavy for large uploads. Evidence: E027.
9. In-memory rate limiter can grow and is per process. Evidence: E008.
10. Admin report CSV can query full product/customer sets. Evidence: E030.
11. No bundle analyzer script detected. Evidence: E001.
12. Multiple font families/weights should be measured. Evidence: E015.
13. Cart/wishlist/compare client stores need hydration/large-cart checks. Evidence: E058.
14. No CDN/cache runtime verification. Evidence: E055.
15. No server timing/observability instrumentation found. Evidence: E042.
16. Category effective-price sorting fetches all matching products before slicing. Evidence: E017.
17. Search effective-price sorting fetches all matching products before slicing. Evidence: E018.
18. Production build/bundle output not verified. Evidence: E035.
19. No Lighthouse/Core Web Vitals/browser measurements run. Evidence: E045.
20. Home page performs multiple parallel product/category/banner queries. Evidence: E015.
21. Product page combines product/review/distribution/related/auth-dependent DB work. Evidence: E016.
22. Sitemap queries all active products/categories without pagination. Evidence: E012.
23. Image upload Sharp work can be CPU-heavy for large uploads. Evidence: E027.
24. In-memory rate limiter can grow and is per process. Evidence: E008.
25. Admin report CSV can query full product/customer sets. Evidence: E030.

## Fixes That Preserve Visual Quality

1. Move effective-price sort to DB/materialized effectivePrice. Evidence: E017, E018.
2. Run approved build/bundle/Lighthouse. Evidence: E035, E045.
3. Paginate sitemap or add sitemap index. Evidence: E012.
4. Add CDN/cache/observability outside visual layer. Evidence: E055.
5. Add query timing for search/category/product/order/report. Evidence: E017-E019, E030.
6. Harden upload limits. Evidence: E027.

## Fixes With Visual Risk

1. Image quality changes can affect product media; measure first. Evidence: E016, E027.
2. Font-family/weight reductions can change brand feel. Evidence: E015.
3. Product card ratio/hover changes risk visual regressions. Evidence: E016.

## Measurement Gaps

1. Production build output and route compilation were not verified because build writes .next outside audit-reports. Evidence: E035.
2. Browser/mobile visual checks, accessibility scans, and Core Web Vitals were not run. Evidence: E045, E054.
3. Deployment provider settings, CDN behavior, production secret stores, and real cache headers were not verified. Evidence: E055.
4. No E2E buyer/seller/admin/super-admin browser journey was executed. Evidence: E044, E054.

## Benchmark Plan

1. Capture Lighthouse for home, category, search, product, checkout, admin dashboard after approval.
2. Add query timing around listing, product detail, order create, report export.
3. Track LCP element source for home hero and product hero.
