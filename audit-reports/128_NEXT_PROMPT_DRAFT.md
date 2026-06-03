Run Boilabin Terminal Loop mode.

/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 128 should be verified from git before edits.
* Step 128 audited admin report export PII fields, access assumptions, and permission-label risks.
* Step 128 did not execute this prompt.

Your task is Step 129:

ADMIN REPORT EXPORT SENSITIVITY METADATA

Goal:
Use one bounded terminal-first 10-step loop to add no-DB admin report export sensitivity/permission metadata and tests for orders, products, and customers, preserving current CSV payloads and admin access behavior.

This is a bounded source/test/report step. Do not change CSV output rows, route response shapes, admin access behavior, UI labels, masking, redaction, or role separation in this step.

Read first:

* audit-reports/128_ADMIN_REPORT_EXPORT_PII_PERMISSION_AUDIT.md
* audit-reports/128_NEXT_PROMPT_DRAFT.md
* audit-reports/127_ADMIN_REPORT_EXPORT_GUARDRAILS.md
* src/backend/admin/reports.ts
* tests/admin-reports.test.ts
* src/app/api/admin/reports/export/route.ts
* src/app/(admin)/admin/reports/page.tsx

Allowed files:

You may edit only:

1. src/backend/admin/reports.ts
2. tests/admin-reports.test.ts
3. audit-reports/129_ADMIN_REPORT_EXPORT_SENSITIVITY_METADATA.md
4. audit-reports/129_NEXT_PROMPT_DRAFT.md

Do not edit any other files.

Strict guardrails:

* Do not read `.env`, `.env.local`, or private env files.
* Do not print secrets, full DB URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII from real data, raw report rows, or raw user data.
* Do not run report export routes.
* Do not query the database.
* Do not run DB-backed report export tests.
* Do not require authenticated admin credentials.
* Do not deploy.
* Do not configure hosting.
* Do not run provider CLIs.
* Do not update packages.
* Do not run Docker setup.
* Do not connect remote services.
* Do not run migrations.
* Do not create migrations.
* Do not edit Prisma schema.
* Do not run `prisma db push`.
* Do not seed/reset.
* Do not run SQL or destructive DB commands.
* Do not standardize API responses broadly.
* Do not change admin report success payloads or CSV response shape.
* Do not change route behavior or admin access behavior.
* Do not implement masking, redaction, role separation, UI changes, route changes, or export audit logging in this step.
* Do not touch assets, visual/media files, footer/newsletter/payment-logo/PromoSection/category images.
* Do not enable or edit payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile app implementation, or product lifecycle.
* Do not restore Flash Deals or Flash Sales.
* `/deals` and `/api/admin/flash-sales` must remain removed.
* Do not restore `public/assets/categories/baby-kids.jpg`.
* Do not undo Toys & Collectibles.
* Never use `git add .`.
* Never use `git add -A`.

Run exactly one 10-step loop, then stop.

Step 1 - Terminal baseline:
Run and record:

* git status --short
* git log -1 --oneline
* node scripts/boilabin-terminal-loop-state.mjs
* node scripts/boilabin-advisor-state.mjs

Step 2 - Read-only planning lanes:
Use real subagents if available:

* Explorer
* Guardian
* Validator
* Docs Auditor
* Advisor

If real subagents are unavailable, use simulated lanes and clearly say so.

All lanes are read-only.

Step 3 - Evidence review:
Review Step 128 and current admin report helper/test structure. Identify the smallest metadata shape that can label export sensitivity without changing CSV output.

Step 4 - Coordinator decision:
Choose a minimal metadata shape, such as an exported constant or helper that defines report type, field names, sensitivity categories, and recommended labels.

Step 5 - Implement bounded changes:
Allowed implementation examples:

* add an exported metadata constant or helper in `src/backend/admin/reports.ts`;
* keep `buildAdminReportCsv` output unchanged;
* add no-DB tests in `tests/admin-reports.test.ts` proving orders/customers are customer-data-bearing, products are business-sensitive, and field categories are present.

Step 6 - State script changes:
Do not change state scripts in this step.

Step 7 - Focused tests:
Add or extend only `tests/admin-reports.test.ts`.

Step 8 - Audit report and next prompt:
Create:

* audit-reports/129_ADMIN_REPORT_EXPORT_SENSITIVITY_METADATA.md
* audit-reports/129_NEXT_PROMPT_DRAFT.md

The Step 129 report must include:

* Scope
* Latest Commit Verified
* Initial Git Status
* Terminal Baseline Results
* Multi-Agent Planning Mode Used
* Explorer Lane Summary
* Guardian Lane Summary
* Validator Lane Summary
* Docs Auditor Lane Summary
* Advisor Lane Summary
* Metadata Shape Added
* CSV Payload Preservation
* Tests Added Or Updated
* DB/Auth-Backed Branches Skipped
* Behavior Changes Made
* Validation Results
* Prohibited Actions Not Performed
* Remaining Risks
* Recommended Next Step

The next prompt draft must be draft-only and must not execute Step 130.

Step 9 - Validation:
Run and record:

* node scripts/boilabin-terminal-loop-state.mjs
* node scripts/boilabin-advisor-state.mjs
* npm run db:url:safety
* npm run typecheck
* npm run lint
* npm test
* npm run build

If build fails only because DB-backed static generation cannot reach local PostgreSQL, classify it as the known environment blocker. If validation fails for a task-caused reason, fix only inside the allowed files and rerun affected checks.

Step 10 - Exact staging and commit:
Stage only:

```powershell
git add -- src/backend/admin/reports.ts tests/admin-reports.test.ts audit-reports/129_ADMIN_REPORT_EXPORT_SENSITIVITY_METADATA.md audit-reports/129_NEXT_PROMPT_DRAFT.md
```

Then run:

* git diff --cached --name-only

Confirm only allowed files with real changes are staged. If any other file is staged, stop and do not commit.

Commit message:

```text
chore: add admin report export sensitivity metadata
```

Stop conditions:

* Stop if any prohibited file/action would be required.
* Stop if the task would require real admin credentials, a live database, DB mutation, provider decisions, deployment, migrations, package updates, Docker setup, route changes, UI changes, or unapproved visual/media work.
* Stop if validation fails for a task-caused reason that cannot be fixed inside the allowed files.
* Stop if the generated Step 130 prompt would be executed automatically.

Final response format:
Give me only:

1. Summary of Step 129 work.
2. Whether terminal-first mode was used.
3. Whether real subagents were used or simulated lanes were used.
4. Whether the 10-step loop completed.
5. Whether commit succeeded.
6. Commit hash if committed.
7. Exact files changed/staged/committed.
8. Latest commit verified before Step 129.
9. Metadata shape added.
10. CSV payload preservation result.
11. Tests added or updated.
12. Validation results.
13. Prohibited files/actions confirmation.
14. Remaining risks.
15. Recommended next safest step.
16. Confirmation that Codex stopped and did not execute Step 130.
