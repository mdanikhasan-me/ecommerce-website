# Step 139 - Admin Export Audit Logging Design

## Scope

Loop 1 of the approved self-driving admin export safety batch created a report-only design for future sanitized admin export audit logging.

This step did not implement logging. It did not change source, tests, routes, runtime behavior, export URLs, CSV payloads, CSV field order, response headers, status codes, admin access behavior, masking/redaction state, role separation state, storage, database behavior, provider config, deployment config, env files, Prisma files, package files, Docker files, assets, or visual files.

## Latest Commit Verified

Latest commit verified before this loop:

```text
6dbcd75 docs: summarize admin export batch execution
```

## Initial Git Status

Initial `git status --short` was clean.

Initial staged files were none.

## Planning Lanes Used

Real read-only lanes were used:

- Explorer: recommended a report-only sanitized export audit logging design as the next safest task.
- Guardian: confirmed the only allowed edit files and warned against route, storage, DB/auth, env, CSV, permission, masking, redaction, and source/test changes.
- Validator: recommended non-mutating validation and classified env/DB/export-route execution as stop conditions.
- Docs Auditor: confirmed Steps 134-138 are consistent and listed required Step 139 report sections.
- Advisor: confirmed Step 139 as the next bounded admin export safety task after `6dbcd75`.

All lanes were read-only. No lane edited files, staged files, ran export routes, queried a database, read private env files, ran migrations, ran Docker, deployed, updated packages, or connected to remote services.

## Chosen Task

Chosen task:

```text
Report-only sanitized admin export audit logging design
```

Allowed files for this loop:

- `audit-reports/139_ADMIN_EXPORT_AUDIT_LOGGING_DESIGN.md`
- `audit-reports/139_NEXT_PROMPT_DRAFT.md`

## Current Baseline

Current admin export route behavior:

- `GET /api/admin/reports/export` requires the existing admin session guard.
- Valid export types are `orders`, `products`, and `customers`.
- Invalid or missing export type returns `{ error: 'Export type is invalid' }` with status `400`.
- Successful exports return CSV with the existing `Content-Type` and `Content-Disposition` headers.
- Unknown server errors are converted through the existing safe client error helper.

Current admin export safety work already completed:

- Step 134 added client-side export confirmation UI.
- Step 135 hardened no-DB/static QA around the confirmation UI.
- Step 136 added CSV handling guidance and an admin page note.
- Step 137 classified remaining admin export control gaps.
- Step 138 summarized the previous execution batch.

Current security logging baseline:

- `src/backend/security/security-log.ts` provides sanitization helpers and console-based security event logging.
- It sanitizes URL-like fields to origin plus pathname or pathname only.
- It caps strings and filters forbidden metadata keys.
- It is not durable audit storage and should not be treated as a complete admin export audit trail.

## Proposed Future Audit Event Shape

Future export audit events should be bounded and structured. A safe initial shape would be:

```ts
{
  type: 'admin_export_attempt' | 'admin_export_success' | 'admin_export_failure',
  timestamp: string,
  severity: 'info' | 'warn' | 'error',
  route: '/api/admin/reports/export',
  method: 'GET',
  statusCode: number,
  errorCode?: 'invalid_export_type' | 'unauthorized' | 'forbidden' | 'export_failed',
  userRole?: 'ADMIN',
  metadata: {
    reportType?: 'orders' | 'products' | 'customers',
    result?: 'attempted' | 'success' | 'blocked' | 'failed',
    containsCustomerPii?: boolean,
    containsBusinessSensitiveData?: boolean,
    containsPaymentOrOrderSensitiveData?: boolean
  }
}
```

The design intentionally excludes actor names, actor emails, user IDs, order IDs, customer IDs, raw date filters, raw query strings, CSV row counts from real data, and request bodies.

## Allowed Fields

Allowed fields for future implementation:

- event type from a small enum;
- timestamp generated server-side;
- severity from a small enum;
- route pathname only, such as `/api/admin/reports/export`;
- method, such as `GET`;
- safe status code;
- short result code or error code;
- report type enum: `orders`, `products`, or `customers`;
- safe actor role only if already available without expanding auth/session behavior;
- static sensitivity booleans derived from existing report metadata;
- bounded non-PII metadata flags.

## Forbidden Fields

Future export audit logging must not record:

