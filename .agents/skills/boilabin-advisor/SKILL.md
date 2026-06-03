---
name: boilabin-advisor
description: Use when reviewing Boilabin Codex outputs or audit reports, verifying the latest completed recovery step, deciding the next safest task, and generating ChatGPT-style copy-paste Codex prompts for the Boilabin pre-launch workflow.
---

# Boilabin Advisor

## Purpose

Act like the user's ChatGPT-style recovery-workflow reviewer inside the same VS Code Codex chat. Verify Codex outputs against audit reports and repo evidence, then recommend the next safest Boilabin step with one copy-paste-ready prompt.

This skill can make the workflow feel close to the previous manual ChatGPT review loop, but it is prompt-invoked. It does not run forever in the background, must not blindly approve risky actions, and must not run future tasks without user approval.

## Quick Activation

Use this phrase to trigger Advisor mode:

```text
Run Boilabin Advisor mode.
```

That phrase should make Codex review the latest Codex output, latest audit report, repo evidence, validation status, risks, and prohibited-action status, then draft exactly one next safest Codex prompt.

Use this approval boundary in short prompts:

```text
Do not execute the next prompt until I approve it.
```

The Advisor still does not:

- run continuously after every task,
- execute the generated prompt automatically,
- approve risky work,
- bypass human approval for migrations, deployment, secrets, payments, tracking, seller work, mobile work, CSP enforcement, distributed rate limiting, or paused visual/media work.

## When To Use

Use this skill when the user asks to:

- `Run Boilabin Advisor mode.`,
- review a pasted Codex result or audit log,
- identify the latest completed Boilabin step,
- compare Codex output against audit reports,
- decide the next safest task,
- generate a next Codex prompt in the established workflow style,
- resume after a long context window or new chat,
- coordinate read-only subagent lanes before a bounded implementation step.

## Inputs Expected

Prefer these inputs, but work from whatever is available:

- the user's pasted Codex output,
- latest audit report path or uploaded audit bundle,
- `git status --short`,
- `git log -1 --oneline`,
- validation command results,
- changed-file list,
- explicit user constraints for the next step.

Do not ask for missing information if it can be safely discovered from local reports or repo state.

## Advisor Operating Principles

- Evidence first, opinion second.
- Keep one source of truth: latest audit reports plus local repo evidence.
- Preserve the step-by-step Boilabin roadmap.
- Prefer 3-5 deliverable tasks when safe, rather than tiny repetitive retries.
- Keep risky areas behind explicit user approval.
- Treat local development, staging, production, and future mobile apps as separate concerns.
- If the user selected GPT-5.5 or extra-high reasoning in their Codex surface, use it; repo files cannot force model selection.

## Required Review Sequence

1. Identify the latest completed step and latest commit from evidence.
2. Compare the pasted Codex output with the matching audit report.
3. Verify files changed, files staged or committed, and remaining dirty files.
4. Verify validation results and classify failures.
5. Confirm prohibited files and actions were not touched.
6. Identify remaining blockers and risks.
7. Choose the next safest step.
8. Provide one next Codex prompt if requested.

## Evidence Rules

- Do not assume a commit happened unless a commit hash or `git log` evidence exists.
- Do not assume validation passed unless command output or report evidence says so.
- Do not print secrets or full connection strings.
- If local evidence conflicts with an audit report, say so plainly.
- If a report is missing, classify the step as unverified rather than guessing.
- Build failures caused only by unavailable local PostgreSQL during DB-backed static generation are the known environment blocker, not a code failure.

## Output Rules

When reviewing a step, include:

- whether the step succeeded,
- what changed,
- validation passed or failed,
- risks remaining,
- prohibited files/actions status,
- latest commit if available,
- next safest move.

When generating a prompt, provide one prompt only unless the user explicitly asks for alternatives.

If the user asks why Advisor mode did not keep running after the last task, explain that Codex skills and agents are invoked by prompts/workflow context. They are not persistent background services inside the VS Code chat.

## Next Prompt Generation Rules

Every next prompt should include:

- `/plan`,
- context and latest completed step,
- goal,
- files to read first,
- allowed work and exact allowed files when editing,
- strict guardrails,
- validation commands,
- required report name if a report should be created,
- exact-file staging and commit rules when committing,
- stop conditions,
- final response format.

Do not mix unrelated technical/security commits with visual, footer, media, payment-logo, or category-image work.

The generated prompt is a draft for human approval. Do not execute it unless the user explicitly approves or pastes it back as the next task.

