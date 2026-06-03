# Step 99 - Post-Flash Runtime, Auth, and Image Stability

Date: 2026-06-03

## Scope

Step 99 verified the Step 98 Flash Deals removal and fixed runtime/auth/image stability issues reported after the Flash removal commit.

This step did not restore Flash Deals, did not reintroduce `/deals`, did not touch paused footer/newsletter/payment-logo/category-image assets, and did not change payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, or product lifecycle behavior.

## Initial Git State And Step 98 Verification

- `git status --short`: clean at start.
- `git diff --cached --name-only`: no staged files at start.
- `git log -1 --oneline`: `fb7e19e refactor: remove flash deals functionality`.
- Step 98 commit was verified locally.
- `audit-reports/98_REMOVE_FLASH_DEALS_FUNCTIONALITY.md` still says `Commit hash: pending until commit`; this is a historical report mismatch and was recorded here without rewriting or amending Step 98.

## Flash Deals Active-Removal Verification

Searches run:

- `rg -n -i "flash deal|flash deals|flash sale|flash-sale|flashsale|flash_sale|FlashSale|FlashDeal" . --glob '!node_modules/**' --glob '!.next/**' --glob '!audit-reports/**' --glob '!package-lock.json'`
- `rg -n "/deals|all deals|shop deals|limited offers" src prisma tests README.md expanded-folders.txt project-folders.txt --glob '!node_modules/**' --glob '!.next/**'`

Results:

- Active storefront/admin/API/schema/seed/docs did not reintroduce Flash Deals.
- Remaining references are limited to historical migrations, the forward removal migration, and negative/removal tests.
- `/deals` remains removed and returns 404 in smoke checks.
- `/api/admin/flash-sales` remains removed and returns 404 in smoke checks.
- `/admin/flash-sales` is protected by admin middleware and redirects unauthenticated users to login; no working Flash Sales admin UI route was exposed.

## Tailwind Runtime Error

Root cause:

- `tailwind.config.ts` used CommonJS `require('tailwindcss-animate')` inside a TypeScript/ESM config.
- In the current Next/Tailwind loading path this produced `ReferenceError: require is not defined`.

Fix:

- Replaced the CommonJS `require` call with an ESM import:
  - `import tailwindcssAnimate from 'tailwindcss-animate'`
  - `plugins: [tailwindcssAnimate]`
- Preserved the existing Tailwind plugin behavior and did not change design tokens or styling.

Test coverage:

- Added a no-DB runtime stability test that imports `tailwind.config.ts` and verifies the plugin list loads.

## Auth/Login Escape-Key Behavior

Investigation:

- `/auth/login` is a full-page login form, not a dialog. Escape should not navigate away from a full page.
- Existing Escape handling was present for `CartDrawer`.
- Storefront search suggestions, the storefront mobile menu overlay, and the admin mobile menu overlay did not have explicit Escape-to-close behavior.
- The reported auth/login pain point can occur when a menu/overlay is opened around auth navigation or admin/login flow, then Escape does not dismiss the blocking UI state.

Fix:

- `Header.tsx` now closes search suggestions, clears hovered desktop category state, closes the mobile menu, clears expanded mobile category state, and returns focus to the mobile menu trigger on Escape.
- `AdminShell.tsx` now closes the admin mobile menu overlay on Escape.
- No auth provider/session/OAuth/credential behavior was changed.
- No visual styling or layout was changed.

Reproduction note:

- Direct browser keypress automation was not available in this environment. The fix was based on source inspection, existing overlay behavior, and route smoke checks.

## Image Quality Warning

Root cause:

- Active image components use `quality={82}`, `quality={84}`, `quality={90}`, and `quality={92}`.
- Next.js 15 warns when requested image qualities are not configured in `images.qualities`.

Fix:

- Added `images.qualities: [75, 82, 84, 90, 92]` to `next.config.js`.
- Preserved existing image quality choices.
- Did not alter image components or visual assets.

Verification:

- Dev and production smoke directly requested Next image optimizer URLs with q=82, q=84, q=90, and q=92.
- All returned 200.
- Dev and production log scans showed no `is using quality` warnings after the fix.

## External Unsplash 404 Investigation

Known broken URLs:

- `https://images.unsplash.com/photo-1706165965474-1e45ede2e5c4?w=800&auto=format`
- `https://images.unsplash.com/photo-1673841464843-af1c5c8b8c54?w=800&auto=format`

Source:

- Active `prisma/seed.ts` product seed data:
  - Samsung Galaxy S24 Ultra primary product image.
  - Samsung Galaxy Tab S9 primary product image.
- Active `prisma/seed.ts` banner seed data:
  - Galaxy S24 Ultra hero banner image used the same broken Unsplash photo id at `w=1600`.
