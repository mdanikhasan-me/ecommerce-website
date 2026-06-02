# Step 3 No-Visual Performance and Stability Fix Log

Date: 2026-06-02

## Files Changed

- `src/backend/auth/host.ts`
- `src/backend/auth/config.ts`
- `tests/auth-host.test.ts`
- `src/app/(store)/auth/login/page.tsx`
- `src/frontend/components/auth/LoginForm.tsx`
- `src/app/(store)/checkout/page.tsx`
- `src/frontend/components/checkout/CheckoutClient.tsx`
- `src/app/(store)/layout.tsx`
- `src/frontend/components/cart/LazyCartDrawer.tsx`
- `src/backend/catalog/product-price-filter.ts`
- `src/app/(store)/category/[slug]/page.tsx`
- `src/app/(store)/search/page.tsx`
- `src/app/api/products/route.ts`
- `tests/product-price-filter.test.ts`
- `audit-reports/16_STEP_3_NO_VISUAL_PERFORMANCE_FIX_LOG.md`

No Step 1 security files were modified in this step. The order confirmation privacy fix, mutation request guard, upload hardening, audit logging, and rate limiter hardening were not edited.

## Exact Issues Fixed

1. Auth host configuration hardening:
   - Added `src/backend/auth/host.ts` to centralize Auth.js host trust decisions and sanitized configuration warnings.
   - `authConfig` now sets `trustHost` through the helper.
   - Local production verification can trust local origins such as `localhost` and `127.0.0.1` without requiring the temporary Step 2 override.
   - Custom staging/production hosts still require explicit `AUTH_TRUST_HOST=true` or a managed-host signal instead of blindly trusting unknown production hosts.
   - `AUTH_SECRET` is accepted before falling back to `NEXTAUTH_SECRET`.

2. Login/checkout CLS:
   - `/checkout` now performs the unauthenticated redirect server-side with `auth()` and `redirect(...)`.
   - The checkout form was moved unchanged into `CheckoutClient`.
   - `/auth/login` now resolves `callbackUrl` and `reason` server-side and passes them to `LoginForm`.
   - The login page no longer depends on an empty client Suspense shell for `useSearchParams`.

3. Homepage main-thread work:
   - The off-canvas cart drawer was moved behind `LazyCartDrawer`.
   - The cart drawer bundle is deferred until the drawer is opened or there are persisted cart items.
   - Header cart buttons and the drawer component's visual implementation were not changed.

4. Search/category/API effective-price sorting:
   - `price_asc` and `price_desc` no longer load full product records with images/categories for every match before slicing.
   - The listing path now loads only `{ id, basePrice, salePrice }` for the matching set, selects the requested page of sorted IDs, then fetches full product records only for those visible IDs.
   - Final product order is restored to the sorted ID order.

5. Category product-count efficiency:
   - Confirmed the category product-count implementation remains grouped and server-side through `getVisibleCategoryProductCounts(...)`.
   - No client-side category count fetches, per-card API calls, or N+1 count queries were added.

## Performance and Stability Risks Reduced

- Local `UntrustedHost` failures are less likely during local production/staging verification.
- Checkout-to-login no longer waits for a client session check before redirecting.
- Login page no longer starts from an empty Suspense fallback for query-param handling.
- Search/category/API price sorting now avoids fetching full product payloads and primary images for rows that will not be displayed.
- Initial storefront layout no longer includes the full cart drawer component until it is needed.

## Before/After Metrics

Formal Lighthouse was still unavailable without installing packages. Metrics below are the same Chrome DevTools Protocol style synthetic measurements used in Step 2: mobile viewport, CPU throttling, and slow 4G-style network approximation.

| Route | Step 2 Before | Step 3 After | Result |
|---|---:|---:|---|
| `/checkout` to login CLS | 0.320 | 0 | Improved |
| `/checkout` to login LCP | 576 ms | 648 ms | Similar |
| `/` homepage cold TBT proxy | 454 ms | 846 to 859 ms | Not improved in cold sample |
| `/` homepage warm TBT proxy | Not recorded | 0 ms on repeat runs 2 and 3 | Warm repeat was clean |
| `/` homepage cold LCP | 960 ms | 1180 to 1240 ms | Slightly worse in cold sample |
| `/category/electronics` TBT proxy | 128 ms | 9 ms | Improved |
| `/category/electronics` LCP | 1720 ms | 2640 ms | Worse in this synthetic sample |
| `/search?q=sony&sort=popular` LCP | 2296 ms | 1580 ms | Improved |
| `/search?q=sony&sort=popular` TBT proxy | 28 ms | 0 ms | Improved |
| Product detail LCP | 1928 ms | 1616 ms | Improved |
| Product detail TBT proxy | 76 ms | 28 ms | Improved |

Metric confidence: medium-low. The browser checks are real Chrome, but they are not Lighthouse, not field data, and one-run cold measurements are noisy.

## Whether Login/Checkout CLS Improved

Yes.

The low-end `/checkout` unauthenticated redirect now landed on `/auth/login?callbackUrl=/checkout&reason=checkout` with:

