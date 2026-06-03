# Step 110: Buyer Order / Return Validation Audit

## 1. Scope

Step 110 focused on buyer order-flow validation hardening without enabling payment, tracking, seller marketplace, product lifecycle migration, or visual/UI changes.

In scope:

- Order creation input validation and pre-DB boundary checks.
- Return request input validation and pre-DB boundary checks.
- Order confirmation and track-order PII boundary review.
- Flash Deals removal verification.
- Non-destructive dev/prod smoke checks.

Out of scope:

- Real order creation.
- Payment or tracking integrations.
- Authenticated admin browser QA with unknown credentials.
- Prisma schema, migrations, seed/reset/db-push commands, or destructive SQL.
- Paused footer/newsletter/payment-logo/category image/PromoSection visual work.

## 2. Initial Git State

Commands run:

- `git status --short`
- `git diff --cached --name-only`
- `git log -1 --oneline`

Result:

- Working tree was clean at the start.
- No files were staged.
- Latest commit was `11dacf6 fix: harden public API inputs`.

## 3. Step 109 Verification

Step 109 was verified as the latest commit before Step 110 work began.

Relevant Step 109 protections remained present:

- Public input helper exists at `src/backend/api/public-input.ts`.
- Public API input tests exist at `tests/public-input.test.ts`.
- Product view, reviews, coupon validation, and search suggestions were already covered by public input hardening.

## 4. Authenticated Admin Blocker Handling

Authenticated admin QA was not retried in this step.

Reason:

- Prior workflow state kept admin password/session testing blocked unless explicit credentials/setup were provided.
- This step did not need admin session access.

## 5. Flash Deals Removal Verification

Commands run:

- `rg -n -i "flash deal|flash deals|flash sale|flash-sale|flashsale|flash_sale|FlashSale|FlashDeal" . --glob '!node_modules/**' --glob '!.next/**' --glob '!audit-reports/**' --glob '!package-lock.json'`
- `rg -n "/deals|all deals|shop deals|limited offers" src prisma tests README.md expanded-folders.txt project-folders.txt --glob '!node_modules/**' --glob '!.next/**'`

Result:

- Remaining Flash Deals references were limited to removal tests and historical/removal migrations.
- `/deals` returned 404 in dev and production smoke checks.
- `/api/admin/flash-sales` returned 404 in dev and production smoke checks.
- Flash Deals was not revived.

## 6. Buyer / Order-Flow Surface Inventory

Primary routes/pages found:

- `src/app/api/orders/route.ts`
- `src/app/api/returns/route.ts`
- `src/app/(store)/checkout/page.tsx`
- `src/app/(store)/cart` through smoke route
- `src/app/(store)/track-order/page.tsx`
- `src/app/(store)/order/[orderNumber]/confirmation/page.tsx`
- `src/app/(store)/account/orders/page.tsx`
- `src/app/(store)/account/orders/[id]/page.tsx`
- `src/frontend/components/checkout/CheckoutClient.tsx`
- `src/frontend/components/content/TrackOrderLookup.tsx`
- `src/frontend/components/account/ReturnRequestButton.tsx`

Existing related tests reviewed:

- `tests/api-error-contract.test.ts`
- `tests/return-validation.test.ts`
- `tests/order-update-validation.test.ts`
- `tests/public-input.test.ts`
- `tests/flash-deals-removal.test.ts`
- `tests/seo-policy.test.ts`

## 7. Order Creation Findings

Findings before Step 110 changes:

- `POST /api/orders` accepted client item quantities through `Number(...) || 0`, which could turn malformed values into quantity `1`.
- Product IDs and variant IDs were stringified and sent toward DB lookups without a safe public ID boundary.
- Coupon codes were uppercased inline but not constrained to the public coupon code pattern before DB lookup.
- Client-supplied `imageUrl` could be stored if it was any string.
- Delivery address fields were only truthy-checked before being trimmed/sliced.
- Malformed JSON after auth could fall into the generic catch path.

Fixes made:

