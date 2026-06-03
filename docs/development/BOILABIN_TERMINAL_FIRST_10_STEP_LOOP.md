# Boilabin Terminal-First 10-Step Loop

## Purpose

Terminal Loop mode makes Boilabin Codex work more like a terminal-first agent inside the same VS Code Codex chat. It uses commands for evidence, read-only planning lanes for risk review, one writer for edits, terminal validation, one audit report, one summary, and then it stops.

This is still the VS Code Codex chat. It is not pure Codex CLI, not a forever-running background loop, and not automatic approval for future tasks.

## Activation Phrase

```text
Run Boilabin Terminal Loop mode.
```

## What Terminal-First Means

- Prefer terminal evidence over guesses.
- Inspect state with commands before editing.
- Read safe files before changing them.
- Do not claim a command passed unless terminal output proves it.
- Validate after editing with the requested commands.
- If validation fails, classify the failure and fix only inside the allowed scope.
- If a fix requires prohibited files or actions, stop and report the blocker.

## The 10-Step Loop

1. Terminal baseline: run safe status/state commands and record the output.
2. Multi-agent planning: use real read-only subagents when available, otherwise simulated lanes.
3. Evidence review: read approved reports, docs, scripts, and tests before editing.
4. Coordinator decision: decide the bounded edit set, stop conditions, and validation plan.
5. Implement allowed docs/skills/script/report/test changes with one writer only.
6. Create or update a read-only state script when the step requires one.
7. Create or update focused tests.
8. Create the audit `.md` report and any requested next-prompt draft.
9. Run validation commands, record real results, and rerun affected checks after fixes.
10. Stage exact files, commit if validation passes, summarize, and stop.

## Stop-After-Summary Rule

After step 10, Codex must stop. It must not start Step 126 or execute a generated next prompt. The user reviews the summary and audit report before approving anything else.

## Multi-Agent Planning

Use read-only lanes:

- Explorer maps files and evidence.
- Guardian reviews guardrails and stop conditions.
- Validator plans validation and failure classification.
- Docs Auditor checks report consistency.
- Advisor reviews the latest step and drafts safe prompt language when needed.

If real subagents are unavailable, use simulated sections and say so. Do not pretend real subagents ran if they did not.

## One Writer Rule

Only the coordinator or one Implementer edits files. Read-only lanes must not edit, stage, commit, or run prohibited commands.

## Exact-File Staging

Stage exact files only after validation passes.

Never use `git add .`.
Never use `git add -A`.

Verify with:

```text
git diff --cached --name-only
```

Commit only when the staged set exactly matches the approved file list.

## Audit Report Requirement

Every Terminal Loop implementation step should create or update one audit `.md` file that records:

- scope,
- latest commit verified,
- initial status,
- terminal baseline,
- planning lane summaries,
- files changed,
- validation results,
- prohibited actions not performed,
- remaining risks,
- recommended next step.

## Human Approval Boundary

Generated next prompts are drafts. They are not queued work. Do not execute the next prompt until the user approves it.

## Protected Areas

Do not touch these unless the user explicitly approves a dedicated step:

- private env files or secret values,
- Prisma schema or migrations,
- DB mutation commands, `prisma db push`, seed/reset, or SQL,
- deployment, provider CLI, DNS, hosting, storage, monitoring, or email setup,
- package updates,
- Docker setup or config changes,
- footer/newsletter/payment-logo/PromoSection visual work,
- image assets or media localization,
- Baby & Kids restoration,
- Toys & Collectibles rollback,
- Flash Deals or Flash Sales restoration,
- payment provider/backend integration,
- tracking provider/API integration,
- seller marketplace implementation,
- CSP enforcement/default collection,
- distributed rate limiting implementation,
- mobile app implementation,
- authenticated admin credential/session QA unless separately approved.

`/deals` and `/api/admin/flash-sales` must remain removed unless a dedicated approved product step changes that.

## Default Prompt

```text
Run Boilabin Terminal Loop mode.

Use one bounded 10-step loop.
Verify terminal baseline first.
Use read-only planning lanes.
Edit only the allowed files.
Validate with terminal commands.
Write the audit report.
Stage exact files only.
Commit only if validation passes.
Summarize, then stop.
Do not execute the next prompt until I approve it.
```