- CLS: `0`
- console errors: `0`
- runtime exceptions: `0`

The Step 2 value was approximately `0.320`.

## Whether Homepage TBT Risk Improved

Partially, but not conclusively.

The off-canvas cart drawer is now deferred, which reduces unnecessary initial component work. However, the cold homepage synthetic run still showed high TBT proxy values around `846` to `859` ms, worse than the Step 2 single cold sample. Warm repeat navigations dropped to `0` ms TBT proxy.

Conclusion: a small safe fix was made, but homepage cold main-thread work remains a top risk. The next no-visual performance pass should split or reduce product-card/header hydration more directly.

## Whether Search/Category Performance Risk Improved

Yes for effective-price sort payload size; partially for measured route performance.

- `price_asc` and `price_desc` now avoid fetching all matching products with images/categories before slicing.
- `/search?q=sony&sort=price_asc`, `/category/electronics?sort=price_asc`, and `/api/products?q=sony&sort=price_asc&limit=4` all returned 200 in local production smoke checks.
- This is still not the final database-level fix. The app still sorts matching ID/price rows in memory. A production-grade fix should add a database-supported effective-price field or expression index after schema/index approval.

## Whether Auth Host Configuration Risk Was Reduced

Yes.

After the change, local production `next start -p 3100` served `/api/auth/session` with status `200` and body `null` without the temporary `AUTH_TRUST_HOST=true` override used in Step 2.

Remaining deployment requirement: custom staging/production hosts must still set canonical auth URL values and explicitly enable trusted host behavior when behind trusted proxies.

## Image Optimization Audit and Safe Fixes

- Existing homepage/category/product images already use `next/image`, fixed aspect-ratio containers, and lazy loading by default unless marked `priority`.
- No image quality changes were made because that has visual risk.
- No broad `sizes` rewrite was made because product cards are reused across grids with different column counts; a correct fix should pass route-specific image sizes in a dedicated visual QA pass.
- The category product-count UI did not add image requests.
- Image-heavy pages remain a performance risk for slow Bangladeshi mobile networks.

## Tests Added or Updated

- Added `tests/auth-host.test.ts`.
- Added `tests/product-price-filter.test.ts`.

## Validation Commands Run

- `npx tsx --test tests/auth-host.test.ts tests/product-price-filter.test.ts`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check` on Step 3 files
- Local production server start with `node node_modules/next/dist/bin/next start -p 3100`
- `Invoke-WebRequest http://127.0.0.1:3100/api/auth/session`
- Chrome DevTools Protocol checks for:
  - `/`
  - `/category/electronics`
  - `/search?q=sony&sort=popular`
  - `/products/sony-playstation-5-dualsense-wireless-controller-monster-hunter-wilds-limited-edition`
  - `/checkout`
- Price-sort smoke checks:
  - `/search?q=sony&sort=price_asc`
  - `/category/electronics?sort=price_asc`
  - `/api/products?q=sony&sort=price_asc&limit=4`

## Validation Results

| Command | Result |
|---|---|
| Focused tests | Passed; 7 tests |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed; Next.js lint deprecation notice only |
| `npm test` | Passed; 25 suites and 105 tests |
| `npm run build` | Passed |
| `git diff --check` | Passed; Git printed CRLF normalization warnings only |
| `/api/auth/session` local production check | Passed; status 200 without temporary auth-host override |
| CDP browser checks | Passed; no console errors, no runtime exceptions, no horizontal overflow on tested routes |
| Price-sort smoke checks | Passed; all three routes returned 200 |

## Production Build Result

Passed.

Build output still shows `/` at `3.66 kB` route size and `133 kB` first-load JS. `/checkout` first-load JS changed from the Step 2 build's `153 kB` to `150 kB`.

## Remaining Risks

- Homepage cold TBT remains high in synthetic measurement. A deeper no-visual pass should target product-card/header hydration and noncritical client widgets.
- Search/category effective-price sorting still happens in app memory over `{ id, basePrice, salePrice }` rows. A database-level effective-price column or expression index requires schema/index approval.
- Category LCP was worse in the Step 3 single synthetic sample, so category image/grid loading still needs repeat Lighthouse or real-device verification.
- `LazyCartDrawer` may add a tiny first-open delay for users with an empty cart because the drawer bundle is deferred until needed.
- Custom production/staging auth host configuration still needs correct environment values. The code now warns and handles local verification better, but it cannot infer every deployment proxy safely.
- No Lighthouse, WebPageTest, or real low-end phone verification was available without adding tooling.
- No image quality or route-specific `sizes` rewrite was made because that needs visual QA.

## Whether Visuals Changed

No.

The login form, checkout form, cart drawer, category cards, product cards, search/category grids, and homepage styling were not visually redesigned. Components were moved or deferred, but markup/classes for the intended UI were preserved.

## Exact Next Recommended Step

Proceed to technical SEO only after noting that homepage cold TBT remains a performance follow-up. Technical SEO can begin from a stability standpoint because Step 1 security, category counts, production build, and the Step 3 no-visual fixes all validate successfully.
