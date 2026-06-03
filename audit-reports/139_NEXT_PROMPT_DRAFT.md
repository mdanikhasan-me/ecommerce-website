# Step 140 Prompt Draft - Admin Export Role And Permission Decision Matrix

Copy-paste prompt for a future standalone step if not continuing inside an approved batch:

```text
/plan

Run Boilabin Terminal Loop mode.

Goal for Step 140:
Create a report-only admin export role and permission decision matrix. Do not implement role-separated permissions yet.

Context:

* Step 134 added admin export confirmation UI.
* Step 135 hardened no-DB/static QA.
* Step 136 added admin CSV handling guidance.
* Step 137 reviewed remaining admin export control gaps.
* Step 138 summarized the previous admin export safety batch.
* Step 139 designed sanitized admin export audit logging without implementation.
* Admin exports still rely on broad admin access.

Allowed files:

* `audit-reports/140_ADMIN_EXPORT_ROLE_PERMISSION_MATRIX.md`
* `audit-reports/140_NEXT_PROMPT_DRAFT.md`

Read first:

* `audit-reports/139_ADMIN_EXPORT_AUDIT_LOGGING_DESIGN.md`
* `audit-reports/137_ADMIN_EXPORT_CONTROL_GAP_REVIEW.md`
* `src/backend/admin/reports.ts`
* `src/app/api/admin/reports/export/route.ts`

Requirements:

1. Create a report-only matrix for future export permissions.
2. Classify `orders`, `products`, and `customers` exports by risk.
3. Identify possible future permission names without implementing them.
4. Preserve current broad admin behavior until a later approved implementation step.
5. Identify no-DB tests possible before implementation.
6. Identify DB/auth-backed tests required later.
7. Identify mobile/API compatibility considerations.

Strict guardrails:

* Do not implement permissions.
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

1. Summary of Step 140 work
2. Files changed
3. Role/permission matrix result
4. Validation results
5. Confirmation no prohibited files/actions were touched
6. Remaining risks
7. Recommended next step
```
