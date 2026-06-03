# Step 115 Browser Performance and Accessibility Remeasure

## Scope

Step 115 remeasured public runtime behavior after Step 114's no-visual image/LCP and smoke-helper changes. It covered real-browser public page checks, public keyboard/accessibility sanity, smoke-helper cleanliness, validation, and exact-file commit readiness.

Authenticated admin QA was intentionally not retried because Steps 102-104 established that secure credential entry/session setup is externally blocked.

## Initial Git State

- Initial hard gate passed before edits.
- Latest commit verified: `acc0249 fix: strengthen runtime readiness boundaries`.
- No staged files were present.
- Working tree was clean at the initial gate.
- During Step 115, only Step 115 helper/test/report files became dirty.

## Step 114 Commit Verification

- Step 114 commit remained the latest commit at the start of this step.
- Step 114 smoke-helper and image/LCP test coverage remained present.
- Flash Deals / Flash Sale removal remained intact.

## Flash Deals Removal Verification

Commands run:

- `rg -n -i "flash deal|flash deals|flash sale|flash-sale|flashsale|flash_sale|FlashSale|FlashDeal" . --glob '!node_modules/**' --glob '!.next/**' --glob '!audit-reports/**' --glob '!package-lock.json'`
- `rg -n "/deals|all deals|shop deals|limited offers" src prisma tests README.md expanded-folders.txt project-folders.txt --glob '!node_modules/**' --glob '!.next/**'`

Result:

- Remaining references were limited to removal migrations, guardrail/removal tests, and runtime negative checks.
- `/deals` remains a removed storefront route checked as `404`.
- `/api/admin/flash-sales` remains a removed admin API route checked as `404`.
- No active Flash Deals UI/API behavior was restored.

## Browser Tooling

- Playwright is not installed.
- Lighthouse is not installed (`npm ls lighthouse --depth=0` returned empty).
- Microsoft Edge was available by direct executable path.
- A dependency-free CDP helper was added for local Edge/Chrome browser checks.
- The in-app browser REPL tool was not callable from the visible tool set in this turn, so local Edge/CDP was used.

## Browser Performance, Image, and LCP Remeasurement

Added and ran:

- `node scripts/local-browser-runtime-check.mjs --mode dev --port 3120 --cdp-port 9320`
- `node scripts/local-browser-runtime-check.mjs --mode start --port 3121 --cdp-port 9321`

Routes checked across 390px, 430px, 768px, and 1366px viewports:

- `/`
- `/category/electronics`
- `/category/toys-collectibles`
- `/search?q=phone`
- `/new-arrivals`
- `/products/xiaomi-redmi-note-13-pro-256gb`
- `/cart`
- `/track-order`
- removed storefront route `/deals`
- removed admin API route `/api/admin/flash-sales`

Clean findings:

- No horizontal overflow was detected on checked routes/viewports.
- No Next image quality, priority, preload, or LCP warnings were detected.
- No product-card priority spam was detected.
- Product detail primary image remained sane in the checked product route.
- Category, search, new arrivals, cart, track-order, and removed routes had no broken images in the CDP checks.
- Removed Flash routes were checked as expected removed routes and did not introduce active UI links.

Measured issue:

- The homepage still has one broken remote Unsplash hero/banner image across checked viewports.
- The broken URL is sourced from seeded/banner data using Unsplash photo id `photo-1695048133142-1a20484d2569`.
- This was not fixed in Step 115 because the step explicitly forbids replacing images and changing image assets/content. No database repair or seed mutation was run.

Browser result classification:

- Dev browser run: failed only because of the measured homepage broken remote image.
- Production browser run: failed only because of the same measured homepage broken remote image.
- All non-homepage page checks and public accessibility checks passed.

## Public Accessibility, Keyboard, and Focus Findings

The CDP helper checked public interactions without creating users, orders, returns, payments, or tracking events.

Passed checks:

- Mobile search can be focused and typed into.
- Search suggestions close with Escape.
- Mobile menu opens and closes with Escape.
- Cart drawer opens; Escape closes it and clears body scroll lock.
- `/auth/login` controls had accessible names and no obvious public form crash.
- `/auth/register` controls had accessible names and no obvious public form crash.
- `/track-order` controls had accessible names and kept `noindex, follow`.
- `/checkout` unauthenticated access redirected to `/auth/login` with checkout callback.
- Track-order page did not expose delivery/customer PII phrases in the checked public body.

No public keyboard trap was detected in the checked overlays.

## Smoke Helper Cleanliness and Integration

Reviewed and reused `scripts/local-runtime-smoke.mjs`.

Findings:

- The smoke helper does not print full response bodies on success.
- The helper has explicit expected-status contracts.
- Removed Flash routes are checked as removed routes.
- The helper starts scoped local Next child processes and is designed to stop its own process tree.
- No `.tmp-smoke-logs` directory existed after dev/prod smoke and browser checks.

