# AI-Generated Code Cleanup Audit

The codebase has real structure, validators, SEO helpers, and admin operations. Cleanup focus: drift, shims, logging, broad catches, marketplace/payment boundaries.

## Cleanup Priority List

1. Remove temporary Prisma any delegate shim after regenerating Prisma client. Evidence: E041.
2. Replace swallowed audit logging catch with observable failure handling. Evidence: E029.
3. Clean production console logging into structured logging. Evidence: E042.
4. Align README seller claims and dependency list with package.json/routes. Evidence: E031, E039.
5. Move next lint script to ESLint CLI before Next 16. Evidence: E033.
6. Review any usage in admin/wishlist/checkout/upload handlers. Evidence: E042.
7. Avoid seed script printing demo credentials. Evidence: E040.
8. Deduplicate admin requireAdminSession definitions. Evidence: E007, E026.
9. Create payment webhook contract types before live gateways. Evidence: E021, E043, E050.
10. Add seller-mode feature flag behavior around absent seller UI. Evidence: E031.
11. Add metadata/JSON-LD tests. Evidence: E011, E014, E044.
12. Add CSRF/origin helper. Evidence: E060.
13. Add upload validation helper. Evidence: E027.
14. Add typed permission matrix. Evidence: E006, E007, E028, E031.
15. Replace effective-price post-sort with persisted/queryable strategy. Evidence: E017, E018.
16. Add route crawler/E2E tests. Evidence: E044, E054.
17. Keep visual components stable while moving security fixes behind existing UI. Evidence: E016, E020.

## Safe Refactor Roadmap

1. Security-preserving cleanup: CSRF/origin, distributed rate limiting, upload validation, audit logging (E008, E027, E029, E060).
2. Contract cleanup: remove Prisma shim, permission matrix, payment webhook contracts (E041, E043).
3. SEO/performance cleanup: metadata tests, effective-price sort, sitemap monitoring (E011, E017, E018, E056).
4. Documentation cleanup: README/package drift (E031, E039).

## Risky Refactor Warnings

- Do not refactor product card/detail visuals while fixing SEO/security without screenshots (E016).
- Do not enable online payments until gateway initiation/callback/webhook/reconciliation exist (E021, E043, E050).
- Do not enable SELLER access until seller-owned APIs/dashboards exist (E031, E026).
