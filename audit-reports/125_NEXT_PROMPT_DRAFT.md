# Step 125 Next Prompt Draft

```text
Run Boilabin Terminal Loop mode.

/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:
- Step 125 should be verified from git before edits.
- Step 125 established Terminal Loop mode as a bounded, terminal-first, 10-step workflow.

Goal:
Use one terminal-first 10-step loop to review the latest audit report and choose the next safest roadmap task. This is review/planning-only unless the user explicitly approves a bounded implementation step.

Read first:
- audit-reports/125_TERMINAL_FIRST_10_STEP_LOOP_WORKFLOW.md
- docs/development/BOILABIN_TERMINAL_FIRST_10_STEP_LOOP.md
- .agents/skills/boilabin-step-workflow/SKILL.md
- .agents/skills/boilabin-advisor/SKILL.md

Allowed work:
- Run one bounded Terminal Loop review.
- Verify latest commit and worktree state with terminal commands.
- Summarize current roadmap blockers and recommend exactly one next safe prompt.
- Do not execute the generated next prompt until I approve it.

Allowed files:
- audit-reports/126_TERMINAL_LOOP_ROADMAP_REVIEW.md

Strict guardrails:
- Do not read private env files or print secrets.
- Do not deploy, configure hosting, run provider CLIs, update packages, run Docker setup, or connect remote services.
- Do not run migrations, create migrations, edit Prisma schema, run `prisma db push`, seed/reset, SQL, or destructive DB commands.
- Do not touch app source, runtime config, env files, env examples, assets, visual/media files, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile app implementation, or product lifecycle.
- Do not restore removed product-promotion routes or assets.
- Use exact-file staging only if committing.

10-step loop:
1. Terminal baseline.
2. Read-only planning lanes.
3. Evidence review.
4. Coordinator decision.
5. Implement only the allowed report.
6. No state-script changes unless explicitly approved.
7. No test changes unless explicitly approved.
8. Create the audit report.
9. Validate with terminal commands.
10. Stage exact file, commit if validation passes, summarize, and stop.

Validation:
- node scripts/boilabin-terminal-loop-state.mjs
- node scripts/boilabin-advisor-state.mjs
- npm run db:url:safety
- npm run typecheck
- npm run lint
- npm test
- npm run build

Report:
Create `audit-reports/126_TERMINAL_LOOP_ROADMAP_REVIEW.md` with:
- scope,
- latest commit verified,
- initial git status,
- terminal baseline results,
- planning mode used,
- roadmap review,
- recommended next prompt draft,
- validation results,
- prohibited actions not performed,
- remaining risks,
- recommended next step.

Commit:
After validation passes, stage only:
git add -- audit-reports/126_TERMINAL_LOOP_ROADMAP_REVIEW.md

Commit message:
docs: add terminal loop roadmap review

Stop conditions:
- Stop if any prohibited file/action would be required.
- Stop if validation fails for a task-caused reason that cannot be fixed inside the allowed report.
- Stop if the task would execute the next generated prompt automatically.

Final response:
Give me only:
1. Summary.
2. Whether terminal-first mode was used.
3. Whether the 10-step loop completed.
4. Whether commit succeeded.
5. Commit hash if committed.
6. Exact files changed/staged/committed.
7. Validation results.
8. Prohibited files/actions confirmation.
9. Remaining risks.
10. Recommended next safest step.
11. Confirmation that Codex stopped and did not execute the generated next prompt.
```
