# Step 100 - Browser QA, Category Heading, and Escape Check

Date: 2026-06-03

## Scope

Step 100 verified the Step 99 runtime/auth/image fixes, performed browser-style QA across responsive widths, fixed the homepage "Shop by category" heading collision, and confirmed Flash Deals stayed removed.

This step made one targeted category-section layout fix and added a no-DB layout guardrail test.

## Initial Git State

- `git status --short`: clean at start.
- `git diff --cached --name-only`: no staged files at start.
- `git log -1 --oneline`: `653a983 fix: stabilize auth runtime and image config after flash removal`.

## Step 99 Commit Verification

Step 99 was verified as the latest local commit:

- `653a983 fix: stabilize auth runtime and image config after flash removal`

## Flash Deals Active-Removal Verification

Searches run:

- `rg -n -i "flash deal|flash deals|flash sale|flash-sale|flashsale|flash_sale|FlashSale|FlashDeal" . --glob '!node_modules/**' --glob '!.next/**' --glob '!audit-reports/**' --glob '!package-lock.json'`
- `rg -n "/deals|all deals|shop deals|limited offers" src prisma tests README.md expanded-folders.txt project-folders.txt --glob '!node_modules/**' --glob '!.next/**'`

Result:

- Active Flash Deals functionality did not reappear.
- Remaining references are limited to historical migrations, the Step 98 forward removal migration, and negative tests.
- `/deals` remains 404.
- `/api/admin/flash-sales` remains 404.
- `/admin/flash-sales` redirects unauthenticated users to login and does not expose a working Flash Sales UI.

## Browser QA Tooling Used

- In-app Browser plugin instructions were inspected.
- The required Node browser-control tool was not exposed in this session, so in-app Browser automation could not be used.
- Fallback real-browser QA used installed Google Chrome headless:
  - Screenshots at requested viewport widths.
  - Chrome DevTools Protocol via Node for DOM measurements and Escape-key checks.
- HTTP route smoke checks used `Invoke-WebRequest`.

## Viewport Matrix Tested

Home page screenshots were captured before and after the fix at:

- 390px mobile.
- 430px mobile.
- 768px tablet.
- 1024px small desktop.
- 1366px desktop.
- 1440px desktop.

Additional CDP measurements were taken at the same widths.

## Homepage Category-Heading Collision

Reproduced:

- Yes. Desktop screenshots showed the "Shop by category" heading constrained by `max-w-[12ch]`, forcing an unnecessary two-line desktop heading and making the section header/card spacing feel cramped.

Root cause:

- `FeaturedCategories.tsx` constrained the section heading to `max-w-[12ch]` at all breakpoints.
- Category card grid items also lacked an explicit `min-w-0`, which is a responsive-grid safety issue for long category names.

Fix:

- Changed the heading class from `max-w-[12ch]` to `max-w-[12ch] sm:max-w-none`.
- Added `min-w-0` to both mobile and desktop category tile links.
- Preserved the existing category cards, images, rounded corners, overlays, arrows, links, names, and product-count text.
- Did not modify category image assets.

Before/after evidence:

- Before desktop screenshot at 1366px: heading wrapped to two lines.
- After desktop screenshot at 1366px: heading is one line and no collision/cramped header behavior is visible.
- After CDP desktop measurements:
  - 768px: heading-to-grid gap 32px, `scrollWidth` equals `clientWidth`.
  - 1024px: heading-to-grid gap 32px, `scrollWidth` equals `clientWidth`.
  - 1366px: heading-to-grid gap 32px, `scrollWidth` equals `clientWidth`.
  - 1440px: heading-to-grid gap 32px, `scrollWidth` equals `clientWidth`.
- After CDP mobile measurements:
  - 390px: `clientWidth` 390, `scrollWidth` 390, section width 390.
  - 430px: `clientWidth` 430, `scrollWidth` 430, section width 430.

## Escape-Key Verification

Storefront search:

- Opened `/` at 1366px.
- Typed into the search field through Chromium/CDP.
- Suggestions before Escape: 1.
- Suggestions after Escape: 0.
- Result: pass.

Storefront mobile menu:

- Opened `/` at 390px.
- Opened the mobile menu.
- Pressed Escape through Chromium/CDP.
- Menu opened: yes.
- Menu closed after Escape: yes.
- Focus returned to the "Open menu" trigger.
- Body scroll style was not stuck.
- Result: pass.

