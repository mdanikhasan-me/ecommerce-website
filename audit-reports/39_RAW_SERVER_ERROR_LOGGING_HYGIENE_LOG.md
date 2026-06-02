# Step 39: Raw Server Error Logging Hygiene Log

Date: 2026-06-02

## Scope

Completed a focused non-database pass over server/API/backend raw error logging. The task preserved response status codes, response shapes, redirect behavior, business logic, database queries, validation logic, and frontend behavior.

Local PostgreSQL is still not ready, so DB/product lifecycle/authenticated DB-backed testing remains paused.

## Files Changed

Changed in this Step 39 task:

- `README.md`
- `src/app/sitemap.ts`
- `src/app/(store)/deals/page.tsx`
- `src/app/(store)/new-arrivals/page.tsx`
- `src/app/api/orders/route.ts`
- `src/app/api/returns/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/app/api/admin/banners/[id]/route.ts`
- `src/app/api/admin/products/[id]/route.ts`
- `tests/security-log.test.ts`
- `audit-reports/39_RAW_SERVER_ERROR_LOGGING_HYGIENE_LOG.md`

Notes:

- Several files already had earlier roadmap edits. Step 39 only changed raw server logging and the related docs/test.
- The broader worktree still contains earlier uncommitted footer/payment-logo changes, but Step 39 did not edit those files.

## Raw Logging Patterns Found

Server/API/backend scan found raw server-side logging in these paths:

- `src/app/sitemap.ts`
- `src/app/(store)/deals/page.tsx`
- `src/app/(store)/new-arrivals/page.tsx`
- `src/app/api/orders/route.ts`
- `src/app/api/returns/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/app/api/admin/banners/[id]/route.ts`
- `src/app/api/admin/products/[id]/route.ts`

Patterns found:

- `console.error(..., error)`
- `console.error(..., cleanupError)`
- logging error messages from dynamic sitemap failures
- logging raw server-side catch objects from DB-backed page/API flows

Potential risk:

- Raw `Error` objects can include stack traces, Prisma/database details, filesystem paths, request-adjacent context, or sensitive message content depending on upstream error source.

## Risky Logs Replaced

Replaced raw logs with `logSecurityEvent(...)` using safe structured fields only.

### Dynamic Sitemap

Replaced raw dynamic sitemap error logging with:

- event type: `server_error`
- route: `/sitemap.xml`
- status code: `200`
- error code: `dynamic_sitemap_entries_failed`
- metadata: `feature=sitemap`, `fallback=static_entries`

The fallback static sitemap behavior was preserved.

### Deals Page

Replaced raw deals page data-load error logging with:

- event type: `server_page_data_load_failed`
- route: `/deals`
- status code: `200`
- error code: `deals_page_data_load_failed`
- metadata: `feature=deals`, `fallback=empty_deals`

The existing empty deals fallback was preserved.

### New Arrivals Page

Replaced raw new-arrivals data-load error logging with:

- event type: `server_page_data_load_failed`
- route: `/new-arrivals`
- status code: `200`
- error code: `new_arrivals_page_data_load_failed`
- metadata: `feature=new_arrivals`, `fallback=empty_products`

The existing empty product fallback was preserved.

### Order Creation API

Replaced raw order creation error logging with safe branch-specific events:

- `insufficient_stock`, status `409`
- `flash_sale_sold_out`, status `409`
- `order_creation_failed`, status `500`

No order body, delivery address, phone number, coupon code, product name, user ID, payment data, or raw error object is logged.

Client responses were preserved:

- insufficient stock still returns the existing stock message and `409`
- flash sale sold out still returns the existing message and `409`
- unknown failure still returns `Failed to create order` and `500`

### Return Request API

Replaced raw return request error logging with:

- event type: `server_error`
- route from `req.nextUrl.pathname`
- method from `req.method`
- status code: `500`
- error code: `return_request_create_failed`
- metadata: `feature=returns`

The existing `Could not create return request` response and `500` status were preserved.

### Admin Upload Cleanup

Replaced raw cleanup error logging in category, banner, and product update flows with:

