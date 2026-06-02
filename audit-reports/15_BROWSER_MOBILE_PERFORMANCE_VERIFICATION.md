# Step 2 Browser, Mobile, and Performance Verification

Date: 2026-06-02

## Environment Used

- Workspace: `p:\Projects\E-commers\boilabin-marketplace`
- Runtime: Windows PowerShell, Node/Next local environment
- App mode: fresh local production build with `npm run build`, then local `next start -p 3100`
- Local-only auth overrides used for clean browser testing:
  - `AUTH_TRUST_HOST=true`
  - `NEXTAUTH_URL=http://127.0.0.1:3100`
- Browser: installed Google Chrome controlled through Chrome DevTools Protocol
- Mobile profile: 390 x 844 viewport, touch/mobile emulation, device scale factor 2.75
- Low-end simulation: Chrome CPU throttling rate 4 and slow 4G-style network approximation
- External services: no live payment, tracking, email, SMS, or production service calls were intentionally used
- Packages installed: none
- Code/UI changes in this step: none

## Commands Run

- `Get-Content` for the requested prior audit reports:
  - `audit-reports/00_EXECUTIVE_SUMMARY.md`
  - `audit-reports/08_PERFORMANCE_AUDIT.md`
  - `audit-reports/09_BUG_AND_FLOW_AUDIT.md`
  - `audit-reports/12_STEP_1_SECURITY_FIX_LOG.md`
  - `audit-reports/13_CATEGORY_PRODUCT_COUNT_UI_LOG.md`
  - `audit-reports/14_POST_CATEGORY_COUNT_SAFETY_CHECK.md`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- Local production server start with `node node_modules/next/dist/bin/next start -p 3100`
- HTTP route checks with PowerShell `Invoke-WebRequest`
- Browser route checks with Chrome DevTools Protocol
- Mobile and desktop screenshots through Chrome DevTools Protocol
- Synthetic low-end mobile measurements through Chrome DevTools Protocol

## Production-Like Startup Result

The first local production start from the existing `.next` artifact failed with a missing vendor chunk for `tailwind-merge`. A fresh `npm run build` regenerated the production artifacts and passed. After that rebuild, the production server started and served routes successfully.

The first clean route run also surfaced an Auth.js `UntrustedHost` issue because the local server was running on port 3100 while the environment expected another host. This was resolved for verification with local-only `AUTH_TRUST_HOST=true` and `NEXTAUTH_URL=http://127.0.0.1:3100`. This is not evidence of a category-count or Step 1 regression, but it is a deployment/configuration risk to keep on the launch checklist.

## Routes Tested

| Route | Exists | Render Result | Auth Behavior | Console/Runtime Errors | Mobile/Desktop Result | Visual Regression Risk |
|---|---:|---|---|---:|---|---|
| `/` | Yes | 200, rendered | Public | 0 after local auth fix | No horizontal overflow; category counts visible | Low |
| `/category` | Yes | 200, rendered | Public | 0 | No horizontal overflow | Low |
| `/category/electronics` | Yes | 200, rendered | Public | 0 | Product grid rendered; mobile chip row behaves like a horizontal strip | Medium |
| `/search?q=sony&sort=popular` | Yes | 200, rendered | Public | 0 | Search results route rendered | Medium |
| `/products/sony-playstation-5-dualsense-wireless-controller-monster-hunter-wilds-limited-edition` | Yes | 200, rendered | Public | 0 | Product detail rendered; very long title dominates mobile viewport | Medium |
| `/cart` | Yes | 200, rendered | Public/guest cart | 0 | Empty/guest cart UI rendered | Low |
| `/checkout` | Yes | Redirected to login in browser | Auth required before checkout | 0 | Login redirect rendered | Medium because login redirect showed high CLS in throttled run |
| `/auth/login` | Yes | 200, rendered | Public auth page | 0 | Login page rendered | Medium because desktop/login CLS was observed |
| `/account/profile` | Yes | HTTP 307 to login | Protected | 0 | Final browser page was login | Low |
| `/order/[known-order]/confirmation` | Yes route pattern, unauthorized request returned 404 | 404 page | Protected/no public PII | 0 | No PII exposed | Low |
| `/order/BLB-DOES-NOT-EXIST/confirmation` | Yes route pattern, missing order returned 404 | 404 page | No public PII | 0 | No PII exposed | Low |
| `/admin/dashboard` | Yes | HTTP 307 to login | Protected | 0 | Final browser page was login | Low for route guard; actual admin UI not verified unauthenticated |
| `/admin/products` | Yes | HTTP 307 to login | Protected | 0 | Final browser page was login | Low for route guard; actual admin table not verified unauthenticated |
| `/admin/categories` | Yes | HTTP 307 to login | Protected | 0 | Final browser page was login | Low for route guard; actual admin table not verified unauthenticated |
| `/seller/dashboard` | Missing/not implemented | 404 | Seller marketplace remains disabled | 0 | 404 rendered | Low, consistent with roadmap constraint |

