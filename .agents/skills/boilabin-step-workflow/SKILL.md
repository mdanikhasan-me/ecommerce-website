---
name: boilabin-step-workflow
description: Use for Boilabin step-by-step Codex recovery tasks, audit review, next prompt generation, multi-agent planning, exact-file staging, validation guardrails, and one-chat VS Code coordinator workflows.
---

# Boilabin Step Workflow

Use this skill for Boilabin recovery roadmap work, audit-log review, next-step prompt creation, multi-agent planning, validation, and exact-file commit workflows.

## Terminal-First 10-Step Loop

Use this activation phrase when the user wants a bounded terminal-agent workflow:

```text
Run Boilabin Terminal Loop mode.
```

Terminal Loop mode runs exactly one bounded 10-step loop, then stops. It is prompt-invoked, not a forever-running background process, and it does not auto-approve or execute the next task.

The loop is:

1. Terminal baseline: run requested safe status/state commands and record evidence.
2. Multi-agent planning: use real read-only lanes when available, otherwise labeled simulated lanes.
3. Evidence review: read safe files before editing.
4. Coordinator decision: summarize the bounded change, allowed files, and stop conditions.
5. Implement allowed docs/script/test/report changes with one writer only.
6. Create or update the requested read-only state script when the step requires it.
7. Create or update focused tests.
8. Create the audit `.md` and next prompt draft if requested.
9. Validate with terminal commands and record real results.
10. Stage exact files, commit if validation passes, summarize, and stop.

Terminal Loop mode must use terminal evidence instead of guessing. Do not claim a command passed unless terminal output proves it. If validation fails, classify it, fix only inside the allowed scope, rerun affected validation, and document the result. If a fix requires prohibited files/actions, stop.

## Core Rules

- Preserve the existing step-by-step Boilabin workflow.
- Keep the user in one VS Code Codex chat unless the user explicitly asks otherwise.
- Try real subagents when the current Codex surface exposes them and the task explicitly asks for multi-agent or parallel agent work.
- If real subagent visibility is unavailable, say so and use simulated lanes in the same chat.
- Run read-only lanes before editing on large tasks.
- Keep one writer only. Only the coordinator or one Implementer edits files after the coordinator approves exact allowed files.
- Use exact allowed files from the user prompt.
- Never use broad staging such as `git add .` or `git add -A`.
- Never print secrets, full DB URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, or raw user data.
- Do not touch private env files unless the user explicitly authorizes a safe read and the task requires it.
- In Terminal Loop mode, stop after one 10-step loop. Generate the audit report and final summary, then wait for the user before any next task.

## Standard Lanes

Use these lanes for large Boilabin tasks:

- Explorer Agent: read-only file/codebase mapper.
- Guardian Agent: read-only guardrail/risk reviewer.
- Validator Agent: validation planner and failure classifier.
- Docs Auditor Agent: audit/report consistency reviewer.
- Implementer Agent: the only edit lane, and only after coordinator approval.

When real subagents are available, spawn Explorer, Guardian, Validator, and Docs Auditor in parallel for read-only investigation, wait for all findings, summarize, and then edit locally or with one Implementer.

When real subagents are unavailable, use these sections in the same chat:

- `[Explorer findings]`
- `[Guardian findings]`
- `[Validator findings]`
- `[Docs Auditor findings]`
- `[Coordinator decision]`
- `[Implementer changes]`

Do not pretend separate agents ran if they did not.

## Paused And Protected Areas

Keep these paused unless the user explicitly approves a dedicated step:

- footer/newsletter/payment-logo/PromoSection visual work,
- image assets and media localization,
- Baby & Kids restoration,
- Toys & Collectibles rollback,
- Flash Deals or Flash Sales restoration,
- payment provider/backend integration,
- tracking provider/API integration,
- seller marketplace implementation,
- CSP enforcement/default collection,
- distributed rate limiting implementation,
- mobile app implementation,
- Prisma schema/migrations unless the step is an approved DB step.

`/deals` and `/api/admin/flash-sales` must remain removed unless a dedicated approved product step changes that.

## Standard Validation

Use the user's requested validation list. When not narrowed, prefer:

```text
npm run db:url:safety
npm run db:prisma:local:validate
npm run db:prisma:local:generate
npm run typecheck
npm run lint
npm test
npm run build
```

For docs/script/test guardrails, also run any new audit script before standard validation.

Classify failures as:

- task-caused,
- known environment blocker,
- unrelated pre-existing issue,
- validation ordering issue.

Do not run migrations, `prisma db push`, seed/reset, destructive SQL, deployment commands, provider CLIs, package updates, or Docker setup unless the user explicitly approves a dedicated step.

## Standard Task Skeleton

Use this shape for future large Boilabin tasks:

```text
/plan

Goal:
<one bounded theme>

Allowed files:
<exact file list>

Read first:
<exact safe files/reports>

Multi-agent planning:
- Explorer: read-only mapping
- Guardian: read-only guardrails
- Validator: validation plan/failure classification
- Docs Auditor: report consistency
- Implementer: one writer only after coordinator approval

Deliverables:
1. <deliverable>
2. <deliverable>
3. <deliverable>

Strict guardrails:
- no secrets/private env printing
- no DB migration/db push/seed/reset/SQL
- no deployment/provider CLI
- no package updates
- no unrelated source/visual/media/payment/tracking/seller/lifecycle work
- exact-file staging only

Validation:
<commands>

Report:
<audit report path and required sections>

Commit:
<exact files and exact commit message>

Final response:
<numbered format>
```

## Reusable Multi-Agent Instruction Block

Copy this into future large tasks when useful:

```text
Before edits, run read-only lanes:

Explorer Agent: map relevant files and conventions.
Guardian Agent: review allowed files, prohibited files/actions, and stop conditions.
Validator Agent: define validation order and failure classifications.
Docs Auditor Agent: verify latest audit/commit context and report consistency.

If real subagents are available in this same Codex chat, spawn them in parallel and wait for all findings.
If real subagents are unavailable, use simulated single-chat sections and state that clearly.

Only after all lanes report, the Coordinator summarizes findings and authorizes one Implementer.
Only the Implementer may edit exact allowed files.
The Coordinator runs validation, stages exact files, commits, and reports.
```

## Final Response Discipline

Use the user's requested final numbered format exactly. Include:

- what changed,
- whether real or simulated lanes were used,
- commit hash when committed,
- exact files changed/staged/committed,
- validation results,
- prohibited action confirmation,
- remaining risks,
- next safest step.
