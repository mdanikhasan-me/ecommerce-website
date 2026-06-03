# Step 113 - Security Runtime Boundary Sweep

## Scope

Step 113 performed a larger prelaunch security/runtime boundary sweep after Step 112. The sweep covered:

- Public/private route access boundaries.
- API error leakage and raw internal error regression risk.
- Request guard and rate-limit coverage for recently hardened public and buyer APIs.

No payment, tracking, seller marketplace, product lifecycle migration, CSP enforcement, footer/newsletter visual work, payment-logo work, category asset work, or mobile app implementation was performed.

## Initial Git State

- Initial latest commit verified: `b349cf4 test: cover payment tracking and buyer api boundaries`
- Initial staged set: empty.
- Initial dirty files before Step 113 edits: clean.

## Step 112 Verification

Step 112 was present as the latest commit before this work began:

- `b349cf4 test: cover payment tracking and buyer api boundaries`

This confirmed the previous payment/tracking/buyer API boundary test step was committed before Step 113 started.

## Flash Deals Removal Verification

Flash Deals remains removed:

- `/api/admin/flash-sales` returned `404` in dev and production smoke checks.
- `/deals` returned `404` in dev and production smoke checks.
- No active Flash Deals route/functionality was restored.
- No Baby & Kids category asset was restored.

## Authenticated Admin Blocker Handling

Authenticated admin QA remains externally blocked because no safe admin credentials/session were provided in this step.

The unauthenticated boundary was verified instead:

- `/admin/dashboard` redirects to login.
- `/admin/flash-sales` redirects to login as part of the protected admin route family.
- `/api/admin/flash-sales` remains `404`.

No credential retries, secret requests, password changes, or session bypasses were attempted.

## Route Access Boundary Findings

Source-level tests now guard the intended route boundaries:

- `/admin` and `/account` route families remain protected by middleware.
- Middleware continues checking Auth.js session token cookie names.
- Protected routes redirect unauthenticated users to `/auth/login` with callback behavior.
- `/checkout` redirects unauthenticated users to `/auth/login?callbackUrl=/checkout&reason=checkout`.
- Order confirmation remains noindex and scoped to the owner or admin access before sensitive order data is shown.
- Private and utility route families stay out of sitemap discovery and are disallowed in robots policy.

Smoke verification covered:

- `/`
- `/auth/login`
- `/account/orders`
- `/checkout`
- `/cart`
- `/track-order`
- `/order/BLB-INVALID-STEP113/confirmation`
- `/admin/dashboard`
- `/admin/flash-sales`
- `/api/admin/flash-sales`
- `/deals`
- `/sitemap.xml`
- `/robots.txt`

## API Error Leakage Findings

No selected public/buyer JSON API smoke response exposed raw internal error objects, stack traces, full database URLs, secrets, or raw request data.

Source-level tests now scan selected public/buyer API route files for obvious unsafe response patterns such as:

- `error.message` returned directly.
- `String(error)` returned directly.
- `JSON.stringify(error)` returned directly.
- `.stack` references in public/buyer route responses.
- obvious database URL or bearer-token strings.

Development smoke produced a broad raw-leak flag for some HTML pages due framework/static HTML text. This was treated as not meaningful for JSON API response leakage. JSON API bodies checked during dev and production smoke were clean.

## Request Guard And Rate-Limit Findings

The following public and buyer mutation APIs are now covered by source-level guardrail tests for both origin protection and rate-limit usage:

- `POST /api/contact` with `contact:create`
- `POST /api/newsletter` with `newsletter:create`
- `POST /api/auth/register` with `auth:register`
- `POST /api/reviews` with `reviews:create`
- `POST /api/orders` with `orders:create`
- `POST /api/returns` with `returns:create`
- `POST /api/products/[id]/view` with `products:view`

GET-only public APIs remain outside mutation guard response contracts:

- `GET /api/coupons/validate`
- `GET /api/products`
- `GET /api/search/suggestions`

## Source Fixes Made

Two small runtime hardenings were made:

1. `src/app/api/products/[id]/view/route.ts`
   - Added shared `rateLimit` protection after `protectMutationRequest`.
   - Uses key `products:view`, limit `120`, window `60_000ms`.

2. `src/app/api/returns/route.ts`
   - Added shared `rateLimit` protection after `protectMutationRequest`.
   - Uses key `returns:create`, limit `10`, window `60_000ms`.

Both changes preserve existing business logic and response shapes, adding only the shared abuse-path `429` response.

## Tests Added Or Updated

Updated:

- `tests/api-error-contract.test.ts`

Added coverage for:

- Contact, newsletter, and register blocked-origin branches.
- Product view blocked-origin branch.
- Product view rate-limit branch before product lookup.
- Return request rate-limit branch before authenticated/deeper work.

