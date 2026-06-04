# Step 147 - Admin Export Audit Route Integration Readiness

## Scope

Step 147 performed a report-only admin export audit route integration readiness review.

This step did not edit source files, tests, route handlers, runtime behavior, export URLs, CSV payloads, CSV field order, response headers, status codes, response shapes, admin access behavior, masking/redaction behavior, role separation, storage behavior, env files, Prisma files, package files, Docker files, assets, visual files, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile implementation, or product lifecycle work.

This step did not run export routes, query a database, require authenticated admin credentials, create durable logging, or wire `logSecurityEvent` into the live export route.

## Latest Verified Context

Latest commit verified before work:

```text
3df3b51 docs: summarize admin export audit logging readiness
```

Initial `git status --short` was clean.

Initial staged files were none.

Steps 144 through 146 were present:

- `78a273d feat: add admin export audit event helper`
- `1624576 test: harden admin export audit event safety`
- `3df3b51 docs: summarize admin export audit logging readiness`

## Planning Lanes Used

Real read-only lanes were used:

- Explorer: mapped the live export route and helper/security-log compatibility.
- Guardian: reviewed prohibited actions, stop conditions, route integration risks, and failure policy.
- Validator: defined validation order, failure classifications, and future test requirements.
- Docs Auditor: verified Step 139 through Step 146 context and report naming.
- Advisor: confirmed Step 147 should remain report-only and Step 148 must be explicitly approved before runtime logging changes.

All lanes were read-only. No lane edited files, staged files, ran export routes, queried a database, read private env files, ran migrations, ran Docker, deployed, updated packages, or connected to remote services.

## Files Reviewed

- `audit-reports/139_ADMIN_EXPORT_AUDIT_LOGGING_DESIGN.md`
- `audit-reports/140_ADMIN_EXPORT_ROLE_PERMISSION_MATRIX.md`
- `audit-reports/141_ADMIN_EXPORT_MASKING_REDACTION_COMPATIBILITY_REVIEW.md`
- `audit-reports/142_ADMIN_PRODUCT_EXPORT_SKU_SENSITIVITY_MATRIX.md`
- `audit-reports/143_SELF_DRIVING_BATCH_SUMMARY.md`
- `audit-reports/144_ADMIN_EXPORT_AUDIT_EVENT_HELPER.md`
- `audit-reports/145_ADMIN_EXPORT_AUDIT_EVENT_TEST_HARDENING.md`
- `audit-reports/146_ADMIN_EXPORT_AUDIT_LOGGING_READINESS_SUMMARY.md`
- `audit-reports/146_NEXT_PROMPT_DRAFT.md`
- `src/backend/admin/export-audit-log.ts`
- `src/backend/security/security-log.ts`
- `src/backend/admin/reports.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/security/client-error.ts`
- `src/app/api/admin/reports/export/route.ts`
- `tests/admin-reports.test.ts`

Note: the prompt listed older Step 140 through Step 142 aliases. The actual files on disk are the role permission matrix, masking/redaction compatibility review, and SKU sensitivity matrix listed above.

## Current Live Export Route Map

Current route:

- Path: `/api/admin/reports/export`
- Method implemented: `GET`
- Handler: `src/app/api/admin/reports/export/route.ts`

Current flow:

1. The route enters a `try` block and calls `requireAdminSession()`.
2. `requireAdminSession()` accepts only current `ADMIN` and `SUPER_ADMIN` roles and throws `Unauthorized` otherwise.
3. After the admin guard succeeds, the route parses `req.url` with `new URL(req.url)`.
4. It reads `type` from search params.
5. Valid report types are currently hard-coded as `orders`, `products`, and `customers`.
6. Missing or invalid report type returns JSON `{ error: 'Export type is invalid' }` with status `400`.
7. Valid report type proceeds to `parseAdminReportRange(searchParams.get('from'), searchParams.get('to'))`.
8. The route calls `buildAdminReportCsv(type, range)`.
9. Successful export returns a CSV response with default `200` status.
10. Success headers are:
    - `Content-Type: text/csv; charset=utf-8`
    - `Content-Disposition` attachment filename using the report type and current date.
11. Any thrown error reaches the `catch` block.
12. The catch block uses `toSafeClientError(error, 'Could not export report')`.
13. Unauthorized errors preserve the safe `Unauthorized` message and map to status `401`.
14. Other unsafe/internal errors are converted to the fallback message and current default status behavior.

Current CSV generation path:

- `orders` export queries orders in the requested date range.
- `products` export currently builds product CSV data and does not use the date range for filtering.
- `customers` export currently builds customer CSV data and does not use the date range for filtering.

No audit logging currently runs from this route.

## Current Helper Readiness

`src/backend/admin/export-audit-log.ts` is ready as a no-DB helper for building bounded audit event objects.

