Run Boilabin Terminal Loop mode.

/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 126 should be verified from git before edits.
* Step 126 reviewed the Terminal Loop roadmap and chose a bounded no-DB admin report export guardrail task as the next safest technical step.
* Step 126 did not execute this prompt.

Your task is Step 127:

NO-DB ADMIN REPORT EXPORT GUARDRAILS

Goal:
Use one bounded terminal-first 10-step loop to harden and test admin report export helper behavior without requiring a database connection, deployment, provider decision, or visual/media work.

This is a bounded source/test/report step. Preserve current admin report behavior and CSV/file response shape unless a tiny safety fix is clearly required.

Read first:

* audit-reports/126_TERMINAL_LOOP_ROADMAP_REVIEW.md
* audit-reports/126_NEXT_PROMPT_DRAFT.md
* src/backend/admin/reports.ts
* src/app/api/admin/reports/export/route.ts
* src/app/api/admin/reports/route.ts
* tests/admin-reports.test.ts
* audit-reports/41_API_ERROR_CONTRACT_TEST_PLAN.md
* audit-reports/42_API_RESPONSE_STANDARDIZATION_PLAN.md

Allowed files:

You may edit only:

1. src/backend/admin/reports.ts
2. src/app/api/admin/reports/export/route.ts
3. tests/admin-reports.test.ts
4. audit-reports/127_ADMIN_REPORT_EXPORT_GUARDRAILS.md
5. audit-reports/127_NEXT_PROMPT_DRAFT.md

Do not edit any other files.

Strict guardrails:

* Do not read `.env`, `.env.local`, or private env files.
* Do not print secrets, full DB URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, raw report rows, or raw user data.
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
* Do not run DB-backed success-flow export tests.
* Do not require authenticated admin credentials.
* Do not standardize API responses broadly.
* Do not change frontend/admin callers.
* Do not change admin report success payloads or CSV response shape unless required for a tiny safety guardrail.
* Preserve CSV/file responses.
* Preserve `{ error: string }` error body behavior where applicable.
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
Review the allowed admin report files and relevant API contract reports. Identify no-DB branches only.

Check:

* `parseAdminReportRange` behavior for missing dates, invalid dates, reversed ranges, future dates if relevant, and excessive ranges if the existing code has or should have a bound.
* `escapeCsvValue` behavior for commas, quotes, newlines, formula prefixes, leading whitespace before formula prefixes, null/undefined values, and long values if relevant.
* export route validation for invalid/missing `type` only if it can be tested without DB/auth coupling; otherwise document it as skipped.
* filename/type safety for CSV export if route-level testing can be isolated without credentials or DB; otherwise document it as skipped.

Step 4 - Coordinator decision:
Choose the smallest safe changes. Prefer helper-level tests and tiny helper hardening. Do not rewrite admin report export or report queries.

Step 5 - Implement bounded changes:
Allowed implementation examples:

* add no-DB tests for date range parsing and CSV escaping;
* add a tiny helper guard if tests expose unsafe behavior;
* add route-level validation tests only if they can be isolated without credentials, DB, or broad mocks;
* otherwise document route-level branches as skipped.

Step 6 - State script changes:
Do not change state scripts in this step.

Step 7 - Focused tests:
Add or extend only `tests/admin-reports.test.ts`.

Step 8 - Audit report and next prompt:
Create:

* audit-reports/127_ADMIN_REPORT_EXPORT_GUARDRAILS.md
* audit-reports/127_NEXT_PROMPT_DRAFT.md

The Step 127 report must include:

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
* Admin Report Export Findings
* Changes Made
* Tests Added Or Updated
* DB/Auth-Backed Branches Skipped
* Validation Results
* Prohibited Actions Not Performed
* Remaining Risks
* Recommended Next Step

The next prompt draft must be draft-only and must not execute Step 128.

Step 9 - Validation:
Run and record:

* node scripts/boilabin-terminal-loop-state.mjs
* node scripts/boilabin-advisor-state.mjs
* npm run db:url:safety
* npm run typecheck
* npm run lint
* npm test
* npm run build

Do not run Prisma generate unless required by existing validation state. If build fails only because DB-backed static generation cannot reach local PostgreSQL, classify it as the known environment blocker. If validation fails for a task-caused reason, fix only inside the allowed files and rerun affected checks.

Step 10 - Exact staging and commit:
Stage only:

```powershell
git add -- src/backend/admin/reports.ts src/app/api/admin/reports/export/route.ts tests/admin-reports.test.ts audit-reports/127_ADMIN_REPORT_EXPORT_GUARDRAILS.md audit-reports/127_NEXT_PROMPT_DRAFT.md
```

Then run:

* git diff --cached --name-only

Confirm only allowed files with real changes are staged. If an allowed file has no changes and does not stage, that is acceptable. If any other file is staged, stop and do not commit.

Commit message:

```text
fix: harden admin report export guardrails
```

Stop conditions:

* Stop if any prohibited file/action would be required.
* Stop if route-level tests require real admin credentials or a live database.
* Stop if validation fails for a task-caused reason that cannot be fixed inside the allowed files.
* Stop if the task would require provider decisions, deployment, DB mutation, migrations, package updates, Docker setup, or unapproved visual/media work.
* Stop if the generated Step 128 prompt would be executed automatically.

Final response format:
Give me only:

1. Summary of Step 127 work.
2. Whether terminal-first mode was used.
3. Whether real subagents were used or simulated lanes were used.
4. Whether the 10-step loop completed.
5. Whether commit succeeded.
6. Commit hash if committed.
7. Exact files changed/staged/committed.
8. Latest commit verified before Step 127.
9. Admin report export findings.
10. Tests added or updated.
11. Validation results.
12. Prohibited files/actions confirmation.
13. Remaining risks.
14. Recommended next safest step.
15. Confirmation that Codex stopped and did not execute Step 128.
