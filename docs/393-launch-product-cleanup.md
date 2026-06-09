# Step 393 Launch Product Cleanup

Date: 2026-06-09

## Summary

Removed the demo product catalog from the seed path, local database, source-controlled product media, and managed demo product uploads while keeping product infrastructure intact for future real admin-entered products.

The homepage fallback banner that showed the fake text `A warmer, calmer way to shop online in Bangladesh` was removed. If there are no active hero banners, the homepage now renders no fake hero instead of inventing storefront content.

## Product Cleanup

Removed or neutralized:

- Prisma seed demo product creation.
- Seeded demo product images, variants, specs, product-linked hero banners, and demo orders.
- Local product media manifest entries.
- Demo product media under `public/assets/products/**`.
- Managed demo uploads under `public/uploads/products/**`.
- Tests and scripts that depended on specific fake seeded product names.

Kept:

- Product routes, product detail page, product cards, search/category listing pages.
- Admin product list and create/edit flow source.
- Product image upload infrastructure and `/uploads/products/` policy support.
- Cart, wishlist, compare, checkout, order, invoice, category, seller, and admin infrastructure.

## Local DB Status

The local database was verified local before reset/seed cleanup. The cleaned local seed leaves no product or product-linked commerce records.

Before cleanup:

- Products: 19
- Product images: 19
- Product variants: 5
- Product specs: 14
- Product views: 42
- Demo orders: 3
- Demo order items: 3
- Product-linked banners: 1

After cleanup:

- Products: 0
- Product images: 0
- Product variants: 0
- Product specs: 0
- Product views: 0
- Cart items: 0
- Wishlist items: 0
- Compare items: 0
- Recently viewed rows: 0
- Reviews: 0
- Orders: 0
- Order items: 0
- Payments: 0
- Return requests: 0
- Banners: 0

Preserved seed baseline:

- Categories: 20
- Brands: 9
- Users: 2
- Sellers: 1
- Settings: 9
- Shipping zones: 4
- Coupons: 3
- Addresses: 1

## Media Cleanup

Deleted:

- `public/assets/products/**`
- `public/uploads/products/**`

Kept untouched:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- Category images, banners, payment logos, brand/logo assets, and UI icons outside the deleted demo product paths.

## Audit Archive

Repo-local audit reports were copied and verified before removal.

- Archive location: `../boilabin-audit-archive/audit-reports/`
- Pointer file: `docs/AUDIT_REPORTS.md`
- Archive file count: 1924
- Archive byte count: 153150924
- Repo-local `audit-reports/`: removed
- Proof manifests: `../boilabin-audit-archive/393-launch-product-cleanup/`

Screenshots and browser proof were saved outside the repo:

- `../boilabin-audit-archive/393-launch-product-cleanup/screenshots/`
- Captured homepage desktop, homepage mobile, category empty state, search empty state, new arrivals empty state, and unauthenticated admin products boundary.

## Validation

Passed:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm test` - 745 tests across 94 suites passed
- Focused product/media/runtime/advisor tests
- Old fake product name search across `prisma`, `src`, `scripts`, `tests`, and `docs`
- Local browser runtime smoke with Edge on `http://127.0.0.1:3121`

Browser smoke result:

- Homepage, categories, search, new arrivals, cart, track order, and removed routes rendered without console errors, server errors, broken images, product image preload spam, or horizontal overflow across mobile, tablet, and desktop viewports.
- Homepage HTML no longer contains `A warmer, calmer way` or `Start shopping`.
- Admin products route still exists and redirects unauthenticated users to login; product list and product creation source remain in place for authenticated admin use.

## Commit And Push

Commit message:

`chore: remove demo products and archive audit artifacts`

The exact pushed commit hash and push result are recorded in the final Codex handoff after this report is committed and pushed.
