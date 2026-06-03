# Step 140 - Admin Export Role And Permission Decision Matrix

## Scope

Loop 2 of the approved self-driving admin export safety batch created a report-only role and permission decision matrix for future admin CSV exports.

This step did not implement permissions. It did not change source, tests, routes, runtime behavior, export URLs, CSV payloads, CSV field order, response headers, status codes, admin access behavior, masking/redaction state, role separation state, audit logging behavior, storage, database behavior, provider config, deployment config, env files, Prisma files, package files, Docker files, assets, or visual files.

## Latest Commit Verified

Latest commit verified before this loop:

```text
a9ec0dc docs: design admin export audit logging
```

## Initial Git Status

Initial `git status --short` was clean.

Initial staged files were none.

## Planning Lanes Used

Real read-only lanes were used:

- Explorer: recommended a report-only admin export role and permission matrix as the next safest task.
- Guardian: confirmed the exact two-file edit scope and warned against permission implementation, route changes, DB/auth tests, env reads, CSV changes, and source/test edits.
- Validator: identified validation and stop conditions, while the coordinator narrowed the loop back to report-only scope.
- Docs Auditor: supplied required report sections and consistency requirements.
- Advisor: confirmed no human approval is needed for the report-only matrix inside this approved batch, but approval is required before implementation decisions.

All lanes were read-only. No lane edited files, staged files, ran export routes, queried a database, read private env files, ran migrations, ran Docker, deployed, updated packages, or connected to remote services.

## Chosen Task

Chosen task:

```text
Report-only admin export role and permission decision matrix
```

Allowed files for this loop:

- `audit-reports/140_ADMIN_EXPORT_ROLE_PERMISSION_MATRIX.md`
- `audit-reports/140_NEXT_PROMPT_DRAFT.md`

## Files Reviewed

- `audit-reports/139_ADMIN_EXPORT_AUDIT_LOGGING_DESIGN.md`
- `audit-reports/139_NEXT_PROMPT_DRAFT.md`
- `audit-reports/137_ADMIN_EXPORT_CONTROL_GAP_REVIEW.md`
- `src/backend/admin/reports.ts`
- `src/app/api/admin/reports/export/route.ts`

## Current Baseline

Current export access behavior:

- `GET /api/admin/reports/export` uses the existing admin session guard.
- Current route behavior relies on broad admin access.
- No export-specific permission exists.
- No role-separated export permissions exist.
- No masking/redaction policy is enforced.
- No export audit logging is implemented.
- Direct API access can bypass the client-side confirmation UI.

Current known roles referenced by the codebase include:

- `CUSTOMER`
- `SELLER`
- `ADMIN`
- `SUPER_ADMIN`

This report does not add, remove, rename, or reinterpret any role.

## Export Risk Classification

| Export type | Current status | Sensitivity | Current risk |
| --- | --- | --- | --- |
| `orders` | Broad admin access | Customer PII plus order/payment-sensitive fields | High |
| `products` | Broad admin access | Business-sensitive inventory, sales, SKU, and catalog status fields | Medium to high |
| `customers` | Broad admin access | Highest PII risk customer account and activity fields | Critical |

Risk notes:

- `customers` should require the strictest future export permission because it contains direct customer identity/contact fields.
- `orders` should require a separate customer/order export permission because it combines identity fields with order/payment-status data.
- `products` may not contain customer PII, but stock, sold counts, active status, and SKU policy remain business-sensitive.
- SKU remains `unknown-needs-policy` from the export metadata and needs a later product/security decision.

## Role And Permission Decision Matrix

This matrix is a future decision aid only. It is not implemented.

| Future actor category | Orders export | Products export | Customers export | Notes |
| --- | --- | --- | --- | --- |
| Anonymous user | No | No | No | Must never access admin export APIs. |
| Customer | No | No | No | Buyer-facing mobile/web clients should not receive admin CSV exports. |
| Seller | No by default | Possible future limited seller-owned catalog/export, not current admin export | No | Seller marketplace work is paused; do not design seller exports into current admin route yet. |
| Support operator | Possible read-only summary only, no CSV by default | No by default | No | Needs separate support policy before implementation. |
| Report viewer | Possible with explicit `admin.reports.orders.export` | Possible with explicit `admin.reports.products.export` | No by default | A future read-only reporting role should not gain mutation privileges. |
| Catalog manager | No by default | Possible with explicit `admin.reports.products.export` | No | Products export still includes business-sensitive inventory/sales data. |
| Customer operations manager | Possible with explicit order/customer permission | No by default | Possible only with highest-risk explicit permission | Needs audit logging and retention controls first. |
| Current broad admin | Current behavior allows | Current behavior allows | Current behavior allows | Preserve until a dedicated implementation step is approved. |
| Super admin | Current behavior allows | Current behavior allows | Current behavior allows | Future policy may keep override access with audit logging. |

