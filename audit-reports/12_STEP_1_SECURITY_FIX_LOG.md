# Step 1 Security Fix Log

Date: 2026-06-02

## Files changed

- `src/app/(store)/order/[orderNumber]/confirmation/page.tsx`
- `src/backend/security/request-guard.ts`
- `src/backend/security/rate-limit.ts`
- `src/backend/admin/image-processing.ts`
- `src/backend/admin/admin-utils.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/reviews/route.ts`
- `src/app/api/returns/route.ts`
- `src/app/api/contact/route.ts`
- `src/app/api/newsletter/route.ts`
- `src/app/api/products/[id]/view/route.ts`
- `src/app/api/account/profile/route.ts`
- `src/app/api/account/addresses/route.ts`
- `src/app/api/account/addresses/[id]/route.ts`
- `src/app/api/admin/products/route.ts`
- `src/app/api/admin/products/[id]/route.ts`
- `src/app/api/admin/categories/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/app/api/admin/banners/route.ts`
- `src/app/api/admin/banners/[id]/route.ts`
- `src/app/api/admin/coupons/route.ts`
- `src/app/api/admin/coupons/[id]/route.ts`
- `src/app/api/admin/flash-sales/route.ts`
- `src/app/api/admin/flash-sales/[id]/route.ts`
- `src/app/api/admin/content/route.ts`
- `src/app/api/admin/content/[id]/route.ts`
- `src/app/api/admin/settings/route.ts`
- `src/app/api/admin/orders/[id]/status/route.ts`
- `src/app/api/admin/orders/[id]/payment-status/route.ts`
- `src/app/api/admin/inventory/products/[id]/route.ts`
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/api/admin/reviews/[id]/route.ts`
- `src/app/api/admin/returns/[id]/route.ts`
- `src/app/api/admin/notifications/route.ts`
- `src/app/api/admin/notifications/[id]/route.ts`
- `tests/request-guard.test.ts`
- `tests/image-upload-validation.test.ts`
- `audit-reports/12_STEP_1_SECURITY_FIX_LOG.md`

## Issues fixed

- P0 order confirmation privacy: the public confirmation page now requires an authenticated session and scopes the order query to the owning buyer unless the user is `ADMIN` or `SUPER_ADMIN`. Wrong-owner and unauthenticated access now receives `notFound()` and does not render delivery PII.
- P1 CSRF / Origin protection: added reusable mutation protection in `src/backend/security/request-guard.ts`. It validates unsafe methods with same-origin `Origin`, same-origin `Referer`, configured allowed origins, and trusted Fetch Metadata values. The helper is applied to custom mutation APIs for checkout, auth registration, account profile/address changes, reviews, returns, contact/newsletter, product view recording, and admin mutations.
- P1 image upload hardening: admin/product image uploads now validate allowlisted MIME types before processing, enforce an 8 MB byte cap, reject corrupt or mismatched images through Sharp metadata probing, enforce 8000 px max dimension and 24 MP decoded pixel cap, and return safe error messages. Existing resize and quality profiles were preserved.
- P2 admin audit log visibility: admin audit write failures are now logged with sanitized metadata instead of being silently swallowed. Old/new values, PII payloads, secrets, and raw database error messages are not logged.
- Rate limiter hardening: the in-memory limiter now sanitizes client header identifiers, prunes expired buckets, caps bucket growth, and emits standard rate-limit response headers on 429 responses.

## Issues not fixed

- No signed guest order confirmation token was added. Current checkout requires an authenticated user and creates non-guest orders, so owner/admin access control fixes the current exposure without a UX or schema change.
- No Redis/KV/distributed rate limiter was added. That requires infrastructure or package decisions outside this no-install step.
- No CSRF token strategy was added. Origin/Referer plus Fetch Metadata protection was selected as the smallest stack-compatible change that does not affect Google auth routes or existing same-origin form/API usage.
- SEO, performance optimization, seller marketplace routes, online payment enablement, and tracking API enablement were not touched per scope.

## Why anything was skipped

- Signed confirmation tokens were skipped because the current order API rejects unauthenticated checkout and sets `isGuestOrder: false`; adding guest confirmation tokens would change the UX contract.
- Redis/KV rate limiting was skipped because the user explicitly said not to install packages and not to require infrastructure changes in this step.
- NextAuth/Google auth routes were not modified to avoid breaking provider callback behavior.
- Database schema changes were not needed.

## Tests added or updated

- Added `tests/request-guard.test.ts` for same-origin allow, configured-origin allow, referer allow, cross-site block, missing-source production block, and origin normalization.
- Added `tests/image-upload-validation.test.ts` for valid allowlisted uploads, unsupported MIME rejection, corrupt image rejection, and MIME/decoded-format mismatch rejection.

## Validation commands run

- `npx tsx --test tests/request-guard.test.ts tests/image-upload-validation.test.ts`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `git diff --check`

## Validation results

- Focused tests: passed, 10 tests.
- Typecheck: passed after fixing one ES target regex issue and one Sharp output-format type issue.
- Lint: passed with no warnings or errors. `next lint` printed its upstream deprecation notice for Next.js 16.
- Full test suite: passed, 95 tests across 22 suites.
- Git whitespace check: passed. Git printed CRLF normalization warnings for touched files.
- Production build: not run, per instruction.

## Remaining risks

- The origin allowlist depends on correct deployment configuration for custom domains and proxies. `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_URL`, or `CSRF_ALLOWED_ORIGINS` should include every legitimate production origin.
- In production, unsafe mutations without `Origin`, `Referer`, or Fetch Metadata are blocked. Browser flows should continue to work, but non-browser API clients would need an approved origin or a future token strategy.
- The rate limiter remains per-process memory only. A production-ready fix should use Redis/KV with atomic increment, TTL, trusted proxy handling, and shared limits across instances.
- Audit log failures are observable in server logs but do not currently fail the admin mutation. Add alerting or controlled blocking later if compliance requires audit-log write guarantees.
- If guest checkout is introduced later, order confirmation must use a signed short-lived token tied to the order and PII scope.

## Visuals changed

No.

## Exact next recommended step

Send this Step 1 patch for security review and retest the order confirmation URL, CSRF/origin blocked requests, and admin image uploads in a staging environment. Then proceed to the next recovery-roadmap step only after review, with seller marketplace, payments, tracking, SEO, and performance still disabled until their prerequisites are implemented.
