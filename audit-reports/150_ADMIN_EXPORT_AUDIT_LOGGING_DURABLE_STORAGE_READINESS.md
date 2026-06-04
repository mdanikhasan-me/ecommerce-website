# Step 150 - Admin Export Audit Logging Durable Storage Readiness

## Current Step 148 Console/Security-Log Limitation

Step 148 logs bounded sanitized export events through `logSecurityEvent`.

This is useful operational telemetry, but it is not durable audit storage. Console/security logs may be unavailable, rotated, sampled, provider-dependent, or inaccessible to the people who need to investigate an incident.

## Durable Audit Storage Goals

Future durable audit storage should support:

- reliable recording of export-related events;
- queryability by event type, route, report type, result, status, timestamp, and actor role;
- bounded sanitized metadata only;
- access controls for who can view audit logs;
- retention and deletion rules;
- incident review workflows;
- clear backup behavior;
- no raw CSV, secrets, cookies, headers, or customer/order identifiers.

## Candidate Storage Approaches

| Approach | Benefits | Risks |
| --- | --- | --- |
| Existing admin audit log pathway | Existing `logAdminAudit` and `db.auditLog` path already exists; familiar operational pattern | Current shape may be too generic; DB writes can fail; needs schema/policy review; currently DB-backed and outside Step 148 |
| Future dedicated DB audit table | Purpose-built fields and indexes; clearer retention policy | Requires Prisma schema/migration work and local DB readiness |
| Provider/server log aggregation | Avoids app schema change; useful operational search | Provider not chosen; retention/access policy varies; may be noisy or non-durable |
| External log drain/SIEM later | Stronger production audit trail and alerting potential | Adds provider dependency, cost, retention/legal decisions, and integration risk |

## Recommended First Durable Path For Pre-Launch

The safest future path is:

1. keep Step 148 console/security logging as fail-open telemetry;
2. design a small adapter interface that can write sanitized export audit events to durable storage later;
3. review whether existing `logAdminAudit` is sufficient for export-audit use;
4. if insufficient, create a dedicated Prisma-backed audit table only after schema, retention, and access policy are approved;
5. keep route integration fail-open until durable storage, retry, monitoring, and operational policies are mature.

## Minimum Schema/Data Fields

Without editing Prisma now, a future durable record likely needs:

- event type;
- timestamp;
- route pathname;
- method;
- result;
- report type;
- report type validity;
- status code;
- error code;
- actor role;
- static PII/business sensitivity booleans;
- request correlation id if a safe one exists later;
- non-sensitive environment label such as local/staging/production if approved.

## Fields That Must Never Be Stored

Do not store:

- raw CSV payloads or rows;
- customer names;
- emails;
- phone numbers;
- delivery addresses;
- order identifiers;
- payment identifiers;
- payment provider payloads;
- cookies;
- authorization headers;
- raw request bodies;
- raw query strings;
- date filters;
- raw errors;
- stack traces;
- database URLs;
- tokens or secrets.

## Fail-Open Vs Fail-Closed Decision

Recommended current policy: fail-open.

Reason:

- export behavior must remain stable;
- Step 148 logging is not complete compliance infrastructure;
- durable storage is not yet designed;
- a fail-closed policy would be a product/security behavior change.

Fail-closed should be reconsidered only after durable storage, alerting, retry, incident response, and DB/auth-backed tests are approved.

## Retention Implications

Durable storage requires a retention decision before implementation:

- local: disposable and test-only;
- staging: short retention with synthetic data;
- production: owner-approved retention window, backup handling, and incident workflow.

## Access-Control Implications

Future durable logs should not be visible to all admins by default.

Access likely needs separate permissions for:

- viewing export logs;
- exporting audit logs;
- managing retention;
- investigating incidents.

## Migration/Readiness Blockers

Durable DB storage is blocked by:

- no approved Prisma schema change in this batch;
- no approved migration;
- no retention/access policy decision;
- no DB/auth-backed tests;
- no production provider decision;
- no incident workflow decision.

## Future Implementation Stop Conditions

Stop future implementation if:

- it requires storing raw PII, CSV rows, headers, cookies, or secrets;
- it changes export response behavior without explicit approval;
- it requires migrations without a dedicated DB step;
- it depends on a provider not chosen yet;
- it weakens sanitizer protections.

## Recommended Next Loop

Proceed to Loop 151: retention and access policy review.
