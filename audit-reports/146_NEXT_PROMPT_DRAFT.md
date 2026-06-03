# Step 147 Prompt Draft - Admin Export Audit Route Integration Readiness Review

```text
/plan

We are continuing the Boilabin pre-launch e-commerce technical recovery workflow.

Latest completed state:

* Step 146: audit-reports/146_ADMIN_EXPORT_AUDIT_LOGGING_READINESS_SUMMARY.md
* Step 144 added a no-DB admin export audit event helper.
* Step 145 hardened no-DB tests for the helper.
* The helper is not wired into the live export route.
* Runtime export behavior, CSV payloads, headers, status codes, admin access, masking/redaction, role separation, storage, and durable logging remain unchanged.

Goal for Step 147:
Perform a report-only admin export audit route integration readiness review. Do not implement route logging yet.

Read first:

* audit-reports/139_ADMIN_EXPORT_AUDIT_LOGGING_DESIGN.md
* audit-reports/144_ADMIN_EXPORT_AUDIT_EVENT_HELPER.md
* audit-reports/145_ADMIN_EXPORT_AUDIT_EVENT_TEST_HARDENING.md
* audit-reports/146_ADMIN_EXPORT_AUDIT_LOGGING_READINESS_SUMMARY.md
* src/backend/admin/export-audit-log.ts
* src/backend/security/security-log.ts
* src/app/api/admin/reports/export/route.ts
* tests/admin-reports.test.ts

Allowed files:

* audit-reports/147_ADMIN_EXPORT_AUDIT_ROUTE_INTEGRATION_READINESS.md
* audit-reports/147_NEXT_PROMPT_DRAFT.md

Tasks:

1. Map the current live export route without changing it.
2. Identify safe future hook points for attempted, blocked, success, and failure export events.
3. Decide what must be true before route integration is safe.
4. Document whether initial integration should use existing sanitized security logging only.
5. Document whether logging failures should be fail-open or fail-closed, but do not implement either.
6. Document how payment/order sensitivity metadata should be mapped safely through the generic sanitizer later.
7. List no-DB tests and DB/auth-backed tests required before and after integration.
8. Draft exactly one Step 148 prompt. Step 148 may be a bounded no-DB route source/test integration only if clearly safe; otherwise it should remain report-only.

Strict guardrails:

* Do not edit source files.
* Do not edit tests.
* Do not wire logging into the route.
* Do not call logSecurityEvent from the export route.
* Do not create durable storage.
* Do not change export URLs, CSV payloads, field order, headers, status codes, response shapes, admin access behavior, masking/redaction, role separation, or storage behavior.
* Do not run export routes.
* Do not query the database.
* Do not require authenticated admin credentials.
* Do not read private env files.
* Do not print secrets, full DB URLs, tokens, cookies, credentials, auth headers, payment secrets, private connection strings, customer/order PII, raw CSV rows, or raw user data.
* Do not run migrations, database push, seed/reset, SQL, Docker, provider CLI, deployment, package updates, or remote-service commands.
* Do not touch Prisma schema, migrations, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle, footer, newsletter, payment-logo, PromoSection, category images, or visual/media assets.
* Do not restore Flash Deals, /deals, or /api/admin/flash-sales.
* Never use broad staging.

Validation:

* node scripts/boilabin-terminal-loop-state.mjs
* node scripts/boilabin-advisor-state.mjs
* npm run db:url:safety
* npm run typecheck
* npm run lint
* npm test
* npm run build

Commit:

Stage only:

* audit-reports/147_ADMIN_EXPORT_AUDIT_ROUTE_INTEGRATION_READINESS.md
* audit-reports/147_NEXT_PROMPT_DRAFT.md

Commit message:

docs: review admin export audit route integration

Final response format:

1. Summary of Step 147 work
2. Files changed
3. Route integration readiness result
4. Validation results
5. Commit hash/oneline, or reason no commit happened
6. Confirmation no runtime/source/test behavior changed
7. Confirmation no prohibited files/actions occurred
8. Remaining risks
9. Recommended next step
```
