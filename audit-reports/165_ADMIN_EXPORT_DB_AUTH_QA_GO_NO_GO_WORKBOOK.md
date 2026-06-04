# Step 165 - Admin Export DB/Auth QA Go No-Go Workbook

## Local DB Readiness Requirements

- Local app database URL classified local.
- Separate local shadow database URL classified local.
- Local PostgreSQL service reachable.
- Prisma client generated.
- No remote database connection.
- No migration/seed/reset unless separately approved.

## Local-Only Fixture Requirements

- Synthetic admin account.
- Synthetic non-admin account.
- Minimal products, orders, and customers fixtures.
- No production data.
- No real customer identifiers.
- No real credentials.

## Route Execution Approval Requirements

Future DB/auth QA requires explicit approval to:

- execute admin export route requests;
- mock or create auth sessions;
- capture sanitized logger output;
- compare CSV output from synthetic fixtures.

## Fixture CSV Requirements

- Deterministic field order.
- Small row counts.
- Synthetic values only.
- No raw copied customer/order data.
- Expected CSV snapshots stored safely if approved.

## Logging Capture Requirements

- Capture sanitized logger output only.
- Do not print cookies, headers, raw queries, raw errors, or CSV rows in logs.
- Assert bounded fields only.
- Verify fail-open behavior with a controlled logger failure.

## Prohibited Output Checklist

Do not output:

- secrets;
- full DB URLs;
- cookies;
- authorization headers;
- raw request bodies;
- raw CSV payloads;
- raw customer/order data;
- raw database errors or stacks.

## Scenario List

- unauthenticated request blocked;
- non-admin request blocked;
- invalid report type blocked;
- successful customers export;
- successful orders export;
- successful products export;
- simulated export failure after admin auth;
- simulated logging failure proving fail-open behavior.

## Required Assertions

- response status unchanged;
- headers unchanged;
- CSV payload unchanged for fixture;
- CSV field order unchanged;
- invalid/error response bodies unchanged;
- audit event result/status/error code bounded;
- report type allowlisted;
- PII/business flags static only;
- no payment-named runtime key;
- no raw sensitive values logged.

## Future Commands

Potential future commands after approval:

- `npm run db:url:safety`
- targeted DB/auth QA test command for admin export route
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

## Go/No-Go Table

| Requirement | Ready now? | Evidence needed | Blocker | Next action |
| --- | --- | --- | --- | --- |
| Local DB URLs local/separate | Yes | `npm run db:url:safety` | None observed in this batch | Keep checking |
| Local PostgreSQL reachable | Unknown | Explicit service check | Not verified in this batch | Separate approved DB readiness step |
| Auth fixtures approved | No | Owner approval | Fixture policy | Owner decision |
| Route execution approved | No | Owner approval | Guardrail | Owner decision |
| Synthetic export fixtures | No | Fixture plan/data | DB setup and policy | Plan fixtures |
| Logger capture strategy | No | Test design | No approved route tests | No-DB design first |
| Prohibited output controls | Partially | Test assertions | DB/auth tests absent | Include in future QA |

## Recommendation

DB/auth QA should be delayed until route execution, fixture strategy, and local service readiness are explicitly approved. The safer next implementation candidate is no-DB durable audit adapter/interface design and tests.

## Recommended Next Loop

Proceed to Loop 166: implementation sequence decision.
