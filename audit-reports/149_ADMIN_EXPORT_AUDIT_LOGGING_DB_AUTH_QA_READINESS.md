# Step 149 - Admin Export Audit Logging DB/Auth QA Readiness

## Step 148 Verification Result

Latest commit verified before this batch:

```text
1df38b2 fix: add fail-open admin export audit logging
```

Step 148 report exists at `audit-reports/148_ADMIN_EXPORT_AUDIT_LOGGING_SOURCE_INTEGRATION.md`.

Step 148 implemented bounded fail-open runtime logging in `src/app/api/admin/reports/export/route.ts` through `buildAdminExportSecurityEvent` and the existing `logSecurityEvent` helper.

Step 148 preserved export responses, CSV payloads, CSV field order, response headers, status codes, response shapes, admin access behavior, masking/redaction behavior, role separation, and storage behavior.

No DB/auth-backed route execution exists yet.

## DB/Auth-Backed QA Objective

The future QA objective is to prove the runtime admin export route behaves correctly under real authenticated request conditions while preserving the Step 148 contract:

- exports remain available to currently authorized admin roles;
- blocked users do not receive CSV;
- invalid export types keep the existing 400 JSON contract;
- successful CSV exports keep existing headers, body, and field order;
- sanitized security logging records bounded events only;
- logging failures remain fail-open.

## What Cannot Be Claimed Yet

The project cannot yet claim:

- durable audit storage;
- production audit compliance;
- export audit log retention;
- export audit log access controls;
- role-separated export permissions;
- masking/redaction coverage;
- DB/auth-backed proof of Step 148 runtime behavior.

## Local Prerequisites

Before DB/auth-backed QA runs, confirm:

- `.env.local` uses local-only app and shadow database URLs;
- `npm run db:url:safety` reports local migration ready `yes`;
- the local PostgreSQL service is reachable;
- the Prisma client is generated from the current schema;
- safe local seed or fixture data exists;
- a local admin and non-admin fixture account plan is approved;
- logging capture is isolated to test output and does not print secrets or PII;
- export route execution is explicitly approved for the future step.

## Admin Auth Fixture Plan

Use local-only synthetic accounts:

- unauthenticated request: no session fixture;
- non-admin request: safe synthetic `CUSTOMER` or equivalent non-admin role;
- admin request: safe synthetic `ADMIN`;
- super admin request if needed: safe synthetic `SUPER_ADMIN`.

Do not use real emails, real passwords, real customer identities, production credentials, or private env output.

## Report/Export Fixture Plan

Use local synthetic fixture rows only:

- products: predictable product names, SKU-like fake values, category, stock, sold count, active state;
- orders: fake order numbers, synthetic customer display strings, fake email-like placeholders, status, payment status, total, created date;
- customers: fake names, fake email-like placeholders, safe phone placeholder, role, active state, order/review counts, created date.

Fixtures should be minimal and deterministic. Do not use production exports, real order numbers, real customer data, or copied CSV rows from users.

## Scenario Matrix

| Scenario | Request setup | Expected response | Expected audit logging |
| --- | --- | --- | --- |
| Unauthenticated request blocked | no session | existing unauthorized JSON/status contract; no CSV | `blocked`, status `401`, error code `unauthorized`, no actor identifiers |
| Non-admin request blocked | non-admin session | existing unauthorized JSON/status contract; no CSV | `blocked`, status `401`, error code `unauthorized`, role only if safely available |
| Invalid report type blocked | admin session with invalid `type` | `{ error: 'Export type is invalid' }`, status `400` | `blocked`, status `400`, error code `invalid_export_type`, no raw invalid type |
| Successful customers export | admin session and local customer fixtures | existing CSV response, current headers and field order | `success`, status `200`, report type `customers`, PII flag only |
| Successful orders export | admin session and local order fixtures | existing CSV response, current headers and field order | `success`, status `200`, report type `orders`, PII/business flags only; no payment-named runtime key |
| Successful products export | admin session and local product fixtures | existing CSV response, current headers and field order | `success`, status `200`, report type `products`, business-sensitive flag only |
| Simulated export failure after admin auth | approved test seam or mocked CSV builder failure | existing safe error response through `toSafeClientError` | `failed`, safe status, `export_failed`, no raw error or stack |
| Simulated logging failure | approved test seam or mocked logger throw | export response unchanged | logging failure swallowed; no response change |

## Response Preservation Assertions

Future tests must assert:

- status codes unchanged;
- `Content-Type` unchanged;
- `Content-Disposition` format unchanged;
- CSV payload unchanged for fixed fixtures;
- CSV field order unchanged;
- invalid/error response bodies unchanged;
- admin access behavior unchanged;
- no extra response body fields are added by audit logging.

## Sanitized Audit Logging Assertions

Future tests must assert:

- event type/category is bounded;
- result is one of `blocked`, `success`, or `failed`;
- status code is bounded;
- error code is from the approved enum;
- report type is allowlisted;
- report type validity is recorded;
- PII/business-sensitive booleans are static classifications only;
- runtime security event omits the payment-named helper key;
- no raw query, date filters, headers, cookies, request body, response body, CSV content, raw error, stack, actor id, actor email, actor name, customer id, or order id appears.

## Prohibited Data Checklist

Do not capture or assert with:

- real customer names;
- real emails;
- real phone numbers;
- real addresses;
- real order numbers;
- real payment identifiers or statuses from production;
- cookies;
- authorization headers;
- private env values;
- raw CSV rows from non-test data;
- raw database errors or stacks.

## Future Validation Plan

When explicitly approved, run:

- exact focused DB/auth route tests first;
- targeted admin report tests;
- `npm run db:url:safety`;
- `npm run typecheck`;
- `npm run lint`;
- `npm test`;
- `npm run build`.

Do not run migrations or seed/reset unless a separate DB setup step explicitly approves them.

## Stop Conditions

Stop future DB/auth QA if:

- local DB safety is not local-ready;
- test execution would need production or remote credentials;
- route execution would print secrets, PII, raw CSV rows, or full DB URLs;
- behavior changes become necessary;
- durable storage implementation becomes necessary;
- migrations, seed/reset, SQL, Docker, or provider CLI become necessary without explicit approval.

## Remaining Risks

- DB/auth-backed tests are not implemented yet.
- Durable audit storage remains absent.
- Local fixture and admin session strategy is not finalized.
- Role separation, masking/redaction, SKU policy, and retention/access policy remain future decisions.

## Recommended Next Loop

Proceed to Loop 150: durable audit storage readiness review.
