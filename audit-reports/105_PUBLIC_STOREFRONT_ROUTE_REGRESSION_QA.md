# Step 105 - Public Storefront Route Regression QA

## Scope

Step 105 performed a non-secret prelaunch public storefront and route-regression QA pass after Flash removal and recent runtime/layout fixes.

Authenticated admin browser QA was treated as an external blocker from Steps 102-104 and was not retried.

## Initial Git State

- `git status --short`: clean at the hard gate.
- `git diff --cached --name-only`: no staged files.
- Latest commit verified: `5370f89 docs: record authenticated admin browser handoff blocker`.

## Step 104 Commit Verification

Step 104 was verified as the latest commit before Step 105 work began:

- `5370f89 docs: record authenticated admin browser handoff blocker`

## Authenticated Admin QA Blocker Handling

Authenticated admin QA remains externally blocked because secure credential-entry paths were unavailable in Steps 102-104.

This step did not retry password entry, did not ask for credentials, and did not collect, print, store, or commit any password/session/cookie/token data.

## Flash Deals Active-Removal Verification

Flash/Deals removal remains intact.

Searches for Flash-related terms found only expected references:

- Historical Prisma migrations
- Flash removal migration
- Negative/removal tests

Runtime smoke confirmed:

- `/deals`: `404`
- `/api/admin/flash-sales`: `404`
- `/admin/flash-sales`: unauthenticated redirect to login, not an active public Flash page

No active Flash storefront, admin page, API route, link, or public UI text was restored.

## Public Route Inventory Inspected

The app route inventory was inspected under `src/app` for `page.tsx`, `route.ts`, `sitemap.ts`, and `robots.ts`.

QA route list included:

- `/`
- `/category`
- `/category/electronics`
- `/category/toys-collectibles`
- `/search`
- `/search?q=phone`
- `/new-arrivals`
- `/products/xiaomi-redmi-note-13-pro-256gb`
- `/products/samsung-galaxy-tab-s9-128gb`
- `/cart`
- `/checkout`
- `/auth/login`
- `/auth/register`
- `/contact`
- `/track-order`
- `/order/test-or-invalid-id/confirmation`
- `/admin/dashboard`
- `/admin/flash-sales`
- `/api/admin/flash-sales`
- `/deals`
- `/sitemap.xml`
- `/robots.txt`

## Dev Browser/HTTP QA Results

Dev headless browser QA ran across 5 viewports and 22 routes before the fix:

- Viewports: 390, 430, 768, 1024, 1366
- Checks: route status/final URL, canonical, robots meta, Flash text, `/deals` links, console/runtime warnings, and horizontal overflow.

Findings:

- No horizontal overflow was found.
- No active Flash text or `/deals` links were found.
- No Tailwind `require is not defined` error was found.
- No known broken Unsplash upstream failure was found.
- Expected `404` routes produced expected resource-load 404 messages.
- A repeatable Next image warning appeared on the homepage hero image because hidden split mobile/desktop `Image` variants both advertised `sizes="100vw"`.

Post-fix dev HTTP smoke result:

- `/`: `200`
- `/category`: `200`
- `/category/electronics`: `200`
- `/category/toys-collectibles`: `200`
- `/search`: `200`
- `/search?q=phone`: `200`
- `/new-arrivals`: `200`
- `/products/xiaomi-redmi-note-13-pro-256gb`: `200`
- `/products/samsung-galaxy-tab-s9-128gb`: `200`
- `/cart`: `200`
- `/checkout`: `307` redirect to login with checkout callback/reason
- `/auth/login`: `200`
- `/auth/register`: `200`
- `/contact`: `200`
- `/track-order`: `200`
- `/order/test-or-invalid-id/confirmation`: `404`
- `/admin/dashboard`: `307` redirect to login
- `/admin/flash-sales`: `307` redirect to login
- `/api/admin/flash-sales`: `404`
- `/deals`: `404`
- `/sitemap.xml`: `200`
- `/robots.txt`: `200`

Post-fix focused dev headless browser result for `/`:

- 390: no overflow, no Flash text/link, no console/runtime errors
- 430: no overflow, no Flash text/link, no console/runtime errors
- 768: no overflow, no Flash text/link, no console/runtime errors
- 1024: no overflow, no Flash text/link, no console/runtime errors
- 1366: no overflow, no Flash text/link, no console/runtime errors

## Production Smoke Results

Production build passed, then production HTTP smoke ran against `next start`.

Routes checked:

- `/`: `200`
- `/category`: `200`
- `/search?q=phone`: `200`
- `/products/xiaomi-redmi-note-13-pro-256gb`: `200`
- `/cart`: `200`
- `/checkout`: `307` redirect to login with checkout callback/reason
- `/auth/login`: `200`
- `/admin/dashboard`: `307` redirect to login
- `/admin/flash-sales`: `307` redirect to login
- `/api/admin/flash-sales`: `404`
- `/deals`: `404`
- `/sitemap.xml`: `200`
- `/robots.txt`: `200`