- raw CSV rows;
- customer names;
- customer emails;
- customer phone numbers;
- delivery addresses;
- real order identifiers;
- real customer identifiers;
- actor names, emails, or IDs unless a later approved policy explicitly allows a masked form;
- raw query strings;
- raw `from` or `to` filter text;
- request bodies;
- cookies;
- authorization headers;
- tokens;
- credentials;
- private env values;
- database URLs;
- payment data;
- raw stack traces;
- raw `Error` objects;
- raw request headers;
- raw response bodies;
- exported file contents;
- full URLs with query strings or fragments.

## Storage And Retention Decisions Needed

Before durable audit logging is implemented, Boilabin needs explicit decisions for:

- where audit events are stored;
- whether storage is app database, provider logging, object storage, SIEM, or another approved service;
- whether logs are immutable or append-only;
- who can view export audit events;
- how long export audit events are retained;
- how audit logs are backed up;
- how deletion or legal hold is handled;
- how production logs are protected from public sharing;
- whether staging and production use different retention periods;
- whether future mobile/admin clients need read access to summarized audit state.

Until those decisions exist, future implementation should prefer sanitized console/security logging only for local/staging testing and must not claim durable audit coverage.

## No-DB Test Plan For Future Implementation

No-DB tests can be added before route integration for:

- export audit event type enum;
- allowed report type enum;
- safe event shape builder;
- route path sanitization;
- rejection or omission of raw query strings;
- omission of customer/order identifiers;
- omission of actor email/name/id fields;
- metadata booleans derived from `ADMIN_REPORT_EXPORT_METADATA`;
- compatibility with `sanitizeSecurityEvent`;
- capped strings and forbidden metadata key filtering.

These tests should not execute `buildAdminReportCsv`, call the export route, require admin credentials, query a database, inspect real CSV rows, or depend on private env files.

## DB/Auth-Backed Tests Needed Later

Later, after a dedicated approved DB/auth testing step, add tests for:

- authenticated admin export attempt records a sanitized event;
- invalid export type records a sanitized blocked/failure event;
- unauthorized request does not expose sensitive details;
- successful export keeps existing CSV payload and headers;
- logging failures do not block exports unless a later product/security decision requires fail-closed behavior;
- report type and static sensitivity flags are correct;
- raw query strings, headers, cookies, and CSV rows are absent from audit events.

These tests must use safe local/staging fixtures only and must not paste real exported rows into reports.

## Behavior Preservation Checklist

Future logging implementation must preserve:

- export route path;
- export query contract;
- valid report type names;
- CSV payload fields and order;
- `Content-Type` and `Content-Disposition` behavior;
- current client response shapes and status codes;
- current broad admin access behavior until a separate permission step is approved;
- current UI confirmation behavior;
- current masking/redaction state;
- current role separation state;
- current storage state until durable storage is separately approved.

## Prohibited Actions Not Performed

- Did not implement logging.
- Did not edit source, tests, scripts, runtime config, env files, Prisma files, package files, Docker files, assets, visual files, or frontend/admin behavior.
- Did not read private env files.
- Did not print secrets, full database URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, CSV rows, or raw user data.
- Did not query a database or run export routes.
- Did not run DB-backed report route success-flow tests.
- Did not require authenticated admin credentials.
- Did not change export URLs, CSV payloads, field order, headers, response shapes, status codes, admin access behavior, masking state, redaction state, role separation state, audit logging behavior, or storage behavior.
- Did not edit Prisma schema, migrations, package files, Docker files, env files, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle, provider/deployment files, footer, newsletter, payment-logo, PromoSection, category image, or visual/media files.
- Did not restore Flash Deals, `/deals`, or `/api/admin/flash-sales`.
- Did not run migrations, `prisma db push`, seed/reset, SQL, Docker, deployment, provider CLI, package updates, or remote-service commands.

## Validation Results

Validation was run after this report and the Step 139 prompt draft were created.

Results are recorded in the final response for this loop.

## Remaining Risks

- Admin export audit logging is still not implemented.
- Current export confirmation is UI-only and can be bypassed with a direct API URL.
- Admin exports still rely on broad admin access.
- Role-separated export permissions remain future work.
- Masking/redaction remains future work.
- SKU sensitivity remains unresolved.
- Durable audit storage and retention require future provider/security decisions.
- DB/auth-backed export route tests remain future work.

## Recommended Next Step

Continue to Step 140 only inside the approved self-driving batch if the worktree remains clean and validation passes. The next safest task is a no-runtime report-only role and permission decision matrix for future admin exports.
