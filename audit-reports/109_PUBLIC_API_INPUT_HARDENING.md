# Step 109 Public API Input Hardening

## 1. Initial Git State

- `git status --short` before edits: clean.
- `git diff --cached --name-only` before edits: no staged files.
- Latest commit before Step 109: `724313a fix: harden catalog query parameters`.

## 2. Step 108 Commit Verification

Step 108 was verified as the latest completed commit:

- `724313a fix: harden catalog query parameters`

## 3. Flash Deals Removal Verification

Flash Deals removal remains intact.

- Active source scan found no revived Flash Deals storefront/admin implementation.
- Remaining Flash references are historical migrations or removal/negative tests.
- `/deals` returned `404` in dev and production smoke.
- `/api/admin/flash-sales` returned `404` in dev and production smoke.

## 4. Authenticated Admin Blocker Handling

Authenticated admin desktop/mobile QA was not retried. Steps 102-104 already proved the secure credential-entry path is externally blocked, so this step kept admin auth QA out of scope.

## 5. Public API Surface Inventory

Inventoried API route files under `src/app/api` and searched parsing/validation patterns across `src/app/api`, `src/backend`, and `tests`.

Classified findings:

- Already hardened by Steps 107-108: `/search`, `/category/[slug]`, and `/api/products` pagination/filter parsing.
- Hardened in Step 109: `/api/coupons/validate`, `/api/reviews`, `/api/search/suggestions`, `/api/products/[id]/view`, and review payload product IDs.
- Already adequate for this scope: `/api/contact`, `/api/newsletter`, `/api/auth/register` validation-first branches.
- Out of scope: account APIs, order/return mutations after auth, admin/private APIs, payment/tracking/seller/lifecycle integrations.

## 6. Root Causes Found

- `/api/coupons/validate` used `parseFloat` directly for `amount`, allowing malformed values to become `NaN` and bypass minimum-order checks.
- `/api/coupons/validate` accepted unbounded coupon code and product ID list input.
- `/api/reviews` GET accepted raw `productId` before DB lookup.
- Review POST payload validation accepted unbounded/raw product IDs once a user is authenticated.
- `/api/search/suggestions` accepted unbounded query text and unlimited search words before DB query construction.
- `/api/products/[id]/view` accepted raw route IDs before DB lookup.

## 7. Hardening Implementation

Added `src/backend/api/public-input.ts` with dependency-free parsers for:

- Public IDs.
- Public ID lists.
- Coupon codes.
- Coupon amounts.
- Public search query text.
- Public search words.

Updated routes/helpers:

- Coupon validation now rejects malformed/negative amount before database lookup and caps huge amounts.
- Coupon validation now normalizes safe coupon codes and caps/sanitizes product ID lists.
- Review GET now validates product IDs before database lookup.
- Review payload validation now rejects unsafe or overly long product IDs.
- Search suggestions now bounds query text and limits unique words.
- Product view counting now returns the existing `Product not found` response for invalid route IDs before database lookup.

## 8. API Response Shape Preservation

Preserved existing route contracts where practical:

- Coupon missing-code response remains `{ error: 'Coupon code required' }`.
- Coupon validation failures with a code continue using `{ success: false, error }`.
- Review GET invalid/missing product ID response remains `{ error: 'productId required' }`.
- Product view invalid ID uses the existing not-found shape `{ error: 'Product not found' }`.
- Search suggestions still returns `{ suggestions: [] }` for too-short sanitized input.
- No frontend/admin callers were changed.

## 9. Tests Added / Updated

Added `tests/public-input.test.ts`.

Updated:

- `tests/api-error-contract.test.ts`
- `tests/review-validation.test.ts`

No-DB coverage added for:

- Invalid coupon amount before DB lookup.
- Malformed coupon product IDs with missing-code branch.
- Invalid review product ID before DB lookup.
- Short sanitized search suggestion query before DB lookup.
- Invalid product-view route ID before DB lookup.
- Public ID parsing/capping.
- Coupon code and amount parsing.
- Public search query/word capping.
- Review payload product ID validation.

## 10. Dev Smoke Results

Dev server on `127.0.0.1:3147`:

