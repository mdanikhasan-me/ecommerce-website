Run Boilabin Terminal Loop mode.

/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 130 should be verified from git before edits.
* Step 130 added compact admin report export UI sensitivity labels using Step 129 metadata.
* Step 130 preserved export URLs, CSV payloads, route behavior, admin access behavior, masking/redaction state, role separation state, export confirmation state, and export audit logging state.
* Step 130 did not execute this prompt.

Your task is Step 131:

TERMINAL BATCH LOOP MODE PLANNING

Goal:
Use one bounded terminal-first 10-step loop to create a docs/script/test workflow upgrade plan for a future "Terminal Batch Loop mode" that can run up to 3 tightly related safe loops in one Codex session, with validation and stop conditions after each loop.

This is workflow-only planning and guardrail work. Do not run multiple loops in this step. Do not change product/runtime behavior.

Allowed files:
You may edit only:

1. docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md
2. docs/development/CODEX_SINGLE_CHAT_MULTI_AGENT_WORKFLOW.md
3. scripts/boilabin-terminal-loop-state.mjs
4. tests/boilabin-terminal-loop-workflow.test.ts
5. audit-reports/131_TERMINAL_BATCH_LOOP_MODE_PLANNING.md
6. audit-reports/131_NEXT_PROMPT_DRAFT.md

Do not edit any other files.

Read first:

* audit-reports/130_ADMIN_REPORT_EXPORT_UI_SENSITIVITY_LABELS.md
* audit-reports/130_NEXT_PROMPT_DRAFT.md
* audit-reports/126_TERMINAL_LOOP_ROADMAP_REVIEW.md
* audit-reports/125_TERMINAL_FIRST_10_STEP_LOOP_WORKFLOW.md
* docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md
* docs/development/CODEX_SINGLE_CHAT_MULTI_AGENT_WORKFLOW.md
* docs/development/BOILABIN_ADVISOR_WORKFLOW.md
* scripts/boilabin-terminal-loop-state.mjs
* tests/boilabin-terminal-loop-workflow.test.ts

Strict guardrails:

* Do not read `.env`, `.env.local`, or private env files.
* Do not print secrets, full DB URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII from real data, raw report rows, or raw user data.
* Do not run product/admin report routes.
* Do not query the database.
* Do not require authenticated credentials.
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
* Do not change runtime/product behavior.
* Do not execute multiple recovery loops automatically in this step.
* Do not create background/forever-running automation.
* Do not let the generated Step 132 prompt execute automatically.
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
Review the current Terminal Loop docs, state script, and tests. Identify the minimum docs/script/test changes needed to document and validate future Terminal Batch Loop mode.

Step 4 - Coordinator decision:
Design a safe Terminal Batch Loop planning contract that supports up to 3 tightly related safe loops in one Codex session.

The contract must require:

* one user-approved batch prompt;
* maximum 3 loops per batch;
* one bounded theme across the batch;
* exact allowed files per loop;
* validation after each loop;
* stop conditions after each loop;
* no automatic execution of generated next prompts;
* no high-risk categories such as DB migrations, provider setup, payment/tracking/seller work, visual asset work, or production deployment unless separately approved.

Step 5 - Implement bounded workflow docs/script/test changes:
Allowed implementation examples:

* add Terminal Batch Loop mode documentation;
* add state-script checks that the batch mode is documented as bounded and capped at 3 loops;
* add tests that reject forever-running or autonomous batch language;
* keep current Terminal Loop one-loop behavior documented as the default.

Step 6 - State script changes:
Update `scripts/boilabin-terminal-loop-state.mjs` only if needed to detect the new batch-mode guardrails. Do not read private env files.

Step 7 - Focused tests:
Add or extend only `tests/boilabin-terminal-loop-workflow.test.ts`.

Tests should verify:

* Terminal Loop remains one-loop-only by default;
* Terminal Batch Loop mode is documented as optional and prompt-invoked;
* Terminal Batch Loop mode is capped at 3 loops;
* validation and stop conditions are required after each loop;
* generated next prompts must not auto-execute;
* docs do not recommend broad staging or autonomous forever-running automation.

Step 8 - Audit report and next prompt:
Create:

* audit-reports/131_TERMINAL_BATCH_LOOP_MODE_PLANNING.md
* audit-reports/131_NEXT_PROMPT_DRAFT.md

The Step 131 report must include:

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
* Batch Mode Contract Added
* Loop Boundary And Stop Conditions
* State Script Changes
* Tests Added Or Updated
* Behavior Changes Made
* Validation Results
* Prohibited Actions Not Performed
* Remaining Risks
* Recommended Next Step

The next prompt draft must be draft-only and must not execute Step 132.

Step 9 - Validation:
Run and record:

* node scripts/boilabin-terminal-loop-state.mjs
* node scripts/boilabin-advisor-state.mjs
* node_modules\.bin\tsx --test tests\boilabin-terminal-loop-workflow.test.ts
* npm run db:url:safety
* npm run typecheck
* npm run lint
* npm test
* npm run build

If build fails only because DB-backed static generation cannot reach local PostgreSQL, classify it as the known environment blocker. If validation fails for a task-caused reason, fix only inside the allowed files and rerun affected checks.

Step 10 - Exact staging and commit:
Stage only:

```powershell
git add -- docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md docs/development/CODEX_SINGLE_CHAT_MULTI_AGENT_WORKFLOW.md scripts/boilabin-terminal-loop-state.mjs tests/boilabin-terminal-loop-workflow.test.ts audit-reports/131_TERMINAL_BATCH_LOOP_MODE_PLANNING.md audit-reports/131_NEXT_PROMPT_DRAFT.md
```

Then run:

* git diff --cached --name-only

Confirm only allowed files with real changes are staged. If any other file is staged, stop and do not commit.

Commit message:

```text
docs: plan terminal batch loop mode
```

Stop conditions:

* Stop if Step 130 is missing or uncommitted.
* Stop if any prohibited file/action would be required.
* Stop if the task would require product/runtime behavior changes, real credentials, a live database, DB mutation, provider decisions, deployment, migrations, package updates, Docker setup, route changes, export behavior changes, payment/tracking/seller work, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle work, or unapproved visual/media work.
* Stop if the batch-mode plan implies autonomous continuous execution, background automation, automatic approval, or automatic execution of Step 132.
* Stop if validation fails for a task-caused reason that cannot be fixed inside the allowed files.

Final response format:
Give me only:

1. Summary of Step 131 work.
2. Whether terminal-first mode was used.
3. Whether real subagents were used or simulated lanes were used.
4. Whether the 10-step loop completed.
5. Whether commit succeeded.
6. Commit hash if committed.
7. Exact files changed/staged/committed.
8. Latest commit verified before Step 131.
9. Terminal Batch Loop mode contract result.
10. State script/test result.
11. Validation results.
12. Prohibited files/actions confirmation.
13. Remaining risks.
14. Recommended next safest step.
15. Confirmation that Codex stopped and did not execute Step 132.