- Added `parseBuyerOrderPayload()` in `src/backend/orders/buyer-validation.ts`.
- Validates payment method against active configured methods.
- Caps cart item count.
- Requires safe public product IDs and optional variant IDs.
- Requires finite integer quantities from `1` through `1000`.
- Rejects unsafe coupon codes before DB lookup.
- Normalizes and bounds delivery address fields.
- Normalizes optional notes.
- Drops unsafe client image URLs instead of storing arbitrary strings.
- Keeps order price, stock, coupon, and transaction logic server-side.

Response-shape preservation:

- Existing JSON failure shape remains `{ error: string }`.
- Existing success shape remains `{ success, orderId, orderNumber, subtotal, shippingFee, discount, total }`.
- Existing authenticated-user requirement remains before order body validation.
- Real order creation was not exercised.

## 8. Return Request Findings

Findings before Step 110 changes:

- `POST /api/returns` used zod for reason/description bounds.
- `orderId` was only required as a non-empty string and was not constrained to the safe public ID pattern before the owner-scoped DB lookup.
- Malformed JSON after auth could fall into the generic catch path.

Fixes made:

- Added `parseBuyerReturnRequestPayload()` in `src/backend/orders/buyer-validation.ts`.
- Validates `orderId` with the safe public ID parser before DB lookup.
- Keeps reason min/max and description max validation.
- Handles malformed JSON as a `400` validation error after auth.

Response-shape preservation:

- Existing JSON failure shape remains `{ error: string }`.
- Existing success shape remains `{ request }`.
- Existing owner lookup remains `where: { id, userId: session.user.id }`.
- Real return creation was not exercised.

## 9. Order Confirmation / Track-Order PII Boundary Findings

Order confirmation:

- `src/app/(store)/order/[orderNumber]/confirmation/page.tsx` still requires `auth()`.
- Unauthenticated users get `notFound()`.
- Authenticated customers are filtered by `userId`.
- `ADMIN` and `SUPER_ADMIN` are allowed.
- Delivery address PII is only loaded after the owner/admin check.
- Page metadata remains noindex.

Track order:

- `src/app/(store)/track-order/page.tsx` is a noindex page.
- `TrackOrderLookup` redirects to `/account/orders?orderNumber=...`.
- `/account/orders` requires authentication and filters only `userId: session.user.id`.
- No public order-by-number PII API was found.

Smoke result:

- Invalid order confirmation URL returned 404 in dev and production.
- Malformed track-order/account query redirected to login when unauthenticated.

## 10. Implementation Summary

Files changed:

- `src/backend/orders/buyer-validation.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/returns/route.ts`
- `tests/buyer-order-return-validation.test.ts`
- `tests/api-error-contract.test.ts`
- `audit-reports/110_BUYER_ORDER_RETURN_VALIDATION_AUDIT.md`

No files deleted.

## 11. Tests Added / Updated

Added:

- `tests/buyer-order-return-validation.test.ts`

Covered:

- Valid buyer order payload normalization.
- Active payment method requirement.
- Empty cart response.
- Unsafe product ID rejection.
- Unsafe variant ID rejection.
- Invalid coupon code rejection.
- Invalid, non-finite, fractional, and oversized quantity rejection.
- Cart item count cap.
- Unsafe client image URL stripping.
- Incomplete/oversized delivery address rejection.
- Valid return request normalization.
- Unsafe return `orderId` rejection.
- Out-of-bounds return reason/description rejection.

Updated:

- `tests/api-error-contract.test.ts`

Covered:

- Order creation blocked-origin branch returns before auth/database access.
- Return request blocked-origin branch returns before auth/database access.

Test count after Step 110:

- `230` tests passed.

## 12. Development Smoke Result

Command approach:

- Started local dev server on `127.0.0.1:3100`.
- Queried routes with non-destructive HTTP requests.
- Stopped the local dev server.

Results:

- `/checkout`: `307` to `/auth/login?callbackUrl=/checkout&reason=checkout`
- `/cart`: `200`
- `/order/BLB-INVALID-STEP110/confirmation`: `404`
- `/track-order`: `200`
- `/account/orders?orderNumber=..%2F..%2Fbad`: `307` to login
- `POST /api/orders` unauthenticated malformed body: `401`
- `POST /api/returns` unauthenticated malformed body: `401`
- `/deals`: `404`
- `/api/admin/flash-sales`: `404`
- `/sitemap.xml`: `200`
- `/robots.txt`: `200`

