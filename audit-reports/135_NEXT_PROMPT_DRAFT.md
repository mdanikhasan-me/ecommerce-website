# Step 136 Prompt Draft - Admin CSV Handling Guidance

Copy-paste prompt for a future standalone step only:

```text
/plan

Run Boilabin Terminal Loop mode.

Goal for Step 136:
Add admin-facing operational guidance for CSV export handling and retention without changing backend export behavior.

Context:

* Step 134 added admin export confirmation UI.
* Step 135 strengthened no-DB/static QA around the confirmation UI.
* CSV exports may contain PII, order/payment-sensitive data, or business-sensitive inventory/sales data.

Allowed files:

* `docs/operations/ADMIN_EXPORT_CSV_HANDLING_GUIDE.md`
* `src/app/(admin)/admin/reports/page.tsx`
* `tests/admin-reports.test.ts`
* `audit-reports/136_ADMIN_EXPORT_CSV_HANDLING_GUIDANCE.md`
* `audit-reports/136_NEXT_PROMPT_DRAFT.md`

Requirements:

1. Create a concise admin export CSV handling guide.
2. Cover sensitive data, no public sharing, deleting local exports when no longer needed, avoiding repo folders, future approved storage/retention decisions, and non-legal-advice wording.
3. Optionally add a compact link or note on the admin reports page pointing admins to the guide.
4. Preserve export hrefs and confirmation behavior.
5. Add/update static tests only if practical.

Strict guardrails:

* Do not add real logging, storage, masking, redaction, permissions, route changes, or DB tests.
* Do not read private env files.
* Do not print secrets, full database URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, CSV rows, or raw user data.
* Do not query a database or run export routes.
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

1. Summary of Step 136 work
2. Files changed
3. CSV handling guidance result
4. Validation results
5. Confirmation no prohibited files/actions were touched
6. Remaining risks
7. Recommended next step
```
