# Boilabin Terminal Batch Loop Mode

## Purpose

Terminal Batch Loop mode lets Codex run a small user-approved batch of tightly related safe Terminal Loop tasks inside one VS Code Codex response.

It reduces manual prompt repetition without changing the safety model. Each loop still uses terminal evidence, read-only planning lanes, one writer, validation, exact-file staging, a separate commit, a reviewer check, and stop conditions.

## Activation Phrase

```text
Run Boilabin Terminal Batch Loop mode.
```

## Hard Cap

Terminal Batch Loop mode is capped at 3 loops per approved batch.

Codex must stop after the approved batch. It must not execute Loop 4.

## Relationship To Terminal Loop Mode

The default safe workflow remains:

```text
Run Boilabin Terminal Loop mode.
```

That default mode runs one bounded 10-step loop, summarizes, and stops.

Batch mode is optional. It runs only when the user explicitly asks for it and provides the approved loop scopes.

## Required Batch Shape

Every approved batch must define:

- one shared bounded theme;
- a maximum loop count, never above 3;
- exact allowed files for each loop;
- validation commands for each loop;
- exact staging commands for each loop;
- commit messages for each loop;
- stop conditions for the full batch and for each loop.
- stop conditions after every loop.

## Required Per-Loop Flow

Each loop must:

1. verify the current git state before edits;
2. confirm the previous loop is committed and clean when applicable;
3. declare exact allowed files before editing;
4. use read-only planning lanes when available;
5. keep one writer only;
6. edit only allowed files;
7. run the loop's validation commands;
8. stage exact files only;
9. make one commit per successful loop if validation passes;
10. run reviewer checks before continuing.

Reviewer checks after each loop must include:

- `git status --short`;
- `git log -1 --oneline`;
- `git diff --cached --name-only`;
- confirmation that validation passed;
- confirmation that no prohibited areas were touched.

## Stop Conditions

Stop the whole batch if:

- any loop requires a file outside its allowed list;
- validation fails for a task-caused reason that cannot be fixed inside the loop's allowed files;
- an unexpected file is staged;
- the worktree is not clean after a loop commit;
- the next loop would leave the approved shared theme;
- a loop would require secrets, private env files, real credentials, DB mutation, migrations, seed/reset, SQL, Docker setup, provider CLI, deployment, package updates, or remote services;
- a loop would touch paused visual/media work or other protected areas without explicit approval;
- the batch would imply automatic execution beyond the approved loops.

## What Batch Mode Is Not

Batch mode is not:

- forever-running automation;
- background automation;
- automatic approval for future work;
- automatic execution of generated next prompts;
- a way to bypass risky-work approvals.

Generated prompts outside the approved batch remain draft-only.

## High-Risk Categories

Do not include these in a batch unless the user explicitly approves a dedicated bounded batch for that risk:

- database migrations, Prisma schema changes, `prisma db push`, seed/reset, SQL, or destructive DB commands;
- deployment, provider CLI, hosting, DNS, or production/staging provider setup;
- package updates;
- Docker setup or container start commands;
- payment provider/backend integration;
- tracking provider/API integration;
- seller marketplace implementation;
- CSP enforcement/default collection;
- distributed rate limiting implementation;
- mobile app implementation;
- product lifecycle schema/status changes;
- footer/newsletter/payment-logo/PromoSection visual work;
- image asset localization, Baby & Kids restoration, Toys & Collectibles rollback, or Flash Deals/Sales restoration.

`/deals` and `/api/admin/flash-sales` must remain removed unless a dedicated approved product step changes that.

## Minimal Safe Batch Example

```text
Run Boilabin Terminal Batch Loop mode.

Loop 1: update workflow docs/tests only.
Loop 2: write a roadmap review report only.
Loop 3: write one follow-up planning report only.

Each loop has exact allowed files.
Each loop validates before staging.
Each loop commits separately.
Stop after Loop 3.
Do not execute Loop 4.
```