Process note:

- Two repo-local `next dev` Node processes were present before Step 115 validation and blocked `npm run db:prisma:local:generate` on Windows by holding the Prisma query engine DLL.
- Those repo-local Next dev processes were stopped so validation could complete.
- After validation/browser checks, no repo-local Node/Next process remained.

No package scripts or README changes were added because the new CDP helper is still a focused audit tool and should mature before becoming a public project command.

## Source Fixes Made

No runtime storefront/source component behavior was changed.

Step 115 added a dependency-free browser/CDP measurement helper and test guardrails:

- The helper launches local Edge/Chrome with an isolated temporary profile.
- It checks public routes across four viewports.
- It records console/runtime errors, relevant image/LCP warnings, failed/server/image requests, broken DOM images, priority spam, horizontal overflow, basic accessible-name counts, and selected public keyboard interactions.
- It treats expected removed-route `404` console noise and benign navigation aborts as non-failures.
- It waits for hydration before public keyboard/click checks.

## Tests Added or Updated

Updated:

- `tests/runtime-stability.test.ts`

Coverage added:

- Browser-check argument parsing.
- Rejection of ambiguous server/CDP ports.
- Isolated browser launch arguments.
- Stable public browser route set.
- Required mobile and desktop viewport coverage.

## No Real Mutations

No real order, return, payment, tracking, user, seed, migration, db-push, reset, or SQL mutation was run.

No authenticated admin QA was attempted.

## Dev and Production Smoke Results

Dev smoke:

- Command: `node scripts/local-runtime-smoke.mjs --mode dev --port 3110`
- Result: passed.
- Safe routes returned expected statuses.
- Protected routes redirected/rejected safely.
- `/deals` returned `404`.
- `/api/admin/flash-sales` returned `404`.
- No raw internal JSON leak was detected.

Production smoke:

- Command sequence: `npm run build`, then `node scripts/local-runtime-smoke.mjs --mode start --port 3111`
- Result: passed.
- Same safe route, protected route, removed-route, and raw-leak checks passed.

## Validation Results

Commands run:

- `npm run db:url:safety`: passed; no database connection attempted; app and shadow DB URLs classify local and separate.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: first attempt failed with Windows `EPERM` because a pre-existing repo-local Next dev process had the Prisma query engine DLL loaded; after stopping that repo-local dev process, rerun passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 266 tests.
- `npm run build`: passed.

Additional targeted checks:

- `npx tsx --test tests/runtime-stability.test.ts`: passed, 13 tests.
- `npm ls lighthouse --depth=0`: Lighthouse unavailable; no dependency was added.

## Files Changed

- `scripts/local-browser-runtime-check.mjs`
- `tests/runtime-stability.test.ts`
- `audit-reports/115_BROWSER_PERFORMANCE_ACCESSIBILITY_REMEASURE.md`

## Files Intentionally Left Untouched

- Footer/newsletter visual files.
- Payment-logo assets.
- Category image assets and generation/replacement files.
- `src/frontend/components/home/PromoSection.tsx`.
- Payment provider/backend integration.
- Tracking provider/API integration.
- Seller marketplace implementation.
- Product lifecycle schema/migrations.
- CSP enforcement.
- Distributed rate-limit provider implementation.
- Mobile app implementation.
- Authenticated admin password/session flows.
- Prisma schema and migrations.
- Seed/reset/db-push commands.

## Prohibited Files and Actions Check

- No `.env` or `.env.local` file was staged or changed.
- No secrets, full DB URLs, tokens, passwords, cookies, auth headers, payment secrets, private connection strings, or customer/order PII were printed.
- No image files/assets were modified.
- No category/footer/newsletter/payment-logo visual files were touched.
- No database migration, seed, reset, db push, SQL, deployment, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, product lifecycle migration, or mobile app implementation was performed.

## Remaining Risks

1. The homepage still uses a broken remote Unsplash hero/banner URL in local seeded/banner data. This should be handled in a dedicated approved image-content repair step because Step 115 forbids replacing images.
2. Authenticated admin browser QA remains externally blocked.
3. Lighthouse/Core Web Vitals scores were not collected because Lighthouse is not installed and no dependency was added.
4. The new browser helper is dependency-free and useful for regression checks, but it is not yet a full accessibility audit or Lighthouse replacement.
5. In-memory rate limiting remains not production-distributed.
6. Real hosted staging/CDN/mobile-device testing is still needed before launch.

## Recommended Next Step

Run a dedicated, tightly scoped Step 116 decision step for the measured broken homepage seeded Unsplash URL: either approve a source/seed repair using an existing known-good image URL, or document that content replacement is intentionally deferred until visual/content review.
