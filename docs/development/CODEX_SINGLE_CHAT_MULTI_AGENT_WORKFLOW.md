# Codex Single-Chat Multi-Agent Workflow

## Purpose

This document explains how to run larger Boilabin recovery tasks from one VS Code Codex chat while still getting multi-agent-style planning, guardrail review, validation planning, and audit consistency checks.

## Reality Check: VS Code Single-Chat Limitation

The user can stay in one VS Code Codex chat. Do not require a new Codex chat, another tab, the Codex app, or Codex CLI.

If the current VS Code Codex surface exposes visible real subagents, the coordinator can use them for read-only planning. If visible real subagents are unavailable, simulated lanes in the same chat are still useful.

## Real Subagents vs Simulated Lanes

Real subagents:

- can investigate distinct read-only questions in parallel,
- should receive concrete, bounded tasks,
- should not edit unless explicitly assigned disjoint write ownership,
- should report concise findings to the coordinator.

Simulated lanes:

- run inside the same chat,
- use labeled sections,
- keep the same separation of responsibilities,
- must not pretend that separate agents ran.

Use this sentence when falling back:

```text
Real subagent visibility unavailable; using single-chat simulated lanes.
```

## Coordinator Model

The main Codex chat is the coordinator. It keeps final decision authority, waits for read-only lane findings, approves the exact file list, performs or assigns the one writer implementation, runs validation, stages exact files, commits, and reports.

## Agent Roles

- Explorer Agent: read-only file/codebase mapper.
- Guardian Agent: read-only safety and guardrail reviewer.
- Validator Agent: validation planner and failure classifier.
- Docs Auditor Agent: audit report and workflow consistency reviewer.
- Implementer Agent: the only lane allowed to edit files, and only after coordinator approval.

## One Writer Rule

Multiple agents should not edit files at the same time. Only the coordinator or one Implementer writes files. This avoids conflicting edits, broad refactors, and accidental prohibited-file changes.

## How To Start A Large Task

Ask for one bounded theme with 3 to 5 related deliverables. Include:

- goal,
- exact allowed files,
- files to read first,
- strict guardrails,
- validation commands,
- report path,
- commit message if committing,
- final response format.

Do not mix unrelated risky work. For example, do not combine hosting decisions with payment implementation or media redesign.

## How To Ask For Parallel Read-Only Planning

Use this pattern:

```text
Before edits, run read-only lanes:
Explorer maps files and conventions.
Guardian reviews guardrails and stop conditions.
Validator defines validations and failure classifications.
Docs Auditor checks latest audit/commit consistency.
Then the coordinator summarizes findings and approves one writer.
```

## How To Handle Implementation

- Implement only after planning lanes finish.
- Edit only the exact allowed files.
- Use small scoped patches.
- Do not change runtime/source files for docs-only steps.
- Do not touch paused visual/media areas unless the step explicitly allows it.
- Do not restore Flash Deals or Flash Sales.
- Do not restore Baby & Kids or undo Toys & Collectibles unless the user approves a dedicated media step.

## How To Handle Validation

Run the validation sequence requested by the user. Common baseline:

```text
npm run db:url:safety
npm run db:prisma:local:validate
npm run db:prisma:local:generate
npm run typecheck
npm run lint
npm test
npm run build
```

For guardrail packages, run the new audit script first. Classify failures as task-caused, known environment blocker, unrelated pre-existing issue, or validation ordering issue.

## How To Handle Staging/Commit

- Do not stage until validation is complete.
- Stage exact files only.
- Never use `git add .`.
- Never use `git add -A`.
- Run `git diff --cached --name-only`.
- Confirm only allowed files are staged.
- Commit only after the staged set is exact and validation is acceptable.
- Run post-commit `git status --short`, `git log -1 --oneline`, and `git diff --cached --name-only`.

## How To Avoid Context Pollution

- Keep lane prompts specific.
- Avoid asking multiple lanes the same question.
- Summarize lane findings before editing.
- Do not paste large irrelevant reports into the final answer.
- Keep final responses in the user's requested numbered format.
- Close or stop using subagents after their results are integrated.

## How To Continue The Existing Boilabin Step Workflow

- Verify the latest commit before edits.
- Record initial `git status --short`.
- Record initial staged files.
- Preserve prior decisions unless the user explicitly changes them.
- Create the requested audit report for implementation steps.
- Avoid report-commit-report loops when the user explicitly asks not to create another report.
- Keep final answers concise and numbered when requested.

## Example Prompt: Read-Only Multi-Agent Audit

```text
/plan

Run a read-only Boilabin audit. Use Explorer, Guardian, Validator, and Docs Auditor lanes. Do not edit, stage, commit, deploy, read private env files, run migrations, or touch paused visual/media work. Summarize findings and recommend the next safest step.
```

## Example Prompt: Larger Safe Implementation

```text
/plan

Create a docs/script/test package for one bounded theme. Allowed files are <exact list>. First run read-only lanes. Then one Implementer edits only the allowed files. Run validation, stage exact files only, commit with <message>, and report in the requested numbered format.
```

## Example Prompt: Audit Log Review And Next Prompt

```text
Review the latest audit report and commit output. Verify whether the step succeeded, what changed, what validation passed or failed, what risks remain, and what prohibited areas stayed untouched. Then give one copy-paste-ready next Codex prompt.
```

## Things Never To Do

- Do not read or print real `.env` or `.env.local` values.
- Do not print secrets, full DB URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, or raw user data.
- Do not deploy or run provider CLIs unless a dedicated approved deployment step says so.
- Do not run migrations, `prisma db push`, seed/reset, or destructive SQL unless a dedicated approved DB step says so.
- Do not update packages unless explicitly approved.
- Do not touch footer/newsletter/payment-logo/PromoSection visual work unless explicitly approved.
- Do not touch image assets or media localization unless explicitly approved.
- Do not restore Baby & Kids.
- Do not undo Toys & Collectibles.
- Do not restore Flash Deals or Flash Sales.
- Do not enable payment, tracking, seller marketplace, CSP enforcement/default collection, distributed rate limiting, or mobile app implementation incidentally.

## Troubleshooting

- If real subagents are unavailable, use simulated lanes and say so.
- If a lane needs prohibited access, stop and report the blocker.
- If validation fails because a new file is missing, classify it as task-caused.
- If validation fails from a known local environment blocker, document it and avoid unrelated fixes.
- If the staged set includes an unexpected file, stop and unstage only the unexpected file.
- If the task would require editing outside the allowed file list, stop and ask for a new approved scope.

## Future Upgrade Path If Codex IDE Exposes Subagent UI

If the VS Code Codex UI later exposes visible subagents, keep the same coordinator model:

- spawn read-only lanes in parallel,
- wait for all findings,
- summarize,
- keep one writer,
- validate centrally,
- exact-file stage and commit centrally.

Bigger tasks should bundle 3 to 5 related deliverables under one theme, not unrelated risky work.
