# Step 41: API Error Contract and Response-Shape Test Plan

Date: 2026-06-02

## Scope

Completed a non-database API error/response contract readiness pass. This step mapped current API response shapes, documented inconsistencies, and added focused no-DB tests for security/validation response contracts.

Local PostgreSQL is still not ready, so DB/product lifecycle/authenticated DB-backed testing remains paused.

## Files Changed

Changed in this Step 41 task:

- `tests/api-error-contract.test.ts`
- `audit-reports/41_API_ERROR_CONTRACT_TEST_PLAN.md`

No production route behavior or helper behavior was changed.

## Current API Response Shape Map

### Success Responses

Current success responses are route-specific rather than a single shared envelope:

| Area | Current shape |
| --- | --- |
| Public contact/newsletter | `{ success: true }` |
| Auth register | `{ success: true, userId }` with `201` |
| Product list | `{ items, total, page, limit, totalPages }` |
| Product view counter | `{ success: true, counted }` |
| Search suggestions | `{ suggestions }` |
| Reviews | `POST` returns `{ success: true, review, stats }`; `GET` returns `{ reviews }` |
| Orders | `GET` returns `{ items, total, page, totalPages }`; `POST` returns `{ success: true, orderId, orderNumber, subtotal, shippingFee, discount, total }` |
| Returns | `{ request }` with `201` |
| Account/profile/address | `{ user }`, `{ address }`, or `{ success: true }` |
| Admin CRUD | resource wrappers such as `{ product }`, `{ category }`, `{ user }`, `{ settings }`, `{ returns }`, `{ notifications }`, plus `{ success: true }` mutation results |
| Admin report export | `text/csv` response, not JSON |
| CSP report endpoint | `204` with no response body on accepted reports |

### Error Responses

| Condition | Current common shape | Status notes |
| --- | --- | --- |
| Validation error | `{ error: string }` | Usually `400`; route-specific messages are preserved. |
| Unauthorized | `{ error: string }` | Buyer/account routes usually `401`; some admin catch paths return `403` for `Unauthorized`. |
| Forbidden | `{ error: string }` | Usually `403` for policy failures such as invalid return eligibility or review eligibility. |
| Not found | `{ error: string }` | Usually `404`, for example `Product not found`, `Order not found`, `Return request not found`. |
| Conflict | `{ error: string }` | Usually `409` for duplicate return request or stock/flash-sale conflicts. Some duplicate review/coupon cases still use `400`. |
| Rate limited | `{ error: 'Too many requests. Please try again shortly.' }` | `429` with `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`. |
| CSRF/origin blocked | `{ error: 'Invalid request origin' }` | `403`. |
| CSP report collection disabled | `{ error: 'Not found' }` | `404`. |
| CSP report invalid input | `{ error: string }` | `400`, `413`, or `415`. |
| Unknown server error | `{ error: string }` | Generic/sanitized fallbacks after Step 40; no raw internal messages should be returned. |

## Inconsistencies Found

- `src/backend/types/api.ts` defines a generic `ApiResponse<T>` shape with `success`, `data`, `error`, and `message`, but most app routes use ad hoc JSON shapes instead of that shared type.
- Most errors use `{ error: string }`, while coupon validation uses `{ success: false, error: string }` for several failure states.
- Success responses are intentionally route-specific and do not consistently include `success: true`.
- Admin report export returns CSV, while most other API success paths return JSON.
- CSP report success returns `204` with no body, which is correct for report ingestion but differs from JSON success responses.
- Unauthorized status semantics vary: buyer/account routes generally use `401`, while some admin mutation catch paths preserve existing `403` behavior for unauthorized admin access.
- Duplicate-like conditions are not uniform: return duplicate uses `409`, while duplicate review and invalid coupon states use `400`.
- Rate-limited responses include standard rate-limit headers, while most other errors do not include machine-readable error codes.

No broad standardization was implemented in this step because that would be a behavior contract change for frontend/admin callers.

## Tests Added / Updated

Added:

- `tests/api-error-contract.test.ts`

Coverage added:

