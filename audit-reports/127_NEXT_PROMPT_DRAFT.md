Run Boilabin Terminal Loop mode.

/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 127 should be verified from git before edits.
* Step 127 hardened no-DB admin report export helper behavior and expanded helper tests.
* Step 127 did not execute this prompt.

Your task is Step 128:

ADMIN REPORT EXPORT PII AND PERMISSION-LABEL AUDIT

Goal:
Use one bounded terminal-first 10-step loop to inventory admin report export PII fields, access assumptions, and permission-label risks without changing runtime behavior.

This is report-only. Do not edit source, tests, routes, frontend callers, Prisma files, env files, or assets.

Read first:

* audit-reports/127_ADMIN_REPORT_EXPORT_GUARDRAILS.md
* audit-reports/127_NEXT_PROMPT_DRAFT.md
* src/backend/admin/reports.ts
* src/app/api/admin/reports/export/route.ts
* src/app/api/admin/reports/route.ts
* src/app/(admin)/admin/reports/page.tsx
* audit-reports/41_API_ERROR_CONTRACT_TEST_PLAN.md
* audit-reports/42_API_RESPONSE_STANDARDIZATION_PLAN.md
* audit-reports/119_PRELAUNCH_HOSTING_ENVIRONMENT_READINESS_AUDIT.md

Allowed files:

You may create/edit only:

1. audit-reports/128_ADMIN_REPORT_EXPORT_PII_PERMISSION_AUDIT.md
2. audit-reports/128_NEXT_PROMPT_DRAFT.md

Do not edit any other files.

Strict guardrails:

* Do not read `.env`, `.env.local`, or private env files.
* Do not print secrets, full DB URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII from real data, raw report rows, or raw user data.
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
* Do not run DB-backed report export tests.
* Do not require authenticated admin credentials.
* Do not standardize API responses broadly.
* Do not change frontend/admin callers.
* Do not change admin report success payloads or CSV response shape.
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
Inventory only static source-defined fields and access assumptions. Do not run the route or query a database.

Check:

* CSV fields exported for orders, products, and customers.
* Fields that may contain PII, such as email, phone, names, and order identifiers.
* Whether the export route requires admin session before data generation.
* Whether the admin reports page labels exports clearly enough for future permission review.
* Whether any fields should be considered for masking, role separation, or explicit admin permission labels in a later approved implementation step.

Step 4 - Coordinator decision:
Create a report-only audit. Do not implement masking, role separation, route changes, UI changes, or tests in this step.

Step 5 - Implementation:
Create only the allowed report and next prompt draft.

Step 6 - State script changes:
Do not change state scripts in this step.

Step 7 - Tests:
Do not add tests in this step.

Step 8 - Audit report and next prompt:
Create:

* audit-reports/128_ADMIN_REPORT_EXPORT_PII_PERMISSION_AUDIT.md
* audit-reports/128_NEXT_PROMPT_DRAFT.md

The Step 128 report must include:

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
* Static Export Field Inventory
* PII And Permission Findings
* DB/Auth-Backed Branches Skipped
* Behavior Changes Made
* Validation Results
* Prohibited Actions Not Performed
* Remaining Risks
* Recommended Next Step

The next prompt draft must be draft-only and must not execute Step 129.

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
git add -- audit-reports/128_ADMIN_REPORT_EXPORT_PII_PERMISSION_AUDIT.md audit-reports/128_NEXT_PROMPT_DRAFT.md
```

Then run:

* git diff --cached --name-only

Confirm only those two files are staged. If any other file is staged, stop and do not commit.

Commit message:

```text
docs: audit admin report export pii permissions
```

Stop conditions:

* Stop if any prohibited file/action would be required.
* Stop if the task would require real admin credentials, a live database, DB mutation, provider decisions, deployment, migrations, package updates, Docker setup, source edits, tests, or unapproved visual/media work.
* Stop if validation fails for a task-caused reason that cannot be fixed inside the allowed files.
* Stop if the generated Step 129 prompt would be executed automatically.

Final response format:
Give me only:

1. Summary of Step 128 work.
2. Whether terminal-first mode was used.
3. Whether real subagents were used or simulated lanes were used.
4. Whether the 10-step loop completed.
5. Whether commit succeeded.
6. Commit hash if committed.
7. Exact files changed/staged/committed.
8. Latest commit verified before Step 128.
9. Static export field inventory summary.
10. PII and permission findings.
11. Validation results.
12. Prohibited files/actions confirmation.
13. Remaining risks.
14. Recommended next safest step.
15. Confirmation that Codex stopped and did not execute Step 129.
