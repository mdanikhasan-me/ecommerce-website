# Step 133 Prompt Draft - Admin Report Export Operational Controls Policy Audit

Copy-paste prompt for the next approved loop only:

```text
/plan

Run Loop 3 of the approved Boilabin Terminal Batch Loop mode.

Goal for Step 133:
Create a report-only admin report export operational controls policy audit and the next prompt draft, then stop. Do not implement export controls yet.

Context:

* Step 132 reviewed the current roadmap.
* Admin report export work has already added CSV/date guardrails, PII/sensitivity metadata, and UI sensitivity labels.
* Remaining admin export risks are operational controls: confirmation, export audit logging, role separation, masking/redaction, retention/download handling, and SKU sensitivity policy.
* This loop is report-only.

Allowed files to create or edit:

* `audit-reports/133_BATCH_LOOP_SAFE_FOLLOWUP_PLAN.md`
* `audit-reports/133_NEXT_PROMPT_DRAFT.md`

Read first:

* `audit-reports/132_BATCH_LOOP_ROADMAP_REVIEW.md`
* `audit-reports/130_ADMIN_REPORT_EXPORT_UI_SENSITIVITY_LABELS.md`
* `audit-reports/129_ADMIN_REPORT_EXPORT_SENSITIVITY_METADATA.md`
* `audit-reports/128_ADMIN_REPORT_EXPORT_PII_PERMISSION_AUDIT.md`
* `audit-reports/127_ADMIN_REPORT_EXPORT_GUARDRAILS.md`
* `src/app/(admin)/admin/reports/page.tsx`
* `src/backend/admin/reports.ts`
* `tests/admin-reports.test.ts`

Tasks:

1. Verify the current latest commit and staged set.
2. Review the admin report export state from the files listed above.
3. Create a report-only operational controls policy audit covering:
   * export confirmation needs;
   * sanitized export audit logging needs;
   * role/permission separation considerations;
   * masking/redaction considerations;
   * CSV retention and download handling;
   * SKU sensitivity policy;
   * mobile/API stability considerations;
   * no-DB test opportunities;
   * DB/auth-backed test requirements for later.
4. Classify controls as:
   * safe to implement later without DB;
   * needs explicit product/security decision;
   * needs authenticated DB-backed testing;
   * should not be changed before staging/provider decisions.
5. Draft the next safest standalone Step 134 prompt.
6. Validate, exact-stage only the two allowed reports, commit if validation is acceptable, and stop.

Strict guardrails:

* Do not edit source, tests, scripts, runtime config, env files, Prisma files, package files, Docker files, assets, routes, or frontend/admin behavior.
* Do not change CSV payloads, export URLs, response headers, response shapes, status codes, admin access behavior, masking state, redaction state, role separation state, or audit logging behavior.
* Do not read private env files.
* Do not print secrets, full database URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, or raw user data.
* Do not run report export routes.
* Do not query a database.
* Do not run DB-backed tests.
* Do not run migrations, create migrations, edit Prisma schema, run `prisma db push`, seed/reset, SQL, Docker, deployment, provider CLI, or package update commands.
* Do not touch footer, newsletter, payment-logo, PromoSection, category image, or visual/media files.
* Do not enable payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile app implementation, product lifecycle work, or Flash Deals.
* Do not restore `/deals` or `/api/admin/flash-sales`.
* Do not execute a fourth loop.

Validation commands:

* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit command if validation is acceptable and the staged set is exact:

* `git commit -m "docs: add batch loop followup plan"`

Final response format:

1. Loop 3 summary
2. Files staged/committed
3. Validation results
4. Commit hash/oneline, or reason no commit happened
5. Confirmation no prohibited files/actions were touched
6. Remaining risks
7. Recommended next standalone step
8. Confirmation stopped after Loop 3 and did not execute Loop 4
```
