# Step 139 Prompt Draft - Sanitized Admin Export Audit Logging Design

Copy-paste prompt for a future standalone step only:

```text
/plan

Run Boilabin Terminal Loop mode.

Goal for Step 139:
Create a report-only sanitized admin export audit logging design for future implementation. Do not implement logging yet.

Context:

* Step 134 added admin export confirmation UI.
* Step 135 hardened no-DB/static QA.
* Step 136 added admin CSV handling guidance.
* Step 137 reviewed remaining admin export control gaps.
* Step 138 summarized the completed execution batch.
* The next safest remaining control is designing sanitized export audit logging before any implementation.

Allowed files:

* `audit-reports/139_ADMIN_EXPORT_AUDIT_LOGGING_DESIGN.md`
* `audit-reports/139_NEXT_PROMPT_DRAFT.md`

Read first:

* `audit-reports/138_TERMINAL_BATCH_EXECUTION_SUMMARY.md`
* `audit-reports/137_ADMIN_EXPORT_CONTROL_GAP_REVIEW.md`
* `audit-reports/136_ADMIN_EXPORT_CSV_HANDLING_GUIDANCE.md`
* `audit-reports/135_ADMIN_EXPORT_CONFIRMATION_QA.md`
* `audit-reports/134_ADMIN_REPORT_EXPORT_CONFIRMATION_UI.md`
* `src/backend/security/security-log.ts`
* `src/backend/admin/reports.ts`
* `src/app/api/admin/reports/export/route.ts`

Requirements:

1. Create a report-only design for future sanitized export audit logging.
2. Define allowed event fields, such as event type, report type, route pathname, method, status, safe result code, timestamp, and safe actor role if already available.
3. Define forbidden fields, including raw CSV rows, customer names, customer emails, phone numbers, order identifiers tied to real data, raw query strings, cookies, authorization headers, tokens, private env values, raw request bodies, database URLs, and stack traces.
4. Identify storage and retention decisions needed before implementation.
5. Identify no-DB tests that can be added before implementation.
6. Identify DB/auth-backed tests needed later.
7. Preserve current export route behavior, CSV payloads, response headers, admin access behavior, confirmation behavior, masking/redaction state, role separation state, and storage state.
8. Create one next prompt draft only.

Strict guardrails:

* Do not implement logging.
* Do not edit source, tests, scripts, runtime config, env files, Prisma files, package files, Docker files, assets, visual files, or frontend/admin behavior.
* Do not read private env files.
* Do not print secrets, full database URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, CSV rows, or raw user data.
* Do not query a database or run export routes.
* Do not change export URLs, CSV payloads, field order, headers, response shapes, status codes, admin access behavior, masking state, redaction state, role separation state, audit logging behavior, or storage behavior.
* Do not edit Prisma schema, migrations, package files, Docker files, env files, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle, provider/deployment files, footer, newsletter, payment-logo, PromoSection, category image, or visual/media files.
* Do not restore Flash Deals, `/deals`, or `/api/admin/flash-sales`.
* Do not run migrations, `prisma db push`, seed/reset, SQL, Docker, deployment, provider CLI, package updates, or remote-service commands.

Validation commands:

* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit only if validation passes and the staged set is exact.

Final response format:

1. Summary of Step 139 work
2. Files changed
3. Audit logging design result
4. Validation results
5. Confirmation no prohibited files/actions were touched
6. Remaining risks
7. Recommended next step
```