- `GET /api/coupons/validate?amount=1000` -> `400`.
- `GET /api/coupons/validate?code=SAVE500&amount=not-a-number` -> `400`, invalid amount JSON present.
- `GET /api/coupons/validate?code=SAVE500&amount=-5` -> `400`, invalid amount JSON present.
- `GET /api/coupons/validate?code=bad%20code&amount=1000` -> `400`.
- `GET /api/reviews` -> `400`, product ID required JSON present.
- `GET /api/reviews?productId=..%2F..%2Fbad` -> `400`, product ID required JSON present.
- `GET /api/search/suggestions?q=%00%20a` -> `200`, suggestions JSON present.
- `POST /api/products/bad%24id/view` -> `404`, product not found JSON present.
- `GET /api/products?page=not-a-number&limit=bad` -> `200`.
- `GET /search?q=phone&page=not-a-number&minPrice=bad` -> `200`.
- `GET /deals` -> `404`.
- `GET /api/admin/flash-sales` -> `404`.
- `GET /sitemap.xml` -> `200`.
- `GET /robots.txt` -> `200`.

No 500 responses were observed.

## 11. Production Smoke Results

Production server on `127.0.0.1:3148`:

- `GET /api/coupons/validate?code=SAVE500&amount=not-a-number` -> `400`, invalid amount JSON present.
- `GET /api/reviews?productId=..%2F..%2Fbad` -> `400`, product ID required JSON present.
- `GET /api/search/suggestions?q=%00%20a` -> `200`, suggestions JSON present.
- `POST /api/products/bad%24id/view` -> `404`, product not found JSON present.
- `GET /api/products?page=not-a-number&limit=bad` -> `200`.
- `GET /search?q=phone&page=not-a-number&minPrice=bad` -> `200`.
- `GET /deals` -> `404`.
- `GET /api/admin/flash-sales` -> `404`.
- `GET /sitemap.xml` -> `200`.
- `GET /robots.txt` -> `200`.

No 500 responses were observed.

## 12. Validation Results

- `npm run db:url:safety` -> passed; no database connection attempted.
- `npm run db:prisma:local:validate` -> passed.
- `npm run db:prisma:local:generate` -> passed.
- `npm run typecheck` -> passed.
- `npm run lint` -> passed.
- `npm test` -> passed, `220` tests.
- `npm run build` -> passed.

## 13. Files Changed

- `src/backend/api/public-input.ts`
- `src/app/api/coupons/validate/route.ts`
- `src/app/api/products/[id]/view/route.ts`
- `src/app/api/reviews/route.ts`
- `src/app/api/search/suggestions/route.ts`
- `src/backend/reviews.ts`
- `tests/api-error-contract.test.ts`
- `tests/review-validation.test.ts`
- `tests/public-input.test.ts`
- `audit-reports/109_PUBLIC_API_INPUT_HARDENING.md`

## 14. Files Intentionally Left Untouched

- Footer/newsletter visual work.
- Payment-logo visual assets.
- Category image assets.
- `src/frontend/components/home/PromoSection.tsx`.
- Payment, tracking, seller marketplace, product lifecycle migration, CSP enforcement, distributed rate limiting, mobile app implementation.
- Authenticated admin password/session flows.
- Prisma schema and migrations.
- Frontend/admin callers and response-shape standardization work.

## 15. Prohibited Files / Actions Check

Not performed:

- No migrations, seed, reset, db push, destructive SQL, Docker setup, deploy, GitHub/fetch/pull/remote restore.
- No secrets, full DB URLs, tokens, passwords, cookies, session artifacts, payment secrets, or customer/order PII printed.
- No visual/assets files staged, modified, restored, deleted, regenerated, or renamed.
- No payment/tracking/seller/product-lifecycle features enabled.

## 16. Remaining Risks

- Order creation and return request input validation have authenticated DB-backed branches that should be reviewed in a separate authenticated-flow step.
- Coupon validation with valid codes still requires DB-backed test coverage once local authenticated/seeded DB testing is formally in scope.
- Search suggestions with long but valid queries is parser-covered and smoke-tested only for the short sanitized no-DB branch.
- Authenticated admin browser QA remains externally blocked.

## 17. Recommended Next Step

Proceed to a scoped authenticated buyer order/return validation audit only after confirming whether local seeded DB state should be used, or pause for manual review and commit grouping verification.

## 18. Commit Hash

Step 109 commit hash is available after commit from:

```bash
git log -1 --oneline
```