- event type: `admin_upload_cleanup_failed`
- route from `req.nextUrl.pathname`
- method from `req.method`
- status code: `200`
- short cleanup-specific error codes
- safe feature metadata only

The existing behavior was preserved: successful admin mutations still return success even if stale upload cleanup fails.

## Logs Intentionally Left Unchanged

Left unchanged:

- `console.error`, `console.warn`, and `console.info` inside `src/backend/security/security-log.ts`, because this is the intended sanitized logging sink.
- Client/UI catch handling was not changed because this task was scoped to server/API/backend files.
- Request body parsing lines such as `req.json()` were not changed because they are not logging raw bodies.
- Admin report endpoints were not changed because they did not contain raw server logging. Their client response behavior was preserved for this logging-only pass.
- No persistent logging, external observability service, alerting, or storage backend was added.

After replacement, this scan:

```bash
rg -n "console\\.(error|warn|log|info)\\(" src/app src/backend --glob '!src/frontend/**'
```

returns only the sanitized console sink in `src/backend/security/security-log.ts`.

## Behavior Preservation Notes

Preserved:

- API response status codes.
- API response shapes.
- Redirect behavior.
- Business logic.
- Database queries.
- Validation logic.
- Frontend behavior.
- CSP report-only and collection default-disabled behavior.

No feature behavior was intentionally changed.

## Tests Added / Updated

Updated:

- `tests/security-log.test.ts`

Added coverage:

- raw `Error` objects are ignored from metadata
- stack metadata is ignored
- database-looking strings from raw error messages are not retained
- safe metadata such as `errorName` and `feature` remains observable

Focused test command:

```bash
npx tsx --test tests/security-log.test.ts tests/csp-report.test.ts
```

Result: passed, 14 tests.

## Validation Commands Run

| Command | Result |
| --- | --- |
| `npx tsx --test tests/security-log.test.ts tests/csp-report.test.ts` | Passed; 14 tests, 0 failures. |
| `npm run db:url:safety` | Passed; no database connection attempted; `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing, local migration ready `no`. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no ESLint warnings or errors. Next.js printed the standard `next lint` deprecation notice. |
| `npm test` | Passed; 146 tests, 30 suites, 0 failures. |
| `npm run build` | Passed. |
| Server logging scan | Passed; only sanitized `security-log.ts` console sink remains under `src/app` and `src/backend`. |
| `git diff --check -- README.md src/app/sitemap.ts src/app/(store)/deals/page.tsx src/app/(store)/new-arrivals/page.tsx src/app/api/returns/route.ts src/app/api/orders/route.ts src/app/api/admin/categories/[id]/route.ts src/app/api/admin/banners/[id]/route.ts src/app/api/admin/products/[id]/route.ts tests/security-log.test.ts` | Passed; Git printed CRLF normalization warnings only. |

## Production Build Result

Passed.

Next.js compiled successfully, generated 76 static pages, and retained the existing route table.

## Confirmation of Prohibited Files Not Touched

No database, Prisma schema, migration, seed/reset/db-push command, footer file, payment-logo asset, visual/UI styling file, seller marketplace implementation, payment backend integration, tracking API integration, product lifecycle schema, or unrelated feature behavior was changed by Step 39.

Specifically not touched in Step 39:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `public/assets/payments/**`

Note: footer and payment-logo files still appear modified in the broader worktree from earlier steps, but Step 39 did not edit them.

## Remaining Risks

- The security log sink still writes to console only; persistent logging/storage/alerting remains intentionally unimplemented until hosting and retention policy are known.
- Local DB readiness remains blocked: `DATABASE_URL` remote-looking, `SHADOW_DATABASE_URL` missing.
- DB-backed authenticated testing remains paused.
- Some API routes still return helper-derived error messages to clients. Those were not changed because this was a logging-only pass and response behavior had to be preserved.
- Rate limiting remains in-memory and per-process.
- CSP remains report-only and disabled by default; no enforcement was added.

## Recommended Next Step

Continue non-DB readiness with a client-response error-message review for admin/report endpoints, or set up local PostgreSQL plus a local shadow database so DB-backed authenticated testing and product lifecycle work can resume safely.