Auth login:

- Opened `/auth/login` at 390px.
- Pressed Escape through Chromium/CDP.
- Path before: `/auth/login`.
- Path after: `/auth/login`.
- Login form remained present.
- No overlay or navigation issue occurred.
- Result: pass.

Admin mobile menu:

- Full authenticated admin mobile menu Escape smoke was not performed because this step avoided handling or printing private credentials, cookies, tokens, auth headers, or session payloads.
- Unauthenticated admin behavior was verified:
  - `/admin/dashboard` redirects to `/auth/login?callbackUrl=%2Fadmin%2Fdashboard`.
  - Login form is present after redirect.
- Result: protected unauthenticated behavior pass; authenticated admin private Escape test remains manual/future.

## Image Warning And 404 Regression Verification

Dev and production log scans showed:

- Tailwind `require is not defined`: false.
- Image quality warning: false.
- Known broken Unsplash IDs: false.
- Upstream image failure: false.

Image optimizer requests returned 200 for:

- q=82.
- q=84.
- q=90.
- q=92.

## Dev Smoke Results

Temporary dev server:

- Port: 3103.
- Server was stopped after checks.

Routes:

- `/`: 200.
- `/auth/login`: 200.
- `/checkout`: 307 to `/auth/login?callbackUrl=/checkout&reason=checkout`.
- `/cart`: 200.
- `/category`: 200.
- `/category/electronics`: 200.
- `/products/xiaomi-redmi-note-13-pro-256gb`: 200.
- `/new-arrivals`: 200.
- `/admin/dashboard`: 307 to login.
- `/admin/flash-sales`: 307 to login.
- `/api/admin/flash-sales`: 404.
- `/deals`: 404.
- `/sitemap.xml`: 200.

## Production Smoke Results

Temporary production server:

- Port: 3104.
- Server was started after a fresh `npm run build`.
- Server was stopped after checks.

Routes:

- `/`: 200.
- `/auth/login`: 200.
- `/checkout`: 307 to `/auth/login?callbackUrl=/checkout&reason=checkout`.
- `/cart`: 200.
- `/category`: 200.
- `/category/electronics`: 200.
- `/products/xiaomi-redmi-note-13-pro-256gb`: 200.
- `/new-arrivals`: 200.
- `/admin/dashboard`: 307 to login.
- `/admin/flash-sales`: 307 to login.
- `/api/admin/flash-sales`: 404.
- `/deals`: 404.
- `/sitemap.xml`: 200.

Image optimizer requests:

- q=82: 200.
- q=84: 200.
- q=90: 200.
- q=92: 200.

## Validation Command Results

- `npm run db:url:safety`: passed.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 193 tests.
- `npm run build`: passed.

## Files Changed

- `src/frontend/components/home/FeaturedCategories.tsx`
- `tests/featured-categories-layout.test.ts`
- `audit-reports/100_BROWSER_QA_CATEGORY_HEADING_ESCAPE_CHECK.md`

## Files Intentionally Left Untouched

- Footer/newsletter visual files.
- Payment-logo assets.
- Category image assets.
- `src/frontend/components/home/PromoSection.tsx`.
- Prisma schema.
- Prisma migrations.
- Payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, product lifecycle, and mobile app implementation.
- `.env` and `.env.local`.

## Prohibited Actions And Files Check

Not performed:

- No broad staging.
- No package install or dependency update.
- No Prisma schema or migration edits.
- No seed/reset/db push/migrate command.
- No Docker command.
- No deployment.
- No secrets, DB URLs, cookies, tokens, payment secrets, auth headers, or customer/order PII printed in this report.
- No paused footer/newsletter/payment-logo/category-image/PromoSection files touched.

## Remaining Risks

- Authenticated admin mobile-menu Escape behavior still needs a safe private login path or manual browser QA.
- Headless screenshots and CDP measurements are strong browser evidence, but the user should still do a short human visual pass in their normal browser at 390px, 768px, and desktop widths.
- This step fixed only the homepage category-section collision and did not audit unrelated homepage visual sections.

## Commit

Commit hash: to be recorded from `git log -1 --oneline` after commit. A report included in the same commit cannot contain its final hash without changing that hash.

## Recommended Next Step

Manually verify the homepage category section and Escape behavior in a normal browser, then proceed to a dedicated authenticated-admin QA step only if a safe local login method is available.
