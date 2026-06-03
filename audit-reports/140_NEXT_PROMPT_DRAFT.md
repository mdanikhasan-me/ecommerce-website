# Step 141 Prompt Draft - Admin Export Masking And Redaction Compatibility Review

Copy-paste prompt for a future standalone step if not continuing inside an approved batch:

```text
/plan

Run Boilabin Terminal Loop mode.

Goal for Step 141:
Create a report-only masking and redaction compatibility review for admin CSV exports. Do not implement masking or redaction yet.

Context:

* Step 139 designed sanitized admin export audit logging.
* Step 140 created a role and permission decision matrix.
* Current CSV payloads and field order must remain unchanged until a later explicit product/security decision.

Allowed files:

* `audit-reports/141_ADMIN_EXPORT_MASKING_REDACTION_COMPATIBILITY_REVIEW.md`
* `audit-reports/141_NEXT_PROMPT_DRAFT.md`

Read first:

* `audit-reports/140_ADMIN_EXPORT_ROLE_PERMISSION_MATRIX.md`
* `audit-reports/139_ADMIN_EXPORT_AUDIT_LOGGING_DESIGN.md`
* `audit-reports/137_ADMIN_EXPORT_CONTROL_GAP_REVIEW.md`
* `src/backend/admin/reports.ts`

Requirements:

1. Map existing CSV fields by export type.
2. Identify fields that may need masking/redaction later.
3. Identify compatibility risks if CSV fields or values change.
4. Identify no-DB tests possible before implementation.
5. Identify DB/auth-backed tests required later.
6. Preserve current CSV payloads, field order, headers, response shapes, and admin access behavior.

Strict guardrails:

* Do not implement masking or redaction.
* Do not edit source, tests, scripts, runtime config, env files, Prisma files, package files, Docker files, assets, visual files, or frontend/admin behavior.
* Do not read private env files.
* Do not print secrets, full database URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, CSV rows, or raw user data.
* Do not query a database or run export routes.
* Do not change export URLs, CSV payloads, field order, headers, response shapes, status codes, admin access behavior, masking state, redaction state, role separation state, audit logging behavior, or storage behavior.
* Do not run migrations, `prisma db push`, seed/reset, SQL, Docker, deployment, provider CLI, package updates, or remote-service commands.

Validation commands:

* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Final response format:

1. Summary of Step 141 work
2. Files changed
3. Masking/redaction compatibility result
4. Validation results
5. Confirmation no prohibited files/actions were touched
6. Remaining risks
7. Recommended next step
```
