# Step 40: Client Error Response Hygiene Log

Date: 2026-06-02

## Scope

Completed a focused non-database review and hardening pass for server/API/admin/report client-facing error responses. The goal was to prevent raw internal errors from reaching users while preserving response shapes, status codes, validation usability, and business logic.

Local PostgreSQL is still not ready, so DB/product lifecycle/authenticated DB-backed testing remains paused.

## Files Changed

Changed in this Step 40 task:

- `README.md`
- `src/backend/security/client-error.ts`
- `src/backend/admin/coupon-editor.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/api/admin/settings/route.ts`
- `src/app/api/admin/notifications/route.ts`
- `src/app/api/admin/notifications/[id]/route.ts`
- `src/app/api/admin/returns/route.ts`
- `src/app/api/admin/returns/[id]/route.ts`
- `src/app/api/admin/reports/route.ts`
- `src/app/api/admin/reports/export/route.ts`
- `src/app/api/admin/categories/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/app/api/admin/banners/route.ts`
- `src/app/api/admin/banners/[id]/route.ts`
- `src/app/api/admin/products/route.ts`
- `src/app/api/admin/products/[id]/route.ts`
- `src/app/api/admin/content/route.ts`
- `src/app/api/admin/content/[id]/route.ts`
- `src/app/api/admin/flash-sales/route.ts`
- `src/app/api/admin/flash-sales/[id]/route.ts`
- `src/app/api/admin/inventory/products/[id]/route.ts`
- `src/app/api/admin/reviews/[id]/route.ts`
- `src/app/api/admin/orders/[id]/payment-status/route.ts`
- `src/app/api/admin/coupons/[id]/route.ts`
- `tests/client-error.test.ts`
- `audit-reports/40_CLIENT_ERROR_RESPONSE_HYGIENE_LOG.md`

Notes:

- Several files already had earlier roadmap edits. Step 40 only changed client-facing error response sanitization/docs/tests.
- The broader worktree still contains earlier uncommitted footer/payment-logo changes, but Step 40 did not edit those files.

## Unsafe Response Patterns Found

Found repeated server/API catch patterns such as:

- `const message = error instanceof Error ? error.message : 'fallback'`
- `return NextResponse.json({ error: message }, { status })`
- admin report endpoints returning `error.message || fallback`
- coupon mutation helper returning raw `error.message`

Risk:

- Raw `error.message` can expose Prisma internals, database constraints, connection details, filesystem paths, stack fragments, full URLs, tokens, secrets, or implementation details.

## Responses Fixed

Added `src/backend/security/client-error.ts` and routed risky catch responses through it.

Fixed areas:

- Admin users list/detail/update.
- Admin settings load/save.
- Admin notifications list/send/update/delete.
- Admin return list/detail/update.
- Admin reports load/export.
- Admin category create/update/delete.
- Admin banner create/update/delete.
- Admin product create/update/delete.
- Admin content create/update/delete.
- Admin flash-sale create/update/delete.
- Admin inventory update.
- Admin review moderation fallback.
- Admin payment-status update fallback.
- Admin coupon delete fallback.
- Coupon mutation helper fallback for create/update routes.

The helper preserves:

- `Unauthorized`
- safe validation messages
- existing generic fallback messages

The helper replaces with fallback when messages look like:

- Prisma/database/internal SQL errors
- stack traces
- filesystem paths
- database URLs
- full URLs with query strings/fragments
- token/secret/cookie/session/auth strings
- multiline internal messages

## Responses Intentionally Left Unchanged

Left unchanged:

- Safe explicit validation responses, such as missing required fields, invalid email, invalid quantity, coupon validation, review validation, and admin parser errors.
- Explicit not-found responses like `Product not found`, `User not found`, `Return request not found`.
- Buyer-facing stock/coupon/cart/order messages that are intended UX and do not expose internals.
- Order creation sentinel checks for `INSUFFICIENT_STOCK:` and `FLASH_SALE_SOLD_OUT`, because they preserve established buyer checkout behavior.
- Admin order status route fallback, because it already returns either `Unauthorized` or a generic `Could not update order status`.
- `src/app/(admin)/admin/settings/page.tsx`, because it is UI-side error extraction, not a server/API JSON response, and this step avoided UI files.
- Routes with already-generic server failures, such as account/profile/address, contact, newsletter, auth/register, reviews, CSP report endpoint, and request guard responses.

