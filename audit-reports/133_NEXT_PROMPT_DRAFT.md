# Step 134 Prompt Draft - Admin Report Export Confirmation UI

Copy-paste prompt for a future standalone step only:

```text
/plan

Run Boilabin Terminal Loop mode.

Goal for Step 134:
Add a small no-DB admin report export confirmation UI guard using the existing admin report sensitivity metadata, while preserving CSV export routes and payloads.

Context:

* Step 133 recommended export confirmation as the safest first operational control.
* Admin export sensitivity metadata and UI labels already exist.
* This step may change admin reports UI behavior only by adding a confirmation before navigation to CSV export links.
* Do not change export route behavior, CSV payloads, field order, headers, status codes, permissions, masking, redaction, or audit logging.

Read first:

* `audit-reports/133_BATCH_LOOP_SAFE_FOLLOWUP_PLAN.md`
* `audit-reports/130_ADMIN_REPORT_EXPORT_UI_SENSITIVITY_LABELS.md`
* `audit-reports/129_ADMIN_REPORT_EXPORT_SENSITIVITY_METADATA.md`
* `src/app/(admin)/admin/reports/page.tsx`
* `src/backend/admin/reports.ts`
* `tests/admin-reports.test.ts`

Allowed files:

* `src/app/(admin)/admin/reports/page.tsx`
* `src/frontend/components/admin/AdminReportExportLink.tsx`
* `tests/admin-reports.test.ts`
* `audit-reports/134_ADMIN_REPORT_EXPORT_CONFIRMATION_UI.md`
* `audit-reports/134_NEXT_PROMPT_DRAFT.md`

Implementation requirements:

1. Add a tiny client-side admin export link/button component if needed.
2. Require browser confirmation before navigating to each CSV export URL.
3. Use existing metadata labels/warnings for confirmation copy.
4. Preserve existing export hrefs exactly.
5. Preserve existing visible sensitivity labels.
6. Preserve CSV route behavior and backend export logic.
7. Add no-DB tests or static source tests that verify confirmation metadata wiring and export href preservation.
8. Create the Step 134 audit report and next prompt draft.

Strict guardrails:

* Do not run report export routes.
* Do not query a database.
* Do not run DB-backed route tests.
* Do not read private env files.
* Do not print secrets, full database URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, CSV rows, or raw user data.
* Do not change CSV payloads, field order, response headers, response shapes, status codes, export URLs, admin access behavior, masking state, redaction state, role separation state, or audit logging behavior.
* Do not add persistent logging or storage.
* Do not edit Prisma schema, migrations, seed/reset scripts, package files, Docker files, env files, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle, or provider/deployment files.
* Do not touch footer, newsletter, payment-logo, PromoSection, category image, or visual/media files.
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

1. Summary of Step 134 work
2. Files changed
3. Export confirmation behavior
4. Tests added/updated
5. Validation results
6. Confirmation no prohibited files/actions were touched
7. Remaining risks
8. Recommended next step
```
