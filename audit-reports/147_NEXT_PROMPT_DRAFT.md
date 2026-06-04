# Step 148 Prompt Draft - Bounded Admin Export Audit Logging Source Integration

```text
/plan

We are continuing the Boilabin pre-launch e-commerce technical recovery workflow.

Latest completed state:

* Step 147: audit-reports/147_ADMIN_EXPORT_AUDIT_ROUTE_INTEGRATION_READINESS.md
* Step 147 was report-only and did not change runtime behavior.
* Step 144 added src/backend/admin/export-audit-log.ts, a no-DB helper for sanitized admin export audit event objects.
* Step 145 hardened no-DB tests for the helper.
* Step 147 found the route is conditionally ready for a bounded no-DB source/test integration only if runtime logging changes are explicitly approved.

Goal for Step 148:
Implement the first bounded no-DB source/test integration of sanitized admin export audit logging into the live export route, using existing sanitized security logging only.

Important:
This step changes runtime logging behavior only. It must not change export responses, CSV payloads, headers, status codes, admin access behavior, masking/redaction, role separation, or storage behavior.

Read first:

* audit-reports/147_ADMIN_EXPORT_AUDIT_ROUTE_INTEGRATION_READINESS.md
* audit-reports/144_ADMIN_EXPORT_AUDIT_EVENT_HELPER.md
* audit-reports/145_ADMIN_EXPORT_AUDIT_EVENT_TEST_HARDENING.md
* src/backend/admin/export-audit-log.ts
* src/backend/security/security-log.ts
* src/app/api/admin/reports/export/route.ts
* tests/admin-reports.test.ts

Allowed files:

* src/app/api/admin/reports/export/route.ts
* src/backend/admin/export-audit-log.ts
* tests/admin-reports.test.ts
* audit-reports/148_ADMIN_EXPORT_AUDIT_LOGGING_SOURCE_INTEGRATION.md
* audit-reports/148_NEXT_PROMPT_DRAFT.md

Tasks:

1. Integrate the existing helper into the export route with existing sanitized `logSecurityEvent` only.
2. Use fail-open logging: logging failures must never block exports or alter response behavior.
3. Add only bounded event calls for:
   * blocked unauthorized/non-admin export;
   * blocked invalid report type;
   * successful export;
   * failed export after route handling throws.
4. Do not log raw query strings, full URLs, date-filter values, headers, cookies, request bodies, response bodies, CSV content, CSV rows, actor email/name/id, customer identifiers, order identifiers, raw errors, or stack traces.
5. For payment/order sensitivity metadata:
   * do not weaken the generic sanitizer;
   * either omit the helper's payment/order sensitivity flag from `logSecurityEvent` metadata;
   * or map it to a tested allowlisted static boolean such as `containsOrderSensitiveData`;
   * do not log raw payment or order data.
6. Add no-DB/source tests only.
7. Do not run export routes.
8. Do not query the database.
9. Create the Step 148 report and exactly one future prompt draft.

Strict guardrails:

* Do not change export URLs.
* Do not change CSV payloads.
* Do not change CSV field order.
* Do not change response headers.
* Do not change status codes.
* Do not change response shapes.
* Do not change admin access behavior.
* Do not change masking/redaction behavior.
* Do not change role separation.
* Do not create durable storage.
* Do not use the DB-backed admin audit-log writer.
* Do not run export routes.
* Do not query the database.
* Do not require authenticated admin credentials.
* Do not read private env files.
* Do not print secrets, full DB URLs, tokens, cookies, credentials, auth headers, payment secrets, private connection strings, customer/order PII, raw CSV rows, or raw user data.
* Do not run migrations, database push, seed/reset, SQL, Docker, provider CLI, deployment, package updates, or remote-service commands.
* Do not touch Prisma schema, migrations, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle, footer, newsletter, payment-logo, PromoSection, category images, or visual/media assets.
* Do not restore Flash Deals.
* /deals must remain removed.
* /api/admin/flash-sales must remain removed.
* Do not restore public/assets/categories/baby-kids.jpg.
* Do not undo Toys & Collectibles.
* Never use broad staging.

Validation:

* node scripts/boilabin-terminal-loop-state.mjs
* node scripts/boilabin-advisor-state.mjs
* npm run db:url:safety
* .\\node_modules\\.bin\\tsx --test tests\\admin-reports.test.ts
* npm run typecheck
* npm run lint
* npm test
* npm run build

Staging:

Stage only the exact allowed files that changed.

Commit message:

fix: add fail-open admin export audit logging

Stop conditions:

* Stop if the change requires DB/auth-backed route execution.
* Stop if the source integration would alter export status, headers, body, CSV payload, or admin access behavior.
* Stop if logging failure policy cannot remain fail-open.
* Stop if metadata mapping cannot be proven safe with no-DB tests.
* Stop if any prohibited file/action becomes required.
* Do not execute the future prompt draft.

Final response format:

1. Summary of Step 148 work
2. Files changed/staged/committed
3. Runtime behavior preservation result
4. Logging failure policy result
5. Metadata mapping result
6. No-DB tests added/updated
7. Validation results
8. Commit hash/oneline, or reason no commit happened
9. Confirmation no prohibited files/actions occurred
10. Remaining risks
11. Recommended next step
```