Added:

- `tests/security-runtime-boundary.test.ts`

Coverage includes:

- Middleware route-family protection.
- Checkout auth redirect.
- Order confirmation owner/admin/noindex source contract.
- Robots/sitemap private route exclusions.
- Mutation route origin-guard/rate-limit source coverage.
- GET-only public API mutation-guard exclusions.
- Public/buyer route source checks for obvious unsafe error leakage patterns.

## No Real Mutation Confirmation

No real orders, returns, payments, tracking events, seller marketplace actions, admin changes, migrations, seeds, reset commands, destructive SQL, or deployments were performed.

Smoke checks only exercised blocked, unauthenticated, invalid, or read-only paths.

## Dev Smoke Result

Development smoke ran against a temporary local dev server at `127.0.0.1:3110`.

Results:

- `/` - `200`
- `/auth/login` - `200`, noindex present
- `/account/orders` - `307` to login
- `/checkout` - `307` to login with checkout reason
- `/cart` - `200`
- `/track-order` - `200`, noindex present
- `/order/BLB-INVALID-STEP113/confirmation` - `404`, noindex present
- `/admin/dashboard` - `307` to login
- `/admin/flash-sales` - `307` to login
- `/api/admin/flash-sales` - `404`
- `/deals` - `404`
- `/api/coupons/validate?code=SAVE500&amount=not-a-number` - `400`, safe JSON
- `/api/reviews?productId=..%2F..%2Fbad` - `400`, safe JSON
- `/api/search/suggestions?q=%00%20a` - `200`, safe JSON
- `POST /api/orders` malformed/unauthenticated - `401`, safe JSON
- `POST /api/returns` malformed/unauthenticated - `401`, safe JSON
- `POST /api/contact` blocked origin - `403`, safe JSON
- `POST /api/newsletter` blocked origin - `403`, safe JSON
- `/sitemap.xml` - `200`
- `/robots.txt` - `200`

The temporary dev server was stopped.

## Production Smoke Result

Production smoke ran against a temporary local production server at `127.0.0.1:3111`.

Results matched the intended boundary behavior:

- Public pages rendered or redirected as expected.
- Account, checkout, and admin unauthenticated paths redirected to login.
- Invalid order confirmation did not expose PII.
- `/api/admin/flash-sales` remained `404`.
- `/deals` remained `404`.
- Malformed public/buyer API requests returned safe JSON.
- Blocked-origin public mutation requests returned safe JSON.
- No API JSON raw-leak signal was found.

The temporary production server was stopped.

## Validation Results

Commands run:

- `npm run db:url:safety` - passed.
- `npm run db:prisma:local:validate` - passed.
- `npm run db:prisma:local:generate` - passed.
- `npm run typecheck` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 259 tests.
- `npm run build` - passed.
- Fresh post-dev `npm run build` - passed.

## Files Changed

- `src/app/api/products/[id]/view/route.ts`
- `src/app/api/returns/route.ts`
- `tests/api-error-contract.test.ts`
- `tests/security-runtime-boundary.test.ts`
- `audit-reports/113_SECURITY_RUNTIME_BOUNDARY_SWEEP.md`

Temporary smoke logs were cleaned and were not staged.

## Files Intentionally Untouched

The following areas were intentionally untouched:

- `.env` and `.env.local`
- Prisma schema and migrations
- Docker files and SQL files
- Payment backend
- Tracking API
- Seller marketplace
- Product lifecycle schema
- CSP enforcement/default collection
- Distributed rate limiting
- Footer and newsletter visual files
- Payment-logo assets
- Category image assets
- `src/frontend/components/home/PromoSection.tsx`
- Baby & Kids category asset
- Mobile app implementation

## Prohibited Actions Check

Not performed:

- No secrets printed.
- No full DB URLs printed.
- No migrations, `db push`, seed, reset, or SQL commands run.
- No Docker commands run.
- No deployment.
- No real payment/tracking/order/return mutation flow.
- No paused visual/assets files staged or edited.

## Remaining Risks

- Authenticated admin browser QA remains blocked without a safe admin login/session.
- In-memory rate limiting is still not production-distributed.
- DB-backed authenticated API tests still depend on local DB/service readiness.
- The new source-level boundary tests are guardrails, not a full substitute for exhaustive browser/E2E coverage.
- Future route additions must continue adding request-guard/rate-limit coverage where applicable.

## Commit Note

This report is part of the Step 113 commit. The final commit hash is available from `git log -1 --oneline` after the commit is created.

## Recommended Next Step

Commit the exact Step 113 files, then continue with a focused follow-up only after reviewing the remaining worktree state.
