Run Boilabin Terminal Loop mode.

/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 129 should be verified from git before edits.
* Step 129 added no-DB admin report export sensitivity/permission metadata and tests.
* Step 129 preserved CSV payloads, export routes, admin access behavior, masking/redaction state, role separation state, UI labels, and export audit logging state.
* Step 129 did not execute this prompt.

Your task is Step 130:

ADMIN REPORT EXPORT UI SENSITIVITY LABELS

Goal:
Use one bounded terminal-first 10-step loop to surface static sensitivity labels/warnings on the admin reports export UI by consuming the Step 129 metadata, while preserving export URLs, CSV payloads, route behavior, and admin access behavior.

This is a bounded admin UI copy/test/report step. It may add small warning/label copy near existing export links, but it must not redesign the page or change export behavior.

Allowed files:
You may edit only:

1. src/app/(admin)/admin/reports/page.tsx
2. tests/admin-reports.test.ts
3. audit-reports/130_ADMIN_REPORT_EXPORT_UI_SENSITIVITY_LABELS.md
4. audit-reports/130_NEXT_PROMPT_DRAFT.md

Do not edit any other files.

Read first:

* audit-reports/129_ADMIN_REPORT_EXPORT_SENSITIVITY_METADATA.md
* audit-reports/129_NEXT_PROMPT_DRAFT.md
* audit-reports/128_ADMIN_REPORT_EXPORT_PII_PERMISSION_AUDIT.md
* src/backend/admin/reports.ts
* tests/admin-reports.test.ts
* src/app/(admin)/admin/reports/page.tsx
* src/app/api/admin/reports/export/route.ts

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
* Do not change export URLs, route behavior, or admin access behavior.
* Do not implement masking, redaction, role separation, route changes, export confirmation, or export audit logging in this step.
* Do not redesign the admin reports page.
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
Review Step 129 metadata and the current admin reports page. Confirm the metadata exposes UI-ready labels before editing.

Stop if Step 129 metadata is missing or does not expose enough labels to avoid hardcoding duplicate sensitivity language.

Step 4 - Coordinator decision:
Choose the smallest UI change that shows sensitivity labels/warnings near the existing export links while preserving existing export hrefs and page behavior.

Step 5 - Implement bounded changes:
Allowed implementation examples:

* import `ADMIN_REPORT_EXPORT_METADATA` into the admin reports page;
* render compact label/warning text near each existing export link;
* keep the existing export hrefs unchanged;
* keep copy concise and admin-focused;
* add no-DB tests in `tests/admin-reports.test.ts` only if they can safely assert the metadata/UI copy contract without rendering DB-backed routes.

Step 6 - State script changes:
Do not change state scripts in this step.

Step 7 - Focused tests:
Add or extend only `tests/admin-reports.test.ts` if useful and no-DB.

Step 8 - Audit report and next prompt:
Create:

* audit-reports/130_ADMIN_REPORT_EXPORT_UI_SENSITIVITY_LABELS.md
* audit-reports/130_NEXT_PROMPT_DRAFT.md

The Step 130 report must include:

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
* UI Labels Added
* Export URL And CSV Preservation
* Tests Added Or Updated
* DB/Auth-Backed Branches Skipped
* Behavior Changes Made
* Validation Results
* Prohibited Actions Not Performed
* Remaining Risks
* Recommended Next Step

The next prompt draft must be draft-only and must not execute Step 131.

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
git add -- "src/app/(admin)/admin/reports/page.tsx" tests/admin-reports.test.ts audit-reports/130_ADMIN_REPORT_EXPORT_UI_SENSITIVITY_LABELS.md audit-reports/130_NEXT_PROMPT_DRAFT.md
```

Then run:

* git diff --cached --name-only

Confirm only allowed files with real changes are staged. If any other file is staged, stop and do not commit.

Commit message:

```text
chore: label admin report export sensitivity
```

Stop conditions:

* Stop if Step 129 metadata is missing.
* Stop if any prohibited file/action would be required.
* Stop if the task would require real admin credentials, a live database, DB mutation, provider decisions, deployment, migrations, package updates, Docker setup, route changes, export behavior changes, masking/redaction, role separation, export audit logging, or unapproved visual/media work.
* Stop if validation fails for a task-caused reason that cannot be fixed inside the allowed files.
* Stop if the generated Step 131 prompt would be executed automatically.

Final response format:
Give me only:

1. Summary of Step 130 work.
2. Whether terminal-first mode was used.
3. Whether real subagents were used or simulated lanes were used.
4. Whether the 10-step loop completed.
5. Whether commit succeeded.
6. Commit hash if committed.
7. Exact files changed/staged/committed.
8. Latest commit verified before Step 130.
9. UI sensitivity labels added.
10. Export URL and CSV preservation result.
11. Tests added or updated.
12. Validation results.
13. Prohibited files/actions confirmation.
14. Remaining risks.
15. Recommended next safest step.
16. Confirmation that Codex stopped and did not execute Step 131.