## Candidate Future Permission Names

Candidate names for a later implementation decision:

- `admin.reports.view`
- `admin.reports.orders.export`
- `admin.reports.products.export`
- `admin.reports.customers.export`
- `admin.reports.export.all`
- `admin.reports.export.audit.view`

Implementation notes for later:

- Permission names should be stable for web and future mobile/admin clients.
- Export permissions should be separate from create/update/delete permissions.
- Report viewing should not automatically imply CSV export.
- Customer export permission should not be bundled casually with order export permission.
- Super admin override behavior should be explicit, tested, and logged.

## Access Policy Decisions Needed

Before implementation, Boilabin needs explicit decisions for:

- whether current `ADMIN` remains enough for all exports;
- whether `SUPER_ADMIN` receives export override access;
- whether a read-only reporting role should exist;
- whether support staff can export any CSV;
- whether customer exports require two-person approval or extra confirmation;
- whether products export should be available to catalog staff;
- whether SKU is public catalog data or internal inventory data;
- whether permission denials return `403` with the existing `{ error }` shape;
- whether direct API exports should keep the same route and query contract;
- whether audit logging is required before role-separated permissions go live.

## Behavior Preservation Checklist

Future permission implementation must preserve until explicitly approved otherwise:

- `/api/admin/reports/export` route path;
- `orders`, `products`, and `customers` report type names;
- `from` and `to` query behavior;
- CSV payload fields and field order;
- `Content-Type` and `Content-Disposition` response headers;
- current client response shape conventions;
- current UI confirmation behavior;
- current broad admin behavior until a dedicated permission implementation step;
- current masking/redaction state;
- current audit logging state until a dedicated logging implementation step;
- current storage state.

## No-DB Test Plan For Future Implementation

No-DB tests can be added before permission implementation for:

- permission name constants if a later source step introduces them;
- mapping export type to required permission;
- preserving report type enum values;
- preserving existing invalid export type response shape in static/source tests;
- ensuring customer export maps to the highest-risk permission;
- ensuring product export does not depend on customer PII permission;
- ensuring permission-denied branches are planned to return `{ error }` with a stable status;
- ensuring future mobile/admin clients receive stable error codes only if explicitly approved.

These tests should not execute the export route, require admin credentials, query a database, generate CSV, or inspect real exported rows.

## DB/Auth-Backed Tests Needed Later

After a dedicated approved DB/auth test step, add tests for:

- an admin with each export permission can export the matching report type;
- an admin without the matching export permission receives a safe forbidden response;
- current broad admin behavior is preserved or intentionally migrated according to the approved policy;
- direct API access cannot bypass route-level permissions after implementation;
- successful exports keep CSV payloads and headers unchanged;
- denied exports do not generate CSV;
- audit logging records sanitized allowed fields only;
- customer/order/product sensitivity mappings match policy decisions.

These tests must use safe local/staging fixtures only and must not print raw CSV rows or real user/order data.

## Mobile And API Compatibility Considerations

Future web and mobile/admin clients need stable API contracts:

- permission denials should use predictable status codes and response shapes;
- route names and export type names should stay stable unless a versioned API decision is made;
- mobile clients should not need CSV export access by default;
- if future mobile admin tooling exists, export permissions should be explicit and server-enforced;
- client UI visibility must not be treated as permission enforcement;
- admin reporting permissions should be modeled separately from buyer, seller, payment, tracking, and product lifecycle features.

## Prohibited Actions Not Performed

- Did not implement permissions.
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

Validation was run after this report and the Step 140 prompt draft were created.

Results are recorded in the final response for this loop.

## Remaining Risks

- Admin export permissions are still not implemented.
- Current exports still rely on broad admin access.
- Direct API export can bypass UI confirmation.
- Export audit logging is still not implemented.
- Masking/redaction remains future work.
- SKU sensitivity remains unresolved.
- Durable storage and retention decisions remain future work.
- DB/auth-backed export route tests remain future work.

## Recommended Next Step

Continue to Step 141 only inside the approved self-driving batch if the worktree remains clean and validation passes. The next safest task is a report-only masking/redaction compatibility review for admin exports.