## Browser and Mobile Verification Result

- Desktop and mobile browser smoke checks completed with real Chrome.
- No console errors or JavaScript exceptions were observed in the final clean route run.
- No page-level horizontal overflow was detected on tested mobile or desktop routes.
- Protected account/admin routes redirected to login instead of exposing protected content.
- Unauthorized order confirmation access returned a 404 page and did not expose delivery PII.
- Seller dashboard route was missing/404, which is consistent with keeping seller marketplace disabled until ownership routes exist.
- Screenshots were inspected for homepage, category detail, product detail, checkout/login redirect, and admin-login redirect.

## Category Product-Count Visual Check

- Homepage category cards showed real product counts under category names.
- Observed examples included:
  - `Electronics` with `18 products`
  - `Fashion` with `0 products`
  - `Home & Appliances` with `1 product`
  - `Sports & Fitness` with `1 product`
  - `Gaming` with `2 products`
- Counts were rendered as normal text, not CSS-only pseudo-content.
- The arrow buttons still fit in the cards.
- No measured overlap was detected between count/name text and the arrow controls.
- The homepage had 14 matching category card elements in the DOM because both desktop and mobile layouts are present, but only the appropriate breakpoint layout is visible.
- No layout shift attributable to the category count text was observed.

## Lighthouse and Core Web Vitals

Formal Lighthouse was not available in this repo/environment without installing a package. `lighthouse`, `playwright`, `puppeteer`, and local package equivalents were not present, and no packages were installed.

The metrics below are Chrome DevTools Protocol and browser PerformanceObserver approximations. They are useful for local risk assessment, but they are not a substitute for Lighthouse CI, WebPageTest, Chrome UX Report, or real-device field data.

| Route | Mode | FCP | LCP | CLS | TBT Proxy | Notes |
|---|---|---:|---:|---:|---:|---|
| `/` | Desktop local | 244 ms | 244 ms | 0.0001 | 117 ms | 51 images on page |
| `/` | Mobile local | 180 ms | 180 ms | 0 | 11 ms | 51 images on page |
| `/` | Low-end mobile simulation | 960 ms | 960 ms | 0.0001 | 454 ms | Homepage TBT risk |
| `/category/electronics` | Mobile local | 1152 ms | 1180 ms | 0 | 0 ms | 22 images |
| `/category/electronics` | Low-end mobile simulation | 1136 ms | 1720 ms | 0.0025 | 128 ms | Product grid image/network risk |
| `/search?q=sony&sort=popular` | Mobile local | 824 ms | 852 ms | 0 | 0 ms | Search rendered |
| `/search?q=sony&sort=popular` | Low-end mobile simulation | 1236 ms | 2296 ms | 0.005 | 28 ms | Near LCP warning threshold |
| Product detail | Mobile local | 1180 ms | 1180 ms | 0 | 0 ms | Long title visible |
| Product detail | Low-end mobile simulation | 1668 ms | 1928 ms | 0 | 76 ms | Acceptable in local simulation |
| `/cart` | Mobile local | 52 ms | 52 ms | 0 | 0 ms | Empty/guest cart rendered |
| `/checkout` to login | Low-end mobile simulation | 576 ms | 576 ms | 0.320 | 0 ms | CLS risk on login redirect |

Speed Index and INP were not formally available. TBT was used as the closest local proxy for main-thread responsiveness.

## Low-End Device Readiness Score

Score: 74/100

Confidence: medium

Rationale:

- Real Chrome browser verification was completed across desktop and mobile viewports.
- Synthetic low-end mobile results were generally usable, with LCP under 2.5 seconds in the tested local scenarios.
- Homepage TBT reached 454 ms under throttling, which is a meaningful low-end interaction risk.
- Search/category/product pages are image and grid heavy and need real network/device verification before launch confidence should be considered high.
- Checkout/login redirect showed poor CLS in one throttled route, so layout stability needs follow-up.
- No Lighthouse score or real field data was available.

## Runtime Errors Found

- Final clean browser route run: no console errors and no JavaScript exceptions.
- Startup issue found: stale `.next` artifact produced a missing `tailwind-merge` vendor chunk. A fresh `npm run build` fixed the local artifact.
- Environment issue found: Auth.js `UntrustedHost` occurred when running on port 3100 with mismatched auth host settings. Local-only verification overrides fixed the issue. Production/staging must ensure trusted host and auth URL configuration are correct.

## Flow Issues Found

