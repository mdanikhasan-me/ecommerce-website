# Step 142 Prompt Draft - Admin Product Export SKU Sensitivity Matrix

Copy-paste prompt for a future standalone step if not continuing inside an approved batch:

```text
/plan

Run Boilabin Terminal Loop mode.

Goal for Step 142:
Create a report-only SKU sensitivity decision matrix for admin product exports. Do not decide or implement SKU policy yet.

Context:

* Step 139 designed sanitized admin export audit logging.
* Step 140 created a role and permission decision matrix.
* Step 141 reviewed masking/redaction compatibility.
* Product export metadata still marks SKU as `unknown-needs-policy`.

Allowed files:

* `audit-reports/142_ADMIN_PRODUCT_EXPORT_SKU_SENSITIVITY_MATRIX.md`
* `audit-reports/142_NEXT_PROMPT_DRAFT.md`

Read first:

* `audit-reports/141_ADMIN_EXPORT_MASKING_REDACTION_COMPATIBILITY_REVIEW.md`
* `audit-reports/140_ADMIN_EXPORT_ROLE_PERMISSION_MATRIX.md`
* `audit-reports/137_ADMIN_EXPORT_CONTROL_GAP_REVIEW.md`
* `src/backend/admin/reports.ts`

Requirements:

1. Create a report-only SKU sensitivity matrix.
2. Compare treating SKU as public catalog identifier, internal inventory identifier, or mixed/contextual data.
3. Identify compatibility risks for CSV consumers.
4. Identify policy decisions needed before changing metadata or CSV behavior.
5. Identify no-DB tests possible before implementation.
6. Preserve current SKU metadata, CSV payloads, field order, headers, response shapes, and admin access behavior.

Strict guardrails:

* Do not decide final SKU policy.
* Do not edit source, tests, scripts, runtime config, env files, Prisma files, package files, Docker files, assets, visual files, or frontend/admin behavior.
* Do not read private env files.
* Do not print secrets, full database URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, CSV rows, or raw user data.
* Do not query a database or run export routes.
* Do not change export URLs, CSV payloads, field order, headers, response shapes, status codes, admin access behavior, SKU metadata, masking state, redaction state, role separation state, audit logging behavior, or storage behavior.
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

1. Summary of Step 142 work
2. Files changed
3. SKU sensitivity matrix result
4. Validation results
5. Confirmation no prohibited files/actions were touched
6. Remaining risks
7. Recommended next step
```
