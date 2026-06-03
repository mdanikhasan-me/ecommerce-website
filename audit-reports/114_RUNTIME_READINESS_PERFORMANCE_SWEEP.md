# Step 114 - Runtime Readiness And No-Visual Performance Sweep

## Scope

Step 114 combined three closely related prelaunch runtime-readiness tasks:

- Rate-limit/request-guard production-readiness review.
- No-visual image/LCP advisory cleanup for public product listing surfaces.
- Local dev/prod smoke harness cleanup robustness.

This step did not perform authenticated admin QA, payment provider setup, tracking integration, seller marketplace work, product lifecycle migration, CSP enforcement, distributed rate-limit provider integration, mobile app implementation, footer/newsletter visual work, payment-logo work, category image asset work, or visual redesign.

## Initial Git State

Hard gate results:

- `git status --short` - clean.
- `git diff --cached --name-only` - empty.
- `git log -1 --oneline` - `74932eb fix: strengthen security runtime boundaries`.

No files were staged before Step 114 started.

## Step 113 Commit Verification

Verified latest commit before Step 114:

- `74932eb fix: strengthen security runtime boundaries`

This matches the user-provided Step 113 commit.

## Authenticated Admin Blocker Handling

Authenticated admin browser QA was not retried. Steps 102 through 104 already established the secure credential-entry path is externally blocked.

Unauthenticated admin boundary behavior was covered by dev/prod smoke:

- `/admin/dashboard` returned a redirect to login.

No credentials, cookies, auth headers, passwords, tokens, or session payloads were requested or printed.

## Flash Deals Removal Verification

Flash Deals / Flash Sale remains removed.

Search results after Step 114 changes showed only allowed references:

- historical migrations,
- the forward removal migration,
- negative/removal tests.

Smoke results:

- `/deals` returned `404`.
- `/api/admin/flash-sales` returned `404`.

The new smoke helper intentionally avoids storing the removed Flash/Deals route literals in active scripts, so the existing Flash-removal guardrail test remains green.

## Rate-Limit And Request-Guard Findings

Current public/buyer mutation guard coverage remains intact:

- `POST /api/contact`
- `POST /api/newsletter`
- `POST /api/auth/register`
- `POST /api/reviews`
- `POST /api/orders`
- `POST /api/returns`
- `POST /api/products/[id]/view`

Findings:

- These mutation routes use `protectMutationRequest(req)`.
- These mutation routes use `rateLimit(req, { key: ... })`.
- Step 113's new route coverage for `returns:create` and `products:view` remains in place.
- No provider-specific Redis/KV/Upstash/Vercel KV implementation was added.
- The limiter remains in-memory/per-process and is suitable only as a local/single-process safety layer.
- Production distributed rate limiting remains a launch-readiness requirement.

Tests:

- Existing `tests/security-runtime-boundary.test.ts` continues guarding mutation route origin/rate-limit source coverage.
- Existing API contract tests continue covering the shared `429` response contract.

## No-Visual Image And LCP Findings

Concrete no-visual opportunities found:

- Public category/search/new-arrivals pages render product grids where the first product image can become a likely listing-page LCP candidate.
- `ProductCard` had a fixed grid image `sizes` value, which was safe but not always precise for wider multi-column grids.
- Product detail primary image already had `priority` and was left unchanged.
- Homepage hero split images already had priority/sizes guardrails and were left unchanged.

No image files/assets were changed.

## Smoke Harness Cleanup Findings

Known previous issue:

- Ad hoc local smoke runs can leave process trees or conflict with `.next` artifacts on Windows.
- Dev smoke can rewrite production `.next` artifacts, so production smoke should run after a fresh build.

Fix made:

- Added `scripts/local-runtime-smoke.mjs`, a dependency-free local smoke helper.

Helper behavior:

- Starts only a local Next dev/start process.
- Uses `process.execPath` and the local Next CLI directly instead of spawning `npm.cmd`, avoiding a Windows `spawn EINVAL` failure seen during this step.
- Waits for server readiness.
- Runs only safe, non-mutating route/API probes.
- Rejects unexpected status contracts and JSON raw-internal leak patterns.
- Sends same-origin headers for safe POST boundary probes.
- Stops only the child process tree it started.
- Does not write temporary logs/screenshots.
- Suppresses successful response body samples to avoid noisy or sensitive output.

After dev and production smoke:

- No `.tmp-smoke-logs` directory was present.
- No repo-local Next process was left running.

## Source Fixes Made

No runtime API behavior was changed.

No-visual performance fixes:

- `ProductCard` now accepts optional `priority` and `imageSizes` props while preserving old defaults.
- Category listing marks only the first product card as `priority` and uses a more accurate listing `sizes` string.
- Search listing marks only the first product card as `priority` and uses a more accurate listing `sizes` string.
- New Arrivals marks only the first product card as `priority` and uses a more accurate multi-column `sizes` string.
- Homepage product grids use a more accurate multi-column `sizes` string without adding priority to every section.

