# Step 135 Prompt Draft - Admin Export Confirmation QA Hardening

Copy-paste prompt for a future standalone step only:

```text
/plan

Run Boilabin Terminal Loop mode.

Goal for Step 135:
Strengthen no-DB/static QA around the admin export confirmation UI without changing export route behavior.

Context:

* Step 134 added a client-side admin export confirmation guard.
* CSV export routes, payloads, headers, status codes, admin access behavior, masking, redaction, role separation, and audit logging were intentionally preserved.

Read first:

* `audit-reports/134_ADMIN_REPORT_EXPORT_CONFIRMATION_UI.md`
* `src/frontend/components/admin/AdminReportExportLink.tsx`
* `src/app/(admin)/admin/reports/page.tsx`
* `src/backend/admin/reports.ts`
* `tests/admin-reports.test.ts`

Allowed files:

* `src/frontend/components/admin/AdminReportExportLink.tsx`
* `tests/admin-reports.test.ts`
* `audit-reports/135_ADMIN_EXPORT_CONFIRMATION_QA.md`
* `audit-reports/135_NEXT_PROMPT_DRAFT.md`

Requirements:

1. Review the export confirmation component.
2. Add or improve static/no-DB tests for confirmation copy source, href preservation, metadata-driven labels, cancel behavior, and absence of route/CSV payload assumptions.
3. If needed, make a tiny accessibility or safety adjustment only in the component file.
4. Do not render authenticated admin routes.
5. Do not run export routes.
6. Do not add dependencies.

Strict guardrails:

* Do not read private env files.
* Do not print secrets, full database URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, CSV rows, or raw user data.
* Do not query a database.
* Do not run DB-backed tests.
* Do not change export URLs, CSV payloads, field order, headers, response shapes, status codes, admin access behavior, masking state, redaction state, role separation state, or audit logging behavior.
* Do not edit Prisma schema, migrations, package files, Docker files, env files, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle, provider/deployment files, footer, newsletter, payment-logo, PromoSection, category image, or visual/media files.
* Do not restore Flash Deals, `/deals`, or `/api/admin/flash-sales`.
* Do not run migrations, `prisma db push`, seed/reset, SQL, Docker, deployment, provider CLI, package updates, or remote-service commands.

Validation commands:

* `node_modules\.bin\tsx --test tests\admin-reports.test.ts`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit only if validation passes and the staged set is exact.

Final response format:

1. Summary of Step 135 work
2. Files changed
3. QA/test hardening result
4. Validation results
5. Confirmation no prohibited files/actions were touched
6. Remaining risks
7. Recommended next step
```