Current helper properties:

- fixed route pathname;
- fixed method;
- bounded result values;
- bounded error codes;
- bounded actor roles;
- enum-only report type validation;
- safe status code normalization;
- invalid report type omission;
- static sensitivity booleans from report metadata;
- no logging side effects;
- no route execution;
- no database calls;
- no request header/cookie/body inspection;
- no CSV row inspection.

The helper is not wired into the live route.

## Future Hook Point Matrix

| Hook point | Conceptual location | Safe data to pass | Never pass | No-DB test coverage | Later DB/auth test coverage |
| --- | --- | --- | --- | --- | --- |
| Attempted export | After admin session succeeds and before report type validation | `result: attempted`, safe actor role, fixed route/method | actor email/name/id, raw query string, request URL, cookies, headers, raw dates | Source-level assertion that future hook is after admin guard and uses helper constants | Authenticated admin request records a sanitized attempt |
| Blocked unauthenticated/non-admin export | Catch path for `Unauthorized` from admin guard | `result: blocked`, status `401`, error code `unauthorized`, fixed route/method | actor identity, request headers, cookies, full URL, raw error object | Source-level assertion that unauthorized branch maps only a bounded event | Anonymous and non-admin requests do not export CSV and log only bounded metadata |
| Blocked invalid report type | Existing invalid `type` branch before CSV generation | `result: blocked`, status `400`, error code `invalid_export_type`, valid report type omitted | invalid raw type value, query string, `from`/`to`, raw URL | Source-level assertion that invalid type branch does not echo raw type | Admin invalid type request preserves status/body and records sanitized blocked event |
| Successful export | After `buildAdminReportCsv` resolves and before returning CSV | `result: success`, status `200`, valid report type, safe actor role | CSV content, row count from real data, order/customer IDs, customer names/emails/phones | Source-level assertion that success logging is after CSV build and before return without changing headers/body | Successful export keeps CSV payload and headers unchanged while logging sanitized event |
| Failed export after valid admin request | Catch path for non-auth export errors | `result: failed`, safe status behavior, error code `export_failed`, valid report type only if safely available | raw error, stack, DB error text, query string, headers, CSV content | Source-level assertion that catch logging uses bounded error code and safe fallback | Simulated export failure preserves client error contract and logs no internal details |

## Integration Readiness Result

Step 147 finds the route is conditionally ready for a future bounded no-DB source/test integration, but not ready to claim full runtime audit coverage.

Safe only if the future implementation:

- uses the existing no-DB helper;
- uses existing sanitized security logging only;
- is fail-open;
- preserves route response behavior exactly;
- does not create durable storage;
- does not log raw query strings, raw URLs, headers, cookies, request bodies, response bodies, CSV rows, actor identifiers, customer identifiers, order identifiers, or raw errors;
- uses no-DB source/static tests first;
- defers DB/auth-backed runtime coverage to a later approved step.

Full audit coverage remains not ready until DB/auth-backed tests and durable storage/retention policy are approved.

## Logging Backend Decision

For the first integration, use existing sanitized `logSecurityEvent` only.

Benefits:

- no new dependency;
- no durable storage decision needed;
- compatible with existing security-event sanitization;
- keeps implementation small;
- can be covered by no-DB tests and mocked console/security logging behavior.

Risks:

- console/security logs are not durable audit storage;
- logs may be sampled, rotated, omitted, or unavailable depending on hosting/provider settings;
- production retention and access controls remain undecided;
- the generic sanitizer drops metadata keys that match sensitive patterns;
- this must not be represented as complete audit compliance.

Durable storage must remain deferred until storage, access, retention, backup, deletion/legal-hold, and production log-sharing policies are approved.

## Recommended Logging Failure Policy

Recommended first integration policy: fail-open.

Reason:

- export CSV behavior must remain unchanged;
- logging should not alter status codes, headers, response bodies, or CSV payloads;
- initial logging is not durable compliance storage;
- existing helper/security-log work is safety instrumentation, not permission enforcement;
- fail-closed would be a behavior change and requires a separate security/product decision.

Fail-closed may be reconsidered later only after durable audit storage, monitoring, retry behavior, operator guidance, and DB/auth-backed tests are approved.

## Payment And Order Sensitivity Metadata Mapping

Current issue:

- The helper includes `containsPaymentOrOrderSensitiveData`.
- The generic security-event sanitizer drops metadata keys containing `payment`.

Step 147 decision:

- Do not weaken the generic sanitizer.
- Do not log raw payment data, order identifiers, payment statuses, totals, CSV rows, or customer/order details.
- Do not rely on `containsPaymentOrOrderSensitiveData` surviving direct `logSecurityEvent` sanitization.

Recommended first integration mapping:

