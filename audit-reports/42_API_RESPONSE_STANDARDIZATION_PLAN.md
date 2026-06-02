# Step 42: API Response Standardization Plan

Date: 2026-06-02

## Scope

Completed a compatibility-aware planning pass for future API response standardization. This step mapped frontend/admin API consumers and classified routes by standardization risk.

No API response shapes, status codes, route behavior, frontend callers, database code, schema files, or UI styling were changed.

Local PostgreSQL is still not ready, so DB/product lifecycle/authenticated DB-backed testing remains paused.

## Files Changed

Changed in this Step 42 task:

- `audit-reports/42_API_RESPONSE_STANDARDIZATION_PLAN.md`

Report-only step. No code or test files were changed.

## Frontend/Admin API Consumer Map

| Consumer | Route called | Expected success shape | Expected error shape | Status behavior | Depends on `success` | Depends on `error` | Depends on `message` | Custom field dependency |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/app/(store)/auth/register/page.tsx` | `POST /api/auth/register` | Only `res.ok` is used before credential sign-in. `userId` is not consumed. | `data.error` fallback to `Registration failed`. | `!res.ok` shows toast. | No | Yes | No | No |
| `src/app/(store)/cart/page.tsx` | `GET /api/coupons/validate` | `{ success: true, coupon }` | `data.error` fallback to `Invalid coupon`; also treats `!data.success` as failure. | `!res.ok || !data.success` shows toast. | Yes | Yes | No | `coupon.code`, coupon discount fields |
| `src/app/(store)/wishlist/page.tsx` | `GET /api/products?ids=...` | `{ items }` | No visible error handling. | Does not check `res.ok`. | No | No | No | `items` |
| `src/app/(store)/compare/page.tsx` | `GET /api/products?ids=...&limit=50` | `{ items }` | No visible error handling. | Does not check `response.ok`. | No | No | No | `items` |
| `src/frontend/components/layout/Header.tsx` | `GET /api/search/suggestions?q=...` | `{ suggestions }` | No body parsing on error. | `!res.ok` silently returns. | No | No | No | `suggestions` |
| `src/frontend/components/product/ProductDetailClient.tsx` | `POST /api/products/:id/view` | Response ignored. | Response ignored. | Fire-and-forget, errors swallowed. | No | No | No | No |
| `src/frontend/components/product/ReviewSection.tsx` | `POST /api/reviews` | Success only needs `res.ok`; payload not used. | `payload?.error` fallback to `Failed to submit review`. | `!res.ok` throws. | No | Yes | No | No |
| `src/frontend/components/content/ContactForm.tsx` | `POST /api/contact` | Success only needs `response.ok`. | `data.error` fallback to `Could not send message`. | `!response.ok` throws. | No | Yes | No | No |
| `src/frontend/components/layout/NewsletterForm.tsx` | `POST /api/newsletter` | Success only needs `res.ok`. | `data.error` fallback to `Could not subscribe`. | `!res.ok` throws. | No | Yes | No | No |
| `src/frontend/components/checkout/CheckoutClient.tsx` | `POST /api/orders` | `{ success: true, orderId, orderNumber, subtotal, shippingFee, discount, total }` | `data.error` is thrown directly. | `!res.ok` throws. | No | Yes | No | `orderNumber` for confirmation redirect |
| `src/frontend/components/account/ReturnRequestButton.tsx` | `POST /api/returns` | Success only needs `response.ok`. | `data.error` fallback to `Could not request return`. | `!response.ok` throws. | No | Yes | No | No |
| `src/frontend/components/account/AddressManager.tsx` | `POST /api/account/addresses`, `PUT /api/account/addresses/:id`, `DELETE /api/account/addresses/:id` | Success only needs `response.ok`. | `data?.error` fallback to address action messages. | `!response.ok` throws. | No | Yes | No | No |
| `src/frontend/components/account/ProfileForm.tsx` | `PUT /api/account/profile` | Success only needs `res.ok`. | Does not read API error body; uses fixed `Failed to update profile`. | `!res.ok` throws. | No | No | No | No |
| `src/app/(admin)/admin/settings/page.tsx` | `GET /api/admin/settings`, `PATCH /api/admin/settings` | `GET` needs `{ settings }`; `PATCH` only needs `res.ok`. | `data.error` fallback to settings messages. | `!response.ok`/`!res.ok` throws. | No | Yes | No | `settings` |
| Admin editor forms: category, banner, coupon, flash sale, homepage section, product | `/api/admin/categories`, `/api/admin/banners`, `/api/admin/coupons`, `/api/admin/flash-sales`, `/api/admin/content`, `/api/admin/products` create/update/delete routes | Usually only `response.ok`; delete responses sometimes include `{ deleted, archived }` but callers do not consume them today. | `data.error` fallback to feature-specific messages. | `!response.ok` throws. | No | Yes | No | No current success payload dependency |
| Admin user management | `PATCH /api/admin/users/:id` | Success only needs `response.ok`. | `data.error` fallback to `Could not update user`. | `!response.ok` throws. | No | Yes | No | No |
| Admin notifications | `POST /api/admin/notifications`, `PATCH/DELETE /api/admin/notifications/:id` | Composer needs `{ count }`; row actions only need `response.ok`. | `data.error` fallback to notification action messages. | `!response.ok` throws. | No | Yes | No | `count` for success toast |
| Admin inventory | `PATCH /api/admin/inventory/products/:id` | Success only needs `response.ok`. | `data.error` fallback to `Could not update inventory`. | `!response.ok` throws. | No | Yes | No | No |
| Admin return manager | `PATCH /api/admin/returns/:id` | Success only needs `response.ok`. | `data.error` fallback to `Could not update return request`. | `!response.ok` throws. | No | Yes | No | No |
| Admin review moderation | `PATCH /api/admin/reviews/:id` | Success only needs `res.ok`. | `data.error` fallback to `Could not moderate review`. | `!res.ok` throws. | No | Yes | No | No |
| Admin order status/payment status | `PATCH /api/admin/orders/:id/status`, `PATCH /api/admin/orders/:id/payment-status` | Success only needs `res.ok`/`response.ok`. | `data.error` fallback to order/payment status messages. | `!ok` throws. | No | Yes | No | No |

## Routes Safe to Standardize Later

Safe means the route appears to have callers that already rely on `response.ok` and `data.error`, and do not consume detailed success envelopes beyond `ok`.

- `POST /api/contact`: safe for preserving `{ error }`; success can remain `{ success: true }`.
- `POST /api/newsletter`: safe for preserving `{ error }`; success can remain `{ success: true }`.
- `POST /api/auth/register`: safe for failure shape `{ error }`; keep `201` and current `userId` until auth flow is retested.
- `POST /api/products/:id/view`: response ignored by caller; keep fire-and-forget behavior.
- Admin mutation failure shapes for products, categories, banners, coupons, flash sales, content, users, returns, reviews, inventory, order status, payment status, and settings: safe to keep `{ error }` and optionally add `code` later after tests.
- CSP report endpoint error shapes: safe to keep as currently tested; success should remain `204`.
- Request guard and rate limiter responses: safe to keep stable; optional `code` should be additive only.

## Routes Risky to Standardize

Risky means at least one caller depends on the current route-specific shape or status behavior.

- `GET /api/coupons/validate`: cart depends on `data.success`, `data.error`, and `data.coupon`. Do not remove `{ success: false, error }` without changing and testing the cart.
- `POST /api/orders`: checkout depends on `data.orderNumber` for redirect and throws `data.error` directly. Do not envelope success under `data` unless checkout is migrated and tested.
- `GET /api/products`: wishlist/compare depend on top-level `items` and do not check `res.ok`. Changing to `{ data: { items } }` would break them.
- `GET /api/search/suggestions`: header depends on top-level `suggestions`.
- `GET /api/admin/settings`: admin settings page depends on top-level `settings`.
- `POST /api/admin/notifications`: notification composer depends on top-level `count` for the success toast.
- Admin order status/payment status unauthorized behavior: some routes preserve `403` for `Unauthorized`; status changes need UI/auth testing.
- Duplicate/conflict status standardization: return duplicates use `409`, while duplicate review and invalid coupon states use `400`; changing these may affect UX or future client logic.

## Routes That Should Remain Route-Specific

- CSV/file responses, especially `GET /api/admin/reports/export`.
- CSP report accepted response: `204` with no body.
- Search suggestions: `{ suggestions }` is a compact query endpoint shape.
- Product list/search data: `{ items, total, page, limit, totalPages }` is a pagination contract.
- Order creation success: checkout needs direct order summary fields and `orderNumber`.
- Coupon validation success/failure: cart currently needs `success` and `coupon`.
- Admin report/dashboard-style data endpoints, because they are already domain-shaped.

## Routes That Need DB-Backed Testing First

- Authenticated buyer order APIs: `GET /api/orders`, `POST /api/orders`.
- Return request API: `POST /api/returns`.
- Account profile/address APIs.
- Product list/search/review/coupon APIs beyond validation-first branches.
- Admin CRUD/list/detail APIs.
- Admin report generation/export APIs.
- Admin notification, order status, payment status, inventory, return, and review moderation routes.
- Future seller marketplace APIs.
- Future product lifecycle status APIs.

## Routes That Should Not Change Before Other Roadmap Work

- Payment-related checkout/order behavior: online payment remains disabled.
- Seller marketplace routes: seller ownership and lifecycle controls are not implemented yet.
- Product lifecycle visibility/status behavior: migration is paused until local DB readiness.
- Tracking/view-count behavior: tracking API integration remains disabled.
- Coupon/order stock messages: preserve buyer-facing stock/coupon/cart messages until full checkout testing is possible.

## Recommended Future Response Standard

Use a practical compatibility standard, not a forced rewrite:

- Failure minimum: `{ error: string }`.
- Optional additive later: `{ error: string, code?: string }`.
- Do not use `message` for API errors unless all callers are migrated.
- Preserve `204` no-body responses.
- Preserve CSV/file responses.
- Preserve route-specific success payloads unless a frontend migration is explicitly planned.
- Preserve current top-level list fields such as `items`, `total`, `page`, `limit`, `totalPages`, and `suggestions`.
- Preserve buyer-facing stock, coupon, cart, review, return, and checkout validation messages.
- Unknown server errors must use generic sanitized fallback messages.
- Do not return raw `error.message`, stack traces, Prisma/database internals, full URLs with query strings, request bodies, cookies, auth headers, tokens, phone numbers, addresses, payment data, or secrets.
- Add shared helpers only as opt-in helpers for new or touched routes, not as a repo-wide forced migration.

## No-DB Test Opportunities

Can be added before local DB is ready:

- More `client-error.ts` cases for future `code` planning.
- Request guard same-origin, blocked origin, missing source header, and method coverage for actual `NextResponse` shapes.
- Rate-limit reset/header coverage and noisy-event boundaries.
- CSP report unsupported content type, invalid shape, and disabled/enabled response contracts are already covered, but can be extended for exact JSON bodies.
- Contact/newsletter validation-first branches.
- Auth/register validation branches for missing name, invalid email, short password, and origin/rate-limit response shapes.
- Coupon validate missing-code branch, because it returns before DB lookup.
- Review POST invalid-origin and rate-limit branches, if test isolation is carefully managed.

## DB-Backed Test Requirements

Blocked until local PostgreSQL plus local shadow database are ready:

- Product list and search response contracts with buyer-visible product filtering.
- Coupon valid/invalid/inactive/expired/minimum-order/restricted-cart flows.
- Checkout/order creation success and failure flows, including stock and flash-sale conflicts.
- Order list authenticated buyer/admin branches.
- Return request success, duplicate, not-delivered, and expired-window flows.
- Account profile/address save/delete flows.
- Admin product/category/banner/content/coupon/flash-sale CRUD success and not-found flows.
- Admin user role/self-protection branches.
- Admin report JSON and CSV export contracts.
- Admin notifications count and row-action contracts.
- Admin order status/payment status/inventory/review/return mutation contracts.

## Behavior Changes Made

None.

This step did not rewrite API responses, change route behavior, change status codes, change response shapes, or touch frontend callers.

## Validation Commands Run

| Command | Result |
| --- | --- |
| `npm run db:url:safety` | Passed; no database connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js printed the standard `next lint` deprecation notice. |
| `npm test` | Passed; 158 tests, 30 suites, 0 failures. |
| `npm run build` | Passed. |

## Production Build Result

Passed.

Next.js compiled successfully and generated the existing 76 static pages.

## Confirmation of Prohibited Files Not Touched

Step 42 did not touch database, Prisma schema, migration, seed/reset/db-push command, footer file, payment-logo asset, visual/UI styling file, seller marketplace implementation, payment backend integration, tracking API integration, product lifecycle schema, or unrelated feature behavior.

Specifically not touched in Step 42:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `public/assets/payments/**`

Note: the broader worktree still contains earlier uncommitted roadmap changes, including footer/payment-logo files from prior steps, but Step 42 did not edit them.

## Remaining Risks

- The API contract is documented but not centrally enforced.
- `src/backend/types/api.ts` still does not reflect the actual app-wide response contract.
- Some frontend callers do not check `res.ok` for product list endpoints.
- Checkout throws `data.error` directly; a missing error body could produce a weak message.
- Full compatibility proof requires DB-backed tests.
- Local DB readiness remains blocked.

## Recommended Next Step

Set up local PostgreSQL plus a local shadow database, then add DB-backed API contract tests before any response-shape standardization. If DB setup remains paused, the next safe non-DB task is adding more validation-first API contract tests without changing behavior.
