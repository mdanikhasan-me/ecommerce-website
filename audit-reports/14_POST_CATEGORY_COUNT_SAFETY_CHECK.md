# Post Category Count Safety Check

Date: 2026-06-02

## Files changed

Files changed by the category product-count task:

- `src/app/(store)/page.tsx`
- `src/frontend/components/home/FeaturedCategories.tsx`
- `src/backend/catalog/category-product-counts.ts`
- `tests/category-product-counts.test.ts`
- `audit-reports/13_CATEGORY_PRODUCT_COUNT_UI_LOG.md`

File changed by this checkpoint:

- `audit-reports/14_POST_CATEGORY_COUNT_SAFETY_CHECK.md`

Step 1 security files touched by the category product-count task: no.

Step 1 security files remain modified in the working tree from the prior Step 1 task, but they were not changed for the category product-count task.

Pre-existing unrelated working tree changes still visible:

- `public/assets/categories/beauty-health.jpg`
- `public/assets/categories/books-stationery.jpg`
- `public/assets/categories/electronics.jpg`
- `public/assets/categories/fashion.jpg`
- `public/assets/categories/sports-fitness.jpg`

## Whether Step 1 security fixes remain intact

Intact.

- Order confirmation PII remains protected in `src/app/(store)/order/[orderNumber]/confirmation/page.tsx`.
- The order confirmation page still calls `auth()`.
- Unauthenticated access still returns `notFound()`.
- Non-admin access still scopes the database query to `{ orderNumber, userId: session.user.id }`.
- Admin and super-admin access still uses the admin branch.
- No unauthenticated public order confirmation PII exposure was found.
- CSRF/Origin/Referer helper still exists at `src/backend/security/request-guard.ts`.
- Custom mutation API protection is still present through `protectMutationRequest(...)` imports/calls in buyer, account, auth registration, product view, and admin mutation routes.
- Image upload validation before Sharp still exists in `src/backend/admin/image-processing.ts` through `validateImageUploadPayload(...)`, byte limits, MIME allowlist, metadata probing, decoded pixel limits, and safe errors.
- Admin audit log failures are still observable through sanitized `console.error('Admin audit log write failed', ...)` logging in `src/backend/admin/admin-utils.ts`.
- Rate limiter hardening still exists in `src/backend/security/rate-limit.ts`, including sanitized client identifiers, bucket pruning, max bucket cap, and rate-limit response headers.

## Whether category product counts are real dynamic counts

Yes.

The homepage loads active top-level categories server-side in `src/app/(store)/page.tsx`, then calls `getVisibleCategoryProductCounts(...)`.

`src/backend/catalog/category-product-counts.ts` calculates counts with one Prisma `product.groupBy({ by: ['categoryId'] })` query across visible parent categories and their active direct children.

## Whether any fake/hardcoded counts exist

No fake or hardcoded category product counts were found.

Source search found no static strings like `128 products` or `productCount: 128` in the app/backend/test implementation. The examples in `audit-reports/13_CATEGORY_PRODUCT_COUNT_UI_LOG.md` are documentation examples only.

## Product visibility exclusions

The count query includes only:

- `Product.isActive: true`
- active category relation
- approved seller relation: `Seller.status: APPROVED`

The current product schema does not include separate product draft, deleted, hidden, rejected, or approved fields. Seller approval exists and is included.

## Performance risk

Low.

The category count implementation adds one grouped database count query to the homepage data path. It does not introduce N+1 queries, per-card API calls, client-side fetching, or full product-list fetching for counts.

The homepage still uses its existing `revalidate = 300` cache window.

## Visual change summary

The only category-card visual change is a small near-white count line directly below each category name in the existing bottom-left overlay.

The existing card layout, image style, rounded corners, gradient overlay, arrow button, links, hover behavior, spacing, and responsive grid structure were preserved.

Mobile/tablet/desktop layout was source-inspected for obvious breakage. Browser screenshot testing was not run during this checkpoint.

## Accessibility notes

Counts are normal text inside the existing category link and are available to screen readers.

The arrow icon remains decorative inside the same link, and category card click/keyboard behavior remains unchanged.

## Validation commands run

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

## Validation results

- Typecheck: passed.
- Lint: passed with no warnings or errors. `next lint` printed its upstream deprecation notice for Next.js 16.
- Tests: passed, 98 tests across 23 suites.
- Production build: passed. Next.js compiled successfully, checked types, collected page data, generated 75 static pages, and finalized route optimization.

## Production build result

Passed.

The build output included `/` as a statically prerendered route with 5 minute revalidation and `/order/[orderNumber]/confirmation` as a dynamic route.

## Remaining risks

- Category counts include active direct child categories only. If deeper category nesting is introduced later, counts should be extended to all descendants.
- Counts are stricter than some existing storefront product queries because counts require approved sellers. This is appropriate for buyer-visible approved counts, but product list filters should be aligned before enabling third-party seller marketplace routes.
- Homepage counts can lag product changes by the existing 300-second revalidation window.
- Browser screenshot testing was not run; responsive behavior was checked by source inspection and successful production build only.

## Safe to proceed

Yes.

It is safe to proceed to the next roadmap step, with the existing constraints still in place: do not enable seller marketplace, online payment, tracking, or broader SEO/performance work until their prerequisites are explicitly handled.
