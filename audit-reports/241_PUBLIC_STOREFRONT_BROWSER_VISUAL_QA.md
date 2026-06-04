# Step 241 - Public Storefront Browser Visual QA

## Scope

This QA covered the public storefront visual changes from Steps 239 and 240. It focused on rendered layout safety, mobile/desktop responsiveness, broken visible images, console/runtime errors, removed route preservation, and accessibility sanity checks.

## Browser/Smoke Strategy

The full `scripts/local-browser-runtime-check.mjs` route set includes a product detail page. Product detail mounts `ProductDetailClient`, which calls `POST /api/products/[id]/view` and records product views through the local database. Because this visual batch did not approve tracking or DB mutation, the full browser route set was not used.

Instead, the browser checker was run with a reduced route set that avoids the product-detail route:

- `/`
- `/category`
- `/category/electronics`
- `/category/toys-collectibles`
- `/search?q=phone`
- `/cart`
- `/track-order`
- `/deals`
- `/api/admin/flash-sales`

This still covered:

- desktop homepage
- mobile homepage
- desktop all-categories/category surfaces
- mobile all-categories/category surfaces
- desktop and mobile search/listing
- cart page
- track order page
- removed `/deals`
- removed `/api/admin/flash-sales`
- mobile search focus and Escape
- mobile menu Escape close
- cart drawer Escape and scroll lock cleanup
- auth/register/track-order form accessibility sanity
- checkout unauthenticated redirect

## HTTP Runtime Smoke Result

Command:

```powershell
node scripts/local-runtime-smoke.mjs --mode dev --port 3110 --startup-timeout-ms 90000 --request-timeout-ms 20000
```

Result: passed.

Covered routes and boundaries:

- `/` returned 200.
- `/category/electronics` returned 200.
- `/products/xiaomi-redmi-note-13-pro-256gb` returned 200 as an HTTP GET only.
- `/cart` returned 200.
- `/checkout` returned the expected unauthenticated redirect.
- `/track-order` returned 200.
- `/admin/dashboard` returned the expected unauthenticated redirect.
- `/api/products?page=bad&limit=100000` returned 200 with no raw leak.
- malformed product view POST returned 404 without raw leak.
- unauthenticated return request POST returned 401 without raw leak.
- `/deals` returned 404.
- `/api/admin/flash-sales` returned 404.
- `/sitemap.xml` returned 200.
- `/robots.txt` returned 200.

No unsafe API leak was reported.

## Browser QA Attempts And Fix

### Reduced Dev Browser Check

Command shape:

```powershell
node --input-type=module -e "<import checker, reduce BROWSER_RUNTIME_ROUTES, run mode dev>"
```

Result: failed before the final fix.

Finding:

- `/category` at `mobile-390` produced an Auth.js `ClientFetchError`.
- No horizontal overflow, broken images, server errors, or image failures were reported.
- The error appeared to be local dev/runtime noise and not a visual layout failure.

### Reduced Production Browser Check Before Fix

Command shape:

```powershell
node --input-type=module -e "<import checker, reduce BROWSER_RUNTIME_ROUTES, run mode start>"
```

First start-mode attempt failed because the prior dev smoke had rewritten `.next`, so `next start` no longer had a production build. A fresh `npm run build` restored the production build.

After rebuilding, production browser QA found console errors caused by protected footer links being prefetched from public pages:

- `/account`
- `/account/orders`

Root cause:

- Step 240 added visible footer account links.
- Next.js `Link` prefetch attempted protected account routes.
- Local auth redirects crossed `127.0.0.1` to `localhost`, causing browser CORS console errors during RSC prefetch.

Fix made:

- Added `prefetch={false}` only to protected footer account links:
  - `/account`
  - `/account/orders`
- This keeps click/navigation behavior unchanged while preventing public-page prefetch noise.

### Final Reduced Production Browser Check

Command shape:

```powershell
node --input-type=module -e "<import checker, reduce BROWSER_RUNTIME_ROUTES, run mode start>"
```

Final result: passed.