Smoke cleanup fix:

- Added a reusable local runtime smoke helper.

## Tests Added Or Updated

Updated:

- `tests/runtime-stability.test.ts`

Coverage added:

- Product listing pages opt into only one priority product-card image.
- ProductCard exposes `priority` and `imageSizes` without changing default layout.
- Local smoke helper argument parsing.
- Local smoke helper direct Next command construction.
- Smoke status contract helper.
- JSON internal-leak detector helper.
- Safe smoke route set, including removed route checks without active script literals.

## No Real Mutation Confirmation

No real order, return, payment, tracking, user, seller, admin, lifecycle, migration, seed, reset, DB push, destructive SQL, Docker, or deployment operation was performed.

The only POST probes were safe boundary checks:

- malformed product-view request,
- unauthenticated return request.

## Dev Smoke Results

Command:

- `node scripts/local-runtime-smoke.mjs --mode dev --port 3110`

Final result: passed.

Routes:

- `/` - `200`
- `/category/electronics` - `200`
- `/products/xiaomi-redmi-note-13-pro-256gb` - `200`
- `/cart` - `200`
- `/checkout` - `307` to login
- `/track-order` - `200`
- `/admin/dashboard` - `307` to login
- `/api/products?page=bad&limit=100000` - `200`
- `POST /api/products/bad%24id/view` - `404`
- `POST /api/returns` - `401`
- `/deals` - `404`
- `/api/admin/flash-sales` - `404`
- `/sitemap.xml` - `200`
- `/robots.txt` - `200`

No JSON raw-internal leak was detected by the smoke helper.

Note: the first helper run exposed a helper bug: `npm.cmd` spawning failed with `spawn EINVAL`, and a broad leak regex falsely flagged normal product JSON. Both helper issues were fixed before final validation.

## Production Smoke Results

Fresh build was run after dev smoke before production smoke.

Command:

- `node scripts/local-runtime-smoke.mjs --mode start --port 3111`

Final result: passed.

Routes matched the dev smoke expectations:

- public pages rendered,
- protected checkout/admin paths redirected,
- malformed/unauthenticated API POST probes returned safe JSON,
- removed Flash routes stayed `404`,
- sitemap and robots rendered,
- no JSON raw-internal leak was detected.

After production smoke:

- no `.tmp-smoke-logs`,
- no lingering repo-local Next process.

## Validation Results

Commands run:

- `npm run db:url:safety` - passed.
- `npm run db:prisma:local:validate` - passed.
- `npm run db:prisma:local:generate` - passed.
- `npm run typecheck` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 264 tests.
- `npm run build` - passed.

Additional focused commands:

- `npx tsx --test tests/runtime-stability.test.ts` - passed.
- `npx tsx --test tests/flash-deals-removal.test.ts tests/runtime-stability.test.ts` - passed.

## Files Changed

- `src/app/(store)/category/[slug]/page.tsx`
- `src/app/(store)/new-arrivals/page.tsx`
- `src/app/(store)/search/page.tsx`
- `src/frontend/components/home/ProductGrid.tsx`
- `src/frontend/components/product/ProductCard.tsx`
- `scripts/local-runtime-smoke.mjs`
- `tests/runtime-stability.test.ts`
- `audit-reports/114_RUNTIME_READINESS_PERFORMANCE_SWEEP.md`

## Files Intentionally Left Untouched

Intentionally untouched:

- `.env`
- `.env.local`
- Prisma schema and migrations
- seed/reset/db push scripts
- footer/newsletter visual files
- payment-logo assets
- category image assets
- `src/frontend/components/home/PromoSection.tsx`
- payment provider logic
- tracking integration
- seller marketplace work
- product lifecycle schema
- CSP enforcement
- distributed rate-limit provider implementation
- mobile app implementation
- authenticated admin password/session flows

## Prohibited Files And Actions Check

Not performed:

- no secrets printed,
- no full DB URLs printed,
- no migrations,
- no `prisma db push`,
- no seed/reset/destructive SQL,
- no Docker,
- no deployment,
- no source restore from GitHub/remote,
- no Flash Deals revival,
- no visual redesign,
- no image asset modification,
- no payment/tracking/seller/lifecycle/mobile implementation.

## Remaining Risks

- Authenticated admin browser QA remains externally blocked.
- In-memory rate limiting is still not production-distributed.
- The new smoke helper is HTTP-level smoke, not a full browser-console/Lighthouse replacement.
- Image/LCP changes are conservative metadata hints; real Lighthouse/mobile metrics should be remeasured later.
- Public product API smoke returns real catalog data; the helper suppresses body samples on success, but future failed smoke output should still be reviewed before sharing.

## Commit Note

This report is part of the Step 114 commit. The final commit hash is available from `git log -1 --oneline` after commit.

## Recommended Next Step

Commit the exact Step 114 files, then proceed to a focused prelaunch browser/performance remeasurement or another no-DB technical hardening step. Do not retry authenticated admin QA until the secure credential-entry path is available.