- Mutation request guard returns stable `403` JSON: `{ error: 'Invalid request origin' }`.
- Rate limiter returns stable `429` JSON plus `Retry-After` and `X-RateLimit-*` headers.
- CSP report endpoint returns disabled-by-default `404` JSON: `{ error: 'Not found' }`.
- CSP report endpoint returns enabled invalid-JSON `400` JSON: `{ error: 'Invalid JSON' }`.
- Contact API validation returns `{ error: 'All fields are required' }` before database writes.
- Newsletter API validation returns `{ error: 'Invalid email address' }` before database writes.
- Register API validation returns `{ error: 'Invalid input' }` before database lookup.

Focused command:

```bash
npx tsx --test tests/api-error-contract.test.ts tests/client-error.test.ts tests/csp-report.test.ts tests/request-guard.test.ts
```

Result: passed; 25 tests, 0 failures.

## Helper Changes

None.

Existing helpers retained:

- `src/backend/security/client-error.ts`
- `src/backend/security/request-guard.ts`
- `src/backend/security/rate-limit.ts`
- `src/backend/security/csp-report.ts`

## Behavior Changes

None.

This step added tests and documentation only. It did not change API status codes, response bodies, redirect behavior, database queries, validation logic, or frontend behavior.

## Recommended Future API Response Standard

Recommended next standard, to be implemented only in a later compatibility-aware pass:

- Use `{ error: string }` as the stable minimum failure shape.
- Add optional machine-readable `code` later only after frontend/admin callers are reviewed.
- Keep route-specific validation messages where they are safe and user-actionable.
- Use generic fallback messages for unknown server errors.
- Do not return raw `error.message`, stack traces, Prisma/database errors, full URLs with query strings, request bodies, cookies, auth headers, tokens, phone numbers, delivery addresses, or payment data.
- Preserve `204` no-body responses where the protocol expects no body, such as CSP report ingestion.
- Preserve non-JSON success responses where appropriate, such as CSV exports.
- Standardize duplicate/conflict status codes in a later behavior-aware pass.
- Standardize admin unauthorized `401` versus `403` behavior only after UI expectations are checked.

## Routes Intentionally Not Tested Because DB Is Unavailable

Skipped no-DB route execution for DB-backed success paths and authenticated flows:

- `GET /api/products`
- `GET /api/search/suggestions` with real search input
- `GET /api/reviews?productId=...`
- `POST /api/reviews` beyond guard/auth/validation review
- `GET /api/orders`
- `POST /api/orders` beyond documented early validation branches
- `POST /api/returns` authenticated DB-backed branches
- account profile/address success paths
- admin CRUD/list/report routes that require admin session and database data
- coupon validation beyond missing-code shape, because valid/invalid coupon lookup is DB-backed

These should be tested after local PostgreSQL and a local shadow database are ready.

## Validation Commands Run

| Command | Result |
| --- | --- |
| `npx tsx --test tests/api-error-contract.test.ts tests/client-error.test.ts tests/csp-report.test.ts tests/request-guard.test.ts` | Passed; 25 tests, 0 failures. |
| `npm run db:url:safety` | Passed; no database connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js printed the standard `next lint` deprecation notice. |
| `npm test` | Passed; 158 tests, 30 suites, 0 failures. |
| `npm run build` | Passed. |

## Production Build Result

Passed.

Next.js compiled successfully and generated the existing 76 static pages.

## Confirmation of Prohibited Files Not Touched

Step 41 did not touch database, Prisma schema, migration, seed/reset/db-push command, footer file, payment-logo asset, visual/UI styling file, seller marketplace implementation, payment backend integration, tracking API integration, product lifecycle schema, or unrelated feature behavior.

Specifically not touched in Step 41:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `public/assets/payments/**`

Note: the broader worktree still contains earlier uncommitted roadmap changes, including footer/payment-logo files from prior steps, but Step 41 did not edit them.

## Remaining Risks

- Full API contract coverage is not possible until local PostgreSQL is ready.
- Authenticated buyer/admin route behavior still needs browser/API verification against local data.
- Current API success envelopes remain intentionally inconsistent and route-specific.
- Conflict status codes are not fully standardized.
- The generic `ApiResponse<T>` type exists but is not the actual app-wide route contract.
- Future routes must keep using sanitized client error helpers for unknown server failures.

## Recommended Next Step

Proceed with a compatibility-aware API response standardization plan, or set up local PostgreSQL plus local shadow database so DB-backed authenticated API contract tests can be added safely.
