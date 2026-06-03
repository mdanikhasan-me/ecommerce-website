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

## Optional Terminal Batch Loop Mode

Terminal Batch Loop mode is an optional, prompt-invoked extension for a small set of tightly related safe tasks. It exists for cases where the user explicitly approves multiple bounded loops in one Codex response.

Activation phrase:

```text
Run Boilabin Terminal Batch Loop mode.
```

Batch mode does not replace the default one-loop Terminal Loop. The default remains one approved 10-step loop, then stop.

Terminal Batch Loop mode is capped at 3 loops per user-approved batch. Each loop must have:

- one bounded theme shared across the batch;
- exact allowed files declared before edits;
- read-only planning lanes when available;
- one writer only;
- validation before staging;
- exact-file staging only;
- one commit per successful loop;
- reviewer checks after commit;
- stop conditions after every loop.

Batch mode must stop immediately if a loop requires prohibited files or actions, if validation fails for a task-caused reason that cannot be fixed inside that loop's allowed files, if the worktree is not clean after a loop, or if the next loop would leave the approved batch scope.

Batch mode is not forever-running automation. It does not auto-approve risky work, does not run in the background, and does not execute generated future prompts automatically.

High-risk categories remain excluded from batch mode unless the user explicitly approves a dedicated batch for that risk. Examples include database migrations, provider setup, deployment, payment/tracking/seller work, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle changes, and paused visual/media work.

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

In Terminal Batch Loop mode, the approved batch itself may continue from loop to loop only up to the hard maximum of 3 loops, and only while each loop passes validation, commits cleanly, and stays inside the user's approved batch scope. Any generated prompt for work outside that approved batch remains draft-only.

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

## Batch Prompt Skeleton

```text
Run Boilabin Terminal Batch Loop mode.

Use up to 3 bounded loops in this one approved batch.
Keep one shared theme.
Declare exact allowed files per loop.
Use read-only planning lanes before edits.
Use one writer only.
Validate before staging in every loop.
Stage exact files only.
Commit separately after each successful loop.
Run reviewer checks after each loop.
Stop after the approved batch.
Do not execute work beyond the approved batch.
```
