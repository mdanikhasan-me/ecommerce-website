# Step 6 Product Lifecycle and Public Visibility Log

Date: 2026-06-02

## Files Changed

- `src/backend/catalog/product-visibility.ts`
- `src/backend/catalog/category-product-counts.ts`
- `src/backend/seo/structured-data.ts`
- `src/app/sitemap.ts`
- `src/app/(store)/products/[slug]/page.tsx`
- `src/app/(store)/category/[slug]/page.tsx`
- `src/app/(store)/search/page.tsx`
- `src/app/(store)/page.tsx`
- `src/app/(store)/deals/page.tsx`
- `src/app/(store)/new-arrivals/page.tsx`
- `src/app/api/products/route.ts`
- `src/app/api/products/[id]/view/route.ts`
- `src/app/api/search/suggestions/route.ts`
- `src/app/api/coupons/validate/route.ts`
- `src/app/api/orders/route.ts`
- `tests/product-visibility.test.ts`
- `audit-reports/19_STEP_6_PRODUCT_LIFECYCLE_VISIBILITY_LOG.md`

## Current Visibility Logic Map Before Editing

| Surface | Previous buyer-visible product rule |
|---|---|
| Product detail page | `slug` + `isActive: true`; did not require active category or approved seller |
| Related products | `categoryId`, not current product, `isActive: true` |
| Category page listing | `isActive: true` + category IDs + filters |
| Category metadata product count | direct category ID + `isActive: true` |
| Search page | `isActive: true`; text category resolver could match inactive categories |
| Product API | `isActive: true`; IDs/search/category/price filters layered on top |
| Product view API | product ID + `isActive: true` |
| Search suggestions API | product `isActive: true`; category resolver could match inactive categories |
| Sitemap product entries | `isActive: true`, active category, approved seller |
| Homepage category counts | `isActive: true`, active category, approved seller |
| Homepage featured/new/bestseller sections | `isActive: true` + section flags |
| Homepage flash sale products | active flash sale; product relation was not filtered by public visibility |
| Deals page | sale products used `isActive: true`; flash-sale products were not filtered by public visibility |
| New arrivals page | `isActive: true` + `isNew: true` |
| Coupon validation API | client product IDs could be matched without public visibility checks |
| Order creation API | product IDs required existing product and `isActive: true`; did not require active category or approved seller |
| Admin product queries | Admin-specific; intentionally left able to see/manage non-public products |

## Lifecycle Contract Implemented or Planned

Implemented now as a backend contract constant in `src/backend/catalog/product-visibility.ts`:

| Lifecycle state | Buyer visible | Sitemap eligible | Merchant feed eligible | SEO behavior |
|---|---:|---:|---:|---|
| `DRAFT` | No | No | No | Not public |
| `ACTIVE` | Yes | Yes | Yes | Indexable if category active and seller approved |
| `INACTIVE` | No | No | No | Not public; temporary 404/noindex behavior |
| `REJECTED` | No | No | No | Not public |
| `ARCHIVED` | No | No | No | Not public |
| `DISCONTINUED` | No | No | No | Future 410 or 301 to replacement |
| `DELETED` | No | No | No | Not public; soft-delete equivalent planned |

Important: the database still only has the legacy `Product.isActive` field. The richer lifecycle states are documented and test-covered as the intended contract, but not yet enforceable at the database level.

## Schema Changes Made

None.

Reason: `.env` contains a `DATABASE_URL` that was not clearly local. Applying an additive Prisma schema migration or `db push` could touch a non-local database, so schema changes were skipped for this step.

## Migration and Backfill Notes

No migration was run.

Recommended future additive migration once a safe local/staging database is confirmed:

- Add `ProductStatus` enum: `DRAFT`, `ACTIVE`, `INACTIVE`, `REJECTED`, `ARCHIVED`, `DISCONTINUED`, `DELETED`.
- Add `Product.status ProductStatus @default(ACTIVE)`.
- Add `Product.deletedAt DateTime?`.
- Add `Product.discontinuedAt DateTime?`.
- Backfill `status = INACTIVE` where `isActive = false`.
- Keep `isActive` temporarily for admin compatibility, then migrate admin UI/API onto `status`.
- Later add previous-slug and replacement-product support for 301/410 decisions.

## Centralized Visibility Helpers Added

Added `src/backend/catalog/product-visibility.ts`:

- `PRODUCT_LIFECYCLE_CONTRACT`
- `buyerVisibleProductBaseWhere`
- `andProductWhere(...)`
- `getBuyerVisibleProductWhere(...)`
- `getSitemapVisibleProductWhere(...)`
- `getPublicProductDetailWhere(slug)`
- `getLegacyProductLifecycleState(...)`
- `isProductBuyerVisible(...)`
- `getProductAvailabilityForJsonLd(...)`

Current buyer-visible rule:

- `product.isActive === true`
- `product.category.isActive === true`
- `product.seller.status === APPROVED`

Stock is intentionally not part of the visibility rule. Active out-of-stock products remain public and indexable.

## Public Surfaces Updated

Updated to use the shared visibility helper:

- Product detail page
- Related products
- Category page listing
- Category page metadata product count
- Search page listing
- Product API
- Product view API
- Search suggestions API
- Sitemap product entries
- Homepage category product counts
- Homepage featured products
- Homepage best sellers
- Homepage new arrivals
- Homepage pinned new/bestseller rotators
- Homepage flash-sale products
- Deals page sale products
- Deals page flash-sale products
- New arrivals page
- Coupon validation product eligibility
- Order creation product validation and transactional stock decrement

Admin product queries were intentionally not converted to the buyer-visible helper, so admin can still see/manage inactive or non-public products.

## SEO Behavior for Each Lifecycle State

| State | Current implementation with legacy schema | Intended SEO behavior |
|---|---|---|
| Active, in stock | Public only if `isActive`, category active, seller approved | 200, index/follow, Product JSON-LD `InStock`, sitemap eligible |
| Active, out of stock | Public only if `isActive`, category active, seller approved | 200, index/follow, Product JSON-LD `OutOfStock`, sitemap eligible |
| Draft | Not represented in DB yet | Not public, no sitemap, no Merchant feed |
| Rejected | Not represented in DB yet | Not public, no sitemap, no Merchant feed |
| Inactive/admin-unpublished | `isActive: false` maps to legacy `INACTIVE` contract | Not public, no sitemap, current behavior is 404/not found |
| Archived | Not represented in DB yet | Not public, no sitemap |
| Discontinued | Contract documented; DB state not present | Future 410 if permanent and no replacement, or 301 if replacement exists |
| Deleted/soft-deleted | Not represented in DB yet | Not public, no sitemap, preserve history with `deletedAt` after schema step |

## Tests Added or Updated

Added `tests/product-visibility.test.ts` covering:

- Lifecycle contract state behavior.
- Shared buyer-visible base filter.
- Sitemap and product-detail filters using the same policy.
- Loaded product visibility evaluation using product, category, and seller state.
- Out-of-stock JSON-LD availability.
- Discontinued JSON-LD availability mapping for the future lifecycle state.

Existing SEO and category count tests were also rerun.

## Validation Commands Run

- `npm run typecheck`
- `npx tsx --test tests/product-visibility.test.ts`
- `npx tsx --test tests/seo-policy.test.ts tests/category-product-counts.test.ts`
- `npx prisma validate`
- `npm run lint`
- `npm test`
- `npm run build`

## Validation Results

| Command | Result |
|---|---|
| `npm run typecheck` | Passed |
| Focused product visibility tests | Passed; 5 tests |
| Focused SEO/category-count tests | Passed; 12 tests |
| `npx prisma validate` | Passed |
| `npm run lint` | Passed; Next.js lint deprecation notice only |
| `npm test` | Passed; 27 suites, 119 tests |
| `npm run build` | Passed |

## Production Build Result

Passed.

Next.js compiled successfully, checked types, generated 75 static pages, and finalized route optimization.

## Remaining Risks

- Full lifecycle states are not database-enforced yet because no safe local database migration target was confirmed.
- `isActive` remains the legacy admin control, so `DRAFT`, `REJECTED`, `ARCHIVED`, `DISCONTINUED`, and `DELETED` need a future schema/admin workflow.
- No 410 Gone or 301 replacement/old-slug redirect system exists yet.
- Admin coupon and flash-sale product pickers still use admin-oriented `isActive` queries; this is acceptable for admin management but should be revisited once lifecycle statuses are added.
- Merchant Center feed remains intentionally unimplemented.
- Seller marketplace routes remain intentionally unimplemented.
- No visual browser regression pass was rerun because this step made no UI rendering changes.

## Whether Visuals Changed

No.

## Exact Next Recommended Roadmap Step

Confirm a safe local/staging database migration target, then add the additive product lifecycle schema (`ProductStatus`, `deletedAt`, `discontinuedAt`, and backfill rules) and update admin product controls to manage lifecycle status before Merchant Center, seller/store SEO, brand pages, or payment/tracking work.