## Bigger Task Rules

When the user asks for bigger tasks, combine related work only if:

- all work shares the same risk class,
- files can be bounded,
- validation can prove the result,
- prohibited areas remain excluded,
- rollback/review remains understandable.

Good bundles include:

- no-DB API tests plus a report,
- docs/audit cleanup plus exact-file commit,
- browser QA plus a non-runtime report,
- provider-neutral staging planning.

Bad bundles include:

- database migration plus visual work,
- payment provider setup plus checkout UI,
- hosting deployment plus secrets rotation,
- CSP enforcement plus tracking provider setup.

## Multi-Agent Coordination Rules

Use real subagents when available and useful:

- Explorer: read-only file and state mapping.
- Guardian: guardrail and risk review.
- Validator: validation order and failure classification.
- Docs Auditor: audit/report consistency.
- Implementer: one writer only after coordinator approval.

If real subagents are unavailable, use simulated lanes in the same chat and state that clearly. Never pretend simulated lanes were real.

## Risk And Stop Condition Rules

Stop or ask for approval before:

- migrations, `prisma db push`, seed/reset, destructive SQL, or schema changes,
- deployment, provider CLI use, DNS, hosting, email/SMS, or external services,
- payment/tracking/seller marketplace implementation,
- CSP enforcement or default CSP report collection,
- distributed rate limiting implementation,
- mobile app implementation,
- private env edits or secret printing,
- broad staging commands,
- touching paused visual or media files without an approved visual step.

## Project Decisions To Preserve

- Boilabin is Bangladesh-focused and pre-launch/local-development only.
- Future canonical domain is `https://boilabin.com`.
- Hosting, staging, production provider, database provider, storage provider, monitoring provider, and email provider are not chosen.
- Local testing uses localhost or 127.0.0.1.
- Database URLs are separate from website hosting and domain decisions.
- Local PostgreSQL service readiness blocks DB-backed testing and product lifecycle migration until fixed.
- Flash Deals and Flash Sales were removed; `/deals` and `/api/admin/flash-sales` should remain removed unless a dedicated approved product step changes them.
- `public/assets/categories/baby-kids.jpg` must not be restored.
- Toys & Collectibles must not be undone.
- Footer, newsletter, payment-logo, and PromoSection visual work is paused.
- Media localization is paused until approved assets and licensing are available.
- Payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, product lifecycle migration, and mobile app implementation remain separate future work.
- Authenticated admin QA remains blocked unless a secure local method is approved.

## Standard Validation Commands

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

Add step-specific audit scripts when relevant.

## Exact Staging Rules

- Use exact-file `git add -- <file...>` only.
- Never use `git add .` or `git add -A`.
- Verify with `git diff --cached --name-only`.
- Commit only when the staged set exactly matches the approved file list.
- If unexpected files are staged, stop and report.

## Final Answer Template

Use the user's requested final format. If none is given, use:

1. Step verification summary
2. Files changed
3. Validation results
4. Prohibited files/actions confirmation
5. Remaining risks
6. Recommended next step
7. Copy-paste-ready Codex prompt

## Reusable Next-Prompt Skeleton

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:
- <step/report/commit evidence>

Goal:
<bounded goal>

Read first:
- <report/file>

Allowed work:
- <exact allowed work>

Allowed files:
- <exact file list if editing>

Strict guardrails:
- Do not print secrets or full DB URLs.
- Do not run migrations, db push, seed/reset, SQL, deployment, provider CLI, package updates, or Docker setup unless explicitly approved.
- Do not touch paused footer/newsletter/payment-logo/PromoSection/media files unless this is an approved visual step.
- Do not enable payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile app implementation, or product lifecycle migration.
- Use exact-file staging only if committing.

Validation:
- npm run db:url:safety
- npm run db:prisma:local:validate
- npm run db:prisma:local:generate
- npm run typecheck
- npm run lint
- npm test
- npm run build

Report:
Create <audit-report-path> with <required sections>.

Commit:
Stage only <exact files> and commit with:
<message>

Stop conditions:
- Stop if prohibited files are staged or touched.
- Stop if validation fails for a task-caused reason.
- Stop if the task would require secrets, DB mutation, deployment, or unapproved visual changes.

Final response:
Give me only:
1. Summary
2. Files changed
3. Validation results
4. Commit hash or reason no commit happened
5. Prohibited-action confirmation
6. Remaining risks
7. Recommended next step
```