- Current local database also contained exact matches:
  - Product image rows before repair: 2.
  - Banner image rows before repair: 1.

Fix:

- Replaced the broken seed URLs with verified working Unsplash URLs that returned HTTP 200.
- Added `scripts/repair-known-broken-image-urls.mjs`, a local-only, exact-match, guarded repair script.
- The script requires `DATABASE_URL` and `SHADOW_DATABASE_URL` to classify as local and separate before it updates anything.
- Ran the repair script once against the local database:
  - Samsung Galaxy S24 Ultra product image: 1 row updated.
  - Samsung Galaxy Tab S9 product image: 1 row updated.
  - Galaxy S24 Ultra hero banner image: 1 row updated.
- Verified after repair:
  - Broken product image rows: 0.
  - Broken banner image rows: 0.

Test coverage:

- Added no-DB tests that:
  - Ensure known broken source URLs are absent from active `prisma/seed.ts`.
  - Verify the repair helper performs exact-match product/banner updates only.
  - Verify the repair plan refuses remote-looking database configuration.

## Files Changed

- `next.config.js`
- `prisma/seed.ts`
- `scripts/repair-known-broken-image-urls.mjs`
- `src/frontend/components/admin/AdminShell.tsx`
- `src/frontend/components/layout/Header.tsx`
- `tailwind.config.ts`
- `tests/runtime-stability.test.ts`
- `audit-reports/99_POST_FLASH_RUNTIME_AUTH_IMAGE_STABILITY.md`

## Files Intentionally Left Untouched

- Footer/newsletter visual files.
- Payment-logo assets.
- Category image assets.
- `src/frontend/components/home/PromoSection.tsx`.
- Prisma schema.
- Prisma migrations.
- Payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, and product lifecycle code.
- `.env` and `.env.local`.

## Validation Results

- `npm run db:url:safety`: passed.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 191 tests.
- `npm run build`: passed.

Focused checks:

- `npx tsx --test tests/runtime-stability.test.ts`: passed, 5 tests.
- `npx tsx --test tests/flash-deals-removal.test.ts`: passed, 2 tests.
- Replacement image URL HTTP checks: all replacement URLs returned 200.
- Local DB exact-match broken URL verification after repair: 0 product image rows and 0 banner rows.

## Dev Smoke Result

Dev server smoke was run on a temporary local port and stopped afterward.

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

Dev log scan:

- Tailwind `require is not defined`: false.
- Image quality warning: false.
- Known broken Unsplash IDs: false.
- Upstream image failure: false.

## Production Smoke Result

Production build was run before production smoke.

Note:

- A first `next start` attempt was invalid after dev smoke because `next dev` had overwritten `.next`; rebuilding restored production `BUILD_ID`.
- Final production smoke was run after a fresh `npm run build` and the temporary server was stopped afterward.

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

Production log scan:

- Tailwind `require is not defined`: false.
- Image quality warning: false.
- Known broken Unsplash IDs: false.
- Upstream image failure: false.

## Authenticated Admin Smoke

- Full authenticated admin browser smoke was not performed.
- Reason: this step avoided printing or handling private credentials/cookies/session payloads, and no safe browser-login automation path was available.
- Unauthenticated admin protection was smoke-tested:
  - `/admin/dashboard` redirects to login.
  - `/admin/flash-sales` redirects to login and does not expose a working Flash Sales UI.
  - `/api/admin/flash-sales` returns 404.

## Prohibited Files And Actions Check

Not performed:

- No broad staging.
- No package install or dependency update.
- No Prisma schema edit.
- No migration creation/editing.
- No seed/reset/db push/migrate command.
- No Docker command.
- No deployment.
- No payment/tracking/seller marketplace/product lifecycle activation.
- No paused visual/footer/newsletter/payment-logo/category-image asset edits.
- No secrets, DB URLs, cookies, tokens, payment secrets, auth headers, or customer/order PII printed in this report.

## Remaining Risks

- Full Escape-key behavior was not verified with real browser keypress automation; the source-level fix is targeted and low-risk, but manual browser QA should press Escape with search suggestions, the mobile menu, and the admin mobile menu open.
- The exact-match local image repair updated current local database rows, but other developer machines that already seeded old data must run the guarded repair script or reseed locally.
- Authenticated admin private smoke still needs a safe credential/session handling path.
- Existing seed file still contains local demo account material from prior project history; this step did not alter seed credentials.

## Commit

Commit hash: to be recorded from `git log -1 --oneline` after the Step 99 commit. A report included in the same commit cannot contain its own final hash without changing that hash.

## Recommended Next Step

Run a short manual browser QA pass for Escape behavior on desktop and mobile widths, then commit Step 99 changes if staged-file verification is exact and validation remains passing.
