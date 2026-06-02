# Step 43: API Validation-First Contract Tests Log

Date: 2026-06-02

## 1. Scope of Step 43

Added more no-database API contract tests for validation-first and guard-first branches that return before Prisma/database lookup, authenticated DB state, payment, tracking, seller, or product lifecycle behavior.

This was a tests-only step. No API response standardization was implemented.

Local PostgreSQL is still not ready, so DB/product lifecycle/authenticated DB-backed testing remains paused.

## 2. Files Changed

Changed in this Step 43 task:

- `tests/api-error-contract.test.ts`
- `audit-reports/43_API_VALIDATION_FIRST_CONTRACT_TESTS_LOG.md`

No production API route, frontend/admin caller, helper implementation, database, schema, migration, footer, payment-logo, visual styling, payment, tracking, seller, or product lifecycle file was changed.

## 3. Tests Added or Extended

Extended `tests/api-error-contract.test.ts`.

Focused command:

```bash
npx tsx --test tests/api-error-contract.test.ts
```

Result: passed; 17 tests, 0 failures.

New coverage added in Step 43:

- Production-style missing-source mutation guard response body/status.
- Rate limiter response body/header contract when unsafe forwarded identifiers fall back to the `unknown` client bucket.
- CSP report unsupported content-type response body/status.
- CSP report invalid report-shape response body/status.
- Contact invalid email response body/status.
- Contact invalid subject response body/status.
- Newsletter malformed JSON response body/status.
- Register missing-name response body/status.
- Register short-password response body/status.
- Coupon validation missing-code response body/status.
- Reviews `GET` missing `productId` response body/status.
- Reviews `POST` blocked-origin response body/status before auth or database access.

## 4. API Branches Covered

| Route/helper | Branch covered | Expected contract |
| --- | --- | --- |
| `protectMutationRequest(...)` | Cross-origin mutation blocked | `403`, `{ error: 'Invalid request origin' }` |
| `protectMutationRequest(...)` | Production missing source signal blocked | `403`, `{ error: 'Invalid request origin' }` |
| `rateLimit(...)` | Limit exceeded | `429`, `{ error: 'Too many requests. Please try again shortly.' }`, `Retry-After`, `X-RateLimit-*` headers |
| `rateLimit(...)` | Unsafe forwarded client identifiers | Same `429` contract after fallback to unknown client bucket |
| `POST /api/security/csp-report` | Collection disabled | `404`, `{ error: 'Not found' }` |
| `POST /api/security/csp-report` | Unsupported content type | `415`, `{ error: 'Unsupported content type' }` |
| `POST /api/security/csp-report` | Invalid JSON | `400`, `{ error: 'Invalid JSON' }` |
| `POST /api/security/csp-report` | Invalid report shape | `400`, `{ error: 'Invalid CSP report' }` |
| `POST /api/contact` | Missing fields | `400`, `{ error: 'All fields are required' }` |
| `POST /api/contact` | Invalid email | `400`, `{ error: 'Invalid email address' }` |
| `POST /api/contact` | Invalid subject | `400`, `{ error: 'Invalid subject' }` |
| `POST /api/newsletter` | Invalid email | `400`, `{ error: 'Invalid email address' }` |
| `POST /api/newsletter` | Malformed JSON | `400`, `{ error: 'Invalid email address' }` |
| `POST /api/auth/register` | Invalid input, missing name, short password | `400`, `{ error: 'Invalid input' }` |
| `GET /api/coupons/validate` | Missing coupon code | `400`, `{ error: 'Coupon code required' }` |
| `GET /api/reviews` | Missing `productId` | `400`, `{ error: 'productId required' }` |
| `POST /api/reviews` | Blocked origin | `403`, `{ error: 'Invalid request origin' }` |

## 5. API Branches Intentionally Skipped Because They Require DB/Authenticated State

Skipped:

- Contact success path, because it writes `contactMessage`.
- Newsletter success path, because it writes/upserts `newsletterSubscriber`.
- Register existing-email and success paths, because they query/create users, carts, and wishlists.
- Coupon valid/invalid/inactive/expired/minimum-order/restricted-cart paths after code is present, because they query `coupon` and possibly products.
- Reviews authenticated validation and success paths after guard/rate-limit, because they require auth and review/order/product DB state.
- Product list/view-count success and not-found paths, because they query products.
- Search suggestions with real query, because it queries categories/products.
- Orders, returns, account/profile/address, and admin CRUD/list/report routes, because they require auth and/or database state.
- Seller marketplace and product lifecycle flows, because those roadmap areas remain paused.

## 6. Confirmation No API Behavior/Response Shape/Status Code/Frontend Caller Was Changed

Confirmed.

Step 43 changed tests and the audit report only. It did not change:

- API response shapes
- API status codes
- route behavior
- frontend/admin callers
- `src/backend/types/api.ts`
- Step 42 response standardization behavior

## 7. Confirmation Prohibited Files Were Not Touched

Step 43 did not touch:

- database code
- Prisma schema
- migrations
- seed/reset/db-push scripts
- footer files
- newsletter visual layout
- payment-logo assets
- visual/UI styling files
- payment backend
- tracking API
- seller marketplace
- product lifecycle schema/status behavior

Specifically not touched in Step 43:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `src/backend/types/api.ts`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `public/assets/payments/**`

Note: the broader worktree still contains earlier uncommitted roadmap changes, including footer/payment-logo files from prior steps, but Step 43 did not edit them.

## 8. Validation Results

| Command | Result |
| --- | --- |
| `npx tsx --test tests/api-error-contract.test.ts` | Passed; 17 tests, 0 failures. |
| `npm run db:url:safety` | Passed; no database connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js printed the standard `next lint` deprecation notice. |
| `npm test` | Passed; 168 tests, 30 suites, 0 failures. |
| `npm run build` | Passed. |

## 9. Remaining Risks

- Full API contract coverage remains blocked until local PostgreSQL and a local shadow database are ready.
- Authenticated buyer/admin API branches are still not covered by real local DB-backed tests.
- Current API response shapes remain intentionally route-specific.
- Some frontend callers still do not check `res.ok` for product list endpoints.
- Checkout still depends on top-level `orderNumber` and throws `data.error` directly.
- Rate limiting remains in-memory and per-process.

## 10. Recommended Next Step

Set up local PostgreSQL plus a local shadow database, then add DB-backed authenticated API contract tests. If database setup remains paused, continue with additional no-DB validation/helper tests only, without changing API behavior.