No production smoke server was left running.

## Responsive Viewport Matrix And Overflow Result

Headless browser viewport matrix:

- 390px mobile
- 430px mobile
- 768px tablet
- 1024px small desktop
- 1366px desktop

Result:

- No horizontal overflow detected on tested homepage viewports after the fix.
- The earlier full dev browser matrix also found no horizontal overflow on the broader route set.

## Public Interaction Smoke Result

Public interactions checked:

- Mobile menu opened on 390px viewport.
- Escape closed the mobile menu.
- Search suggestions API returned suggestions for a normal query.
- Search suggestions API returned an empty list for a too-short query.
- Synthetic direct DOM input did not open suggestions in the headless script, likely because it bypassed React's input tracking; this was treated as an automation limitation, not a confirmed UI bug.

No real orders, payment calls, user creation, or authenticated flows were performed.

## Metadata/Noindex/Sitemap/Robots Result

Observed metadata/source-policy results:

- Homepage canonical: `https://boilabin.com/`
- Category canonical examples: `https://boilabin.com/category`, `https://boilabin.com/category/electronics`
- Search canonical: `https://boilabin.com/search`
- Product canonical examples use `https://boilabin.com/products/...`
- Search pages: `noindex, follow`
- Cart: `noindex, follow`
- Checkout redirects unauthenticated users to noindex login page
- Track order: `noindex, follow`
- Invalid order confirmation route: `404` and noindex
- Auth routes: noindex
- Admin unauthenticated routes redirect to noindex login page

Sitemap/robots smoke:

- Sitemap does not include `/deals`.
- Sitemap does not include `/search`.
- Sitemap does not include `/admin`.
- Robots disallows admin, cart, and checkout utility paths.

Existing SEO tests also cover canonical normalization, search noindex, faceted category noindex, sitemap exclusions, and robots policy.

## Image Warning/404 Regression Result

Bug found:

- Homepage hero image emitted a Next image warning because hidden mobile/desktop split `Image` variants both used `sizes="100vw"`.

Fix made:

- Mobile hero image now uses `sizes="(max-width: 639px) 100vw, 0px"`.
- Desktop hero image now uses `sizes="(max-width: 639px) 0px, 100vw"`.

Post-fix result:

- Focused headless homepage viewport QA reported no relevant image warning.
- No known broken Unsplash upstream failure was found.
- Some lazy/offscreen images had `naturalWidth` of zero during the broad headless scan; those were not treated as confirmed 404s because no matching known upstream failure or route-breaking error was observed.

## Bugs Found And Fixes Made

Fixed one small no-visual-change bug:

- `src/frontend/components/home/HeroBanner.tsx`: corrected responsive `sizes` hints for split hidden/visible hero images.

No visual redesign was made.

## Tests Added/Updated

Updated:

- `tests/runtime-stability.test.ts`

Added guardrail:

- Verifies the split hero image `sizes` hints do not advertise hidden variants as full viewport images.

## Validation Command Results

Commands run:

- `npm run db:url:safety`: passed
- `npm run db:prisma:local:validate`: passed
- `npm run db:prisma:local:generate`: first attempt hit an `EPERM` local file lock from leftover QA processes; passed after those processes were stopped
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm test`: passed, 197 tests
- `npm run build`: passed

No migration, seed, reset, db push, destructive SQL, Docker, or deployment command was run.

## Files Changed

- `src/frontend/components/home/HeroBanner.tsx`
- `tests/runtime-stability.test.ts`
- `audit-reports/105_PUBLIC_STOREFRONT_ROUTE_REGRESSION_QA.md`

## Files Intentionally Left Untouched

Intentionally untouched:

- Footer/newsletter visual files
- Payment-logo assets
- Category image assets
- `src/frontend/components/home/PromoSection.tsx`
- Prisma schema and migrations
- Env files and secret files
- Payment backend
- Tracking API
- Seller marketplace implementation
- Product lifecycle migration
- CSP enforcement
- Distributed rate limiting
- Mobile app implementation

## Prohibited Files/Actions Check

Confirmed:

- No `.env` or `.env.local` file was staged or changed.
- No secrets, cookies, tokens, session payloads, passwords, full DB URLs, or PII were printed in this report.
- No paused visual/assets files were modified, staged, or committed by this step.
- No Flash Deals route or feature was restored.
- No broad git staging command was used.

## Remaining Risks

- Authenticated admin desktop/mobile browser QA remains externally blocked until a secure credential-entry path or user-controlled local browser login is available.
- Search suggestion UI open/close behavior was partially limited by headless synthetic input; the API contract and Escape-close behavior were still checked.
- The pass was local prelaunch QA, not a hosted/staging CDN/browser-device matrix.

## Commit Hash

Final commit hash will be available from `git log -1 --oneline` after the exact-file commit is completed.