No real order, return, payment, tracking, or admin operation was performed.

## 13. Production Smoke Result

Command approach:

- Ran `npm run build`.
- Started local production server on `127.0.0.1:3101`.
- Queried routes with non-destructive HTTP requests.
- Stopped the local production server.

Results:

- `/checkout`: `307` to `/auth/login?callbackUrl=/checkout&reason=checkout`
- `/cart`: `200`
- `/order/BLB-INVALID-STEP110/confirmation`: `404`
- `/track-order`: `200`
- `/account/orders?orderNumber=..%2F..%2Fbad`: `307` to login
- `POST /api/orders` unauthenticated malformed body: `401`
- `POST /api/returns` unauthenticated malformed body: `401`
- `/deals`: `404`
- `/api/admin/flash-sales`: `404`
- `/sitemap.xml`: `200`
- `/robots.txt`: `200`

Note:

- The first prod smoke attempt was blocked by a harness/order issue: the dev server had replaced production `.next` artifacts. The dev server was stopped, `npm run build` was rerun successfully, and production smoke then passed.

## 14. Validation Results

Commands run:

- `npm run db:url:safety` - passed; no DB connection attempted; app and shadow DB URLs classified local and separate.
- `npm run db:prisma:local:validate` - passed.
- `npm run db:prisma:local:generate` - passed.
- `npm run typecheck` - passed after a narrow variant ID type guard fix.
- `npm run lint` - passed; only Next.js lint deprecation notice.
- `npm test` - passed, `230` tests.
- `npm run build` - passed.

## 15. Response Shape / Behavior Preservation

Preserved:

- Order creation still requires authentication before body validation.
- Return request still requires authentication before body validation.
- Order creation success response shape.
- Return request success response shape.
- `{ error: string }` failure response pattern.
- Existing owner/admin PII boundary on order confirmation.
- Existing owner-only account order lookup behavior.
- Existing payment disabled/available configuration.

Changed intentionally:

- Malformed/unsafe buyer order payloads now fail earlier with validation errors instead of being coerced into DB-backed behavior.
- Unsafe return `orderId` values now fail validation before owner-scoped DB lookup.
- Unsafe client image URLs are not stored on order items.

## 16. Files / Areas Intentionally Untouched

Not touched:

- Footer files.
- Newsletter visual files.
- Payment-logo assets.
- Category image assets.
- `src/frontend/components/home/PromoSection.tsx`
- Prisma schema.
- Prisma migrations.
- Seed/reset/db-push scripts.
- Payment backend integration.
- Tracking API integration.
- Seller marketplace implementation.
- Product lifecycle schema/status behavior.
- CSP enforcement.
- Distributed rate limiting.
- Authenticated admin credential/session setup.

## 17. Prohibited Action Check

Not run:

- Prisma migrations.
- `prisma db push`.
- Seed/reset commands.
- Destructive SQL.
- Docker commands.
- Deployment commands.
- GitHub/fetch/pull/remote restore commands.

No secrets, full DB URLs, tokens, passwords, cookies, payment secrets, or customer/order PII were printed in this report.

## 18. Remaining Risks

- Authenticated, DB-backed successful order creation was not performed to avoid creating real orders in this step.
- Authenticated, DB-backed successful return creation was not performed.
- Admin browser QA remains blocked until a known local admin credential/session path is approved.
- The order item quantity cap is now explicit at `1000`; if future wholesale workflows require larger quantities, the cap should be revisited deliberately.
- Track-order remains account-redirect based; future guest tracking would require a signed short-lived token design before exposing any delivery PII.

## 19. Recommended Next Step

Commit Step 110 with:

`fix: harden buyer order and return validation`

Then continue with a focused authenticated local DB flow plan only if local admin/customer test credentials and safe local DB data are intentionally prepared.