- Guest browsing, homepage, category navigation, search route load, product detail route load, cart render, and login render all worked in smoke checks.
- Checkout did not create an order or payment; it redirected to login.
- Account and admin routes redirected to login and did not expose protected content.
- Unauthorized order confirmation access did not expose PII.
- Seller dashboard is not implemented and returned 404, consistent with current roadmap constraints.
- Authenticated buyer/admin/seller post-login flows were not verified because this step avoided live auth/external-service flows.

## Visual Regression Notes

- No code or visual changes were made in this step.
- Category count text preserved the card layout in inspected desktop and mobile screenshots.
- No category count overlap or arrow-button displacement was detected.
- Product detail mobile layout has a very long title that dominates the first viewport. This is a UX risk, not a regression from this step.
- The category detail mobile child-category row appears clipped at the right edge as a horizontal strip. This may be intended, but it should be touch-tested later.
- Checkout/login redirect had poor CLS in throttled measurement and should be investigated later.

## Top 15 No-Visual-Change Performance Fixes To Do Later

1. Add Lighthouse CI or a scripted browser-performance runner so Core Web Vitals can be measured repeatably without manual CDP scripts.
2. Fix and document trusted host/auth URL configuration for local, staging, and production so Auth.js does not produce host-related runtime failures.
3. Investigate homepage main-thread work and reduce noncritical client hydration for cart, wishlist, compare, header, or carousel features where possible.
4. Audit the 51 homepage images and confirm correct lazy loading, `sizes`, dimensions, and priority usage.
5. Add query timing/server timing for homepage, category, search, and product detail routes.
6. Move expensive search/category sort work to indexed database fields or precomputed values where current filtering requires heavier runtime work.
7. Split large client widgets with dynamic import where they are not needed during first paint.
8. Ensure image aspect ratios and intrinsic dimensions are stable for banners, cards, product thumbnails, and login artwork to reduce CLS.
9. Audit login and checkout redirect layout stability, especially desktop and throttled mobile CLS.
10. Verify static asset compression and caching headers in the actual deployment environment.
11. Add realistic product-grid pagination and limit checks for slow network users.
12. Keep category product counts grouped and server-side; avoid adding client-side count fetches.
13. Add cache revalidation/tagging for category/product-count data if stale counts become a production concern.
14. Add production-grade external rate limiting storage after approval, such as Redis or KV, instead of relying only on per-process memory.
15. Add browser smoke tests for protected route redirects and order-confirmation PII behavior.

## Top 10 UX/Mobile Issues To Do Later

1. Touch-test the mobile header, search, account, cart, wishlist, and compare interactions.
2. Review very long product titles on mobile detail pages so they remain readable without dominating the first viewport.
3. Verify category chip horizontal scrolling has a clear touch affordance on narrow mobile screens.
4. Test search filters and sort controls with actual mobile taps and slow network delay.
5. Test category/product cards with long English and Bangla category/product names.
6. Review login and checkout redirect layout stability after measuring the CLS source.
7. Verify cart quantity/update/remove states with multiple cart items using non-destructive test data.
8. Verify authenticated account/profile flows with a safe test user.
9. Verify authenticated admin dashboards and tables on mobile and desktop using a safe admin test account.
10. Verify empty, loading, and error states for homepage, category, search, cart, and account pages.

## What Could Not Be Verified

- Formal Lighthouse score, Speed Index, and Lighthouse TBT because Lighthouse tooling was not installed and packages were not added.
- Real INP because it requires real user interactions or field data; TBT was used as a local proxy.
- Real low-end phone behavior on Bangladeshi mobile networks.
- CDN behavior, production cache headers, and production database latency.
- Authenticated buyer, admin, and seller flows because live auth/external-service flows were intentionally avoided.
- Actual admin dashboard/table UI behind authentication.
- Payment, tracking, email, and SMS flows because they remain disabled/out of scope.
- Seller dashboard behavior because the route is not implemented.

## Validation Results

| Command | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run lint` | Passed; Next.js lint deprecation notice only |
| `npm test` | Passed; 23 test suites and 98 tests |
| `npm run build` | Passed; Next.js production build completed and generated 75 static pages |

## Files Changed In This Step

- `audit-reports/15_BROWSER_MOBILE_PERFORMANCE_VERIFICATION.md`

No Step 1 security files were modified in this verification step. No category UI files were modified in this verification step.

## Safe To Proceed To Step 3

Yes, with caution.

It is safe to proceed to the next roadmap step from a code-preservation standpoint because this step did not change code or visuals, Step 1 protected route behavior still appeared intact in browser smoke checks, and category counts rendered without obvious layout breakage. Before launch-level confidence, the project still needs formal Lighthouse or equivalent repeatable browser-performance testing, authenticated flow testing with safe test users, and follow-up on the auth host configuration and login/checkout CLS risk.