- omit the payment/order sensitivity flag from the security log metadata until a no-DB test proves a safe mapped field survives sanitization; or
- map it to an allowlisted boolean such as `containsOrderSensitiveData`, while documenting that it is a static report classification only and never raw payment/order data.

The first route integration should choose one of those paths explicitly and test it before commit.

## No-DB Tests Needed Before Integration

No-DB tests that can be added before or with the first integration:

- helper event shape remains bounded;
- route pathname and method constants match the export route;
- invalid report type never echoes raw input;
- error codes remain bounded;
- actor role remains role-only;
- no actor email/name/id fields exist in the event shape;
- no request URL/query/date-filter/header/cookie/body fields exist in the event shape;
- no CSV row or payload-like fields exist in the event shape;
- source-level test confirms the route imports only the approved helper/security logger when integration happens;
- source-level test confirms logging statements do not change the CSV response construction;
- source-level test confirms logging statements do not change invalid type response status/body;
- mapped order-sensitivity metadata survives sanitizer only under an approved safe key.

## DB/Auth-Backed Tests Needed Later

DB/auth-backed tests remain future work and require a dedicated approved step with safe local/staging fixtures.

Needed later:

- anonymous request receives the current safe unauthorized contract and no CSV;
- non-admin request receives the current safe unauthorized contract and no CSV;
- admin invalid report type preserves status/body and logs a sanitized blocked event;
- admin successful `orders` export preserves CSV headers and payload contract while logging sanitized success;
- admin successful `products` export preserves CSV headers and payload contract while logging sanitized success;
- admin successful `customers` export preserves CSV headers and payload contract while logging sanitized success;
- simulated export failure preserves safe client error behavior and logs a sanitized failure;
- logging failure follows the approved fail-open policy without altering export behavior;
- logs never contain raw query strings, headers, cookies, actor identifiers, customer/order identifiers, raw errors, stack traces, or CSV rows.

## Step 148 Recommendation

Step 148 can be a bounded no-DB source/test integration only if the user explicitly approves runtime route logging changes.

Recommended Step 148 scope:

- integrate the helper into the export route with existing sanitized security logging only;
- use fail-open logging;
- map or omit the payment/order sensitivity flag safely;
- add no-DB/source tests only;
- do not run export routes;
- do not query DB;
- do not change route response behavior.

If the user is not ready to approve runtime logging changes, Step 148 should remain report-only.

## Prohibited Actions Not Performed

- Did not edit source files.
- Did not edit tests.
- Did not wire logging into the route.
- Did not call `logSecurityEvent` from the export route.
- Did not create durable storage.
- Did not change export URLs, CSV payloads, CSV field order, response headers, status codes, response shapes, admin access behavior, masking/redaction behavior, role separation, or storage behavior.
- Did not run export routes.
- Did not query the database.
- Did not require authenticated admin credentials.
- Did not read private env files.
- Did not print secrets, full database URLs, tokens, cookies, credentials, auth headers, payment secrets, private connection strings, customer/order PII, raw CSV rows, or raw user data.
- Did not run migrations, database push, seed/reset, SQL, Docker, provider CLI, deployment, package updates, or remote-service commands.
- Did not touch Prisma schema, migrations, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle, footer, newsletter, payment-logo, PromoSection, category images, or visual/media assets.
- Did not restore Flash Deals, `/deals`, or `/api/admin/flash-sales`.
- Did not restore `public/assets/categories/baby-kids.jpg`.
- Did not undo Toys & Collectibles.
- Did not use broad staging.

## Validation Results

Validation passed before the Step 147 commit:

- `git diff --check -- audit-reports/147_ADMIN_EXPORT_AUDIT_ROUTE_INTEGRATION_READINESS.md audit-reports/147_NEXT_PROMPT_DRAFT.md` - passed.
- `node scripts/boilabin-terminal-loop-state.mjs` - passed.
- `node scripts/boilabin-advisor-state.mjs` - passed.
- `npm run db:url:safety` - passed; no database connection attempted.
- `npm run typecheck` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 344/344.
- `npm run build` - passed, generated 72 pages.

## Remaining Risks

- Helper is still not wired into the live export route.
- Runtime export audit logging is still not active.
- Durable audit storage is still not implemented.
- Retention, access, backup, deletion/legal-hold, and production log-sharing policies remain undecided.
- Payment/order sensitivity metadata mapping still needs implementation and tests.
- DB/auth-backed route coverage remains future work.
- Role-separated export permissions remain future work.
- Masking/redaction remains future work.
- SKU sensitivity remains unresolved.

## Recommended Next Step

After human approval, proceed to Step 148 as a bounded no-DB source/test integration of the existing helper into the admin export route with fail-open sanitized security logging, or keep Step 148 report-only if runtime logging is not yet approved.