## Helper Added

Added `src/backend/security/client-error.ts`.

Exports:

- `isSafeClientErrorMessage(...)`
- `toSafeClientErrorMessage(...)`
- `toSafeClientError(...)`

Behavior:

- caps client error messages at 180 characters
- preserves `Unauthorized`
- preserves safe validation-style messages
- maps unknown/non-error values to fallback
- maps unsafe internal-looking messages to fallback
- keeps existing response shape `{ error: message }`
- preserves existing default `400` catch status and `401` for `Unauthorized`
- allowed one custom preservation where admin payment-status still maps `Unauthorized` to existing `403`

## Behavior Preservation Notes

Preserved:

- response JSON shape
- existing generic fallback messages
- existing validation messages where explicitly returned
- existing `Unauthorized` behavior
- existing `403` behavior for admin payment-status unauthorized fallback
- business logic
- database queries
- validation logic
- frontend behavior
- CSP report-only disabled/default behavior

No database/schema/query behavior was changed.

## Tests Added / Updated

Added:

- `tests/client-error.test.ts`

Coverage:

- safe validation messages pass through
- `Unauthorized` preserves status behavior
- Prisma-like messages fall back
- database URL-like strings fall back
- stack traces fall back
- filesystem paths fall back
- full URLs with query strings/fragments fall back
- token/secret-like messages fall back
- unknown non-error values use fallback

Focused command:

```bash
npx tsx --test tests/client-error.test.ts tests/security-log.test.ts
```

Result: passed, 12 tests.

## Validation Commands Run

| Command | Result |
| --- | --- |
| `npx tsx --test tests/client-error.test.ts tests/security-log.test.ts` | Passed; 12 tests, 0 failures. |
| `npm run db:url:safety` | Passed; no database connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js printed the standard `next lint` deprecation notice. |
| `npm test` | Passed; 151 tests, 30 suites, 0 failures. |
| `npm run build` | Passed. |
| Unsafe response scan | Passed for API/backend raw client response patterns; remaining hits are helper denylist patterns, order sentinel checks, or UI code outside this scope. |
| `git diff --check -- README.md src/backend/security/client-error.ts src/backend/admin/coupon-editor.ts src/app/api/admin tests/client-error.test.ts` | Passed; Git printed CRLF normalization warnings only. |

## Production Build Result

Passed.

Next.js compiled successfully, generated 76 static pages, and retained the existing route table.

## Confirmation of Prohibited Files Not Touched

No database, Prisma schema, migration, seed/reset/db-push command, footer file, payment-logo asset, visual/UI styling file, seller marketplace implementation, payment backend integration, tracking API integration, product lifecycle schema, or unrelated feature behavior was changed by Step 40.

Specifically not touched in Step 40:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `public/assets/payments/**`

Note: footer and payment-logo files still appear modified in the broader worktree from earlier steps, but Step 40 did not edit them.

## Remaining Risks

- Client-response hardening is source/test verified only; no authenticated browser/API smoke was run because local DB remains unsafe.
- Some explicit validation messages may still need future product-owner review for ideal UX wording, but they are not raw internal errors.
- The helper is conservative, but future new routes must use it consistently for unknown server errors.
- Local DB readiness remains blocked: `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing.
- Rate limiting remains in-memory and per-process.
- CSP remains report-only and disabled by default; no enforcement was added.

## Recommended Next Step

Continue non-DB readiness with an API error contract/test planning pass, or set up local PostgreSQL plus a local shadow database so DB-backed authenticated testing and product lifecycle work can resume safely.