Summary:

- Browser: `msedge.exe`.
- Mode: `start`.
- Base URL: local `127.0.0.1` production server.
- Page/viewport checks: 36.
- Accessibility checks: 7.
- Failed pages: 0.
- Failed accessibility checks: 0.

Checked viewports:

- `mobile-390`
- `mobile-430`
- `tablet-768`
- `desktop-1366`

Final browser QA confirmed:

- no horizontal overflow on checked pages
- no broken visible images on checked pages
- no product-image preload spam on checked listing pages
- no console errors on final reduced production check
- no failed network requests on final reduced production check
- no 500 responses
- removed `/deals` remained removed
- removed `/api/admin/flash-sales` remained removed
- mobile search focus and Escape behavior still passed
- mobile menu Escape close still passed
- cart drawer Escape and scroll lock cleanup still passed
- public forms had named controls
- checkout unauthenticated redirect still passed

## Visual QA Result By Area

### Homepage

- Passed reduced production browser checks on mobile, tablet, and desktop.
- No visible broken images reported.
- No horizontal overflow reported.
- Featured category tile compacting did not create browser-detected layout overflow.

### Footer Desktop

- Footer rendered on checked public routes without console errors after protected account link prefetch was disabled.
- Payment logos still depend on available payment configuration.
- No seller footer promotion was added.

### Footer Mobile

- Footer rendered through mobile viewport checks without horizontal overflow.
- Link groups remain direct links rather than open mobile dropdowns.
- Buyer tasks are visible without using tiny unreadable text.

### Mobile Navigation

- Mobile menu Escape close passed.
- Support area now includes Track Order as a direct link.
- No unnamed buttons were reported by the final browser checker.

### Category And All-Categories

- `/category`, `/category/electronics`, and `/category/toys-collectibles` passed final reduced production browser checks.
- No horizontal overflow or broken visible images were reported.
- Toys & Collectibles remained intact.

### Search And Listing

- `/search?q=phone` passed final reduced production browser checks.
- Search page retained noindex behavior.
- Product card grid passed visible-image and overflow checks.

### Cart

- `/cart` passed final reduced production browser checks.
- Cart drawer Escape and scroll lock cleanup passed.
- Cart drawer source was not edited.

## Validation Results

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 373/373.
- `npm run build`: passed.
- `node scripts/local-runtime-smoke.mjs --mode dev --port 3110 --startup-timeout-ms 90000 --request-timeout-ms 20000`: passed.
- Reduced `runBrowserRuntimeCheck` in production `start` mode: passed, 36 page/viewport checks and 7 accessibility checks.

## Prohibited Action Confirmation

- No Prisma schema files were changed.
- No migrations were created or edited.
- No migration, db push, seed, reset, SQL, Docker, provider CLI, deployment, package update, or remote-service command was run.
- No private env file was read.
- No secrets, full DB URLs, tokens, cookies, credentials, auth headers, private connection strings, customer/order PII, or raw user data were printed.
- No backend, API, auth/session, checkout logic, payment logic, seller logic, tracking logic, product lifecycle, search-verification, canonical/noindex/schema, sitemap, robots, media-upload, object-storage, CDN, or image-processing helper behavior was intentionally changed.
- `/deals` remained removed.
- `/api/admin/flash-sales` remained removed.
- `public/assets/categories/baby-kids.jpg` was not restored.
- Toys & Collectibles was not undone.

## Remaining Risks

- Product detail visual browser QA was not run with JavaScript because that route records product views on mount.
- Cart drawer was verified through existing browser accessibility checks but not redesigned.
- Product-detail visual polish remains deferred.
- Dev-mode reduced browser check still showed an Auth.js client fetch error on `/category` at the first mobile viewport, while final production reduced browser QA passed.
- The content quality audit still reports pre-existing docs/seed/checkout findings outside this visual batch.

## Recommended Next Step

Run a focused product detail/cart/checkout visual QA batch that explicitly avoids product-view tracking writes unless a dedicated non-mutating test mode is introduced first.
