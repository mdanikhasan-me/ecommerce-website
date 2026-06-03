# Boilabin Advisor Quickstart

## Purpose

Use Boilabin Advisor mode to review the latest Codex output and audit report, verify what happened, and draft one safe next Codex prompt in the same VS Code chat.

Advisor mode is a prompt-invoked workflow. It is not a forever-running background loop.

## What To Type

```text
Run Boilabin Advisor mode.
```

## Best Short Prompt

```text
Run Boilabin Advisor mode.

Review the latest Codex output and latest audit report.
Verify the latest step, commit, files changed, validation, risks, and prohibited actions.
Then generate exactly one next safest Codex prompt with strict guardrails.
Do not execute the next prompt until I approve it.
```

## What The Advisor Will Do

- Identify the latest completed step from audit reports and repo evidence.
- Compare Codex output against the matching report.
- Summarize changed files, validation results, risks, and remaining blockers.
- Confirm whether prohibited areas appear untouched.
- Recommend the next safest step.
- Draft exactly one copy-paste-ready next prompt.

## What It Cannot Do Automatically

- It cannot keep running after every task without being invoked again.
- It cannot execute the generated next prompt without user approval.
- It cannot approve risky roadmap work on the user's behalf.
- It cannot safely infer missing validation, commits, or reports without evidence.
- It cannot bypass secrets, database, deployment, payment, tracking, seller, mobile, CSP, rate-limit, or paused visual/media guardrails.

## Human Approval Rules

Human approval is required before:

- migrations, schema changes, `prisma db push`, seed/reset, or SQL,
- deployment, provider setup, DNS, hosting, storage, monitoring, or email setup,
- secrets or private env changes,
- payment or tracking implementation,
- seller marketplace implementation,
- CSP enforcement or default collection,
- distributed rate limiting implementation,
- mobile app implementation,
- paused footer, newsletter, payment-logo, PromoSection, image, or media work.

## Example: After A Codex Task Finishes

```text
Run Boilabin Advisor mode.

Review the Codex result I just pasted and the newest audit report.
Tell me whether the step succeeded, what changed, what validation passed or failed, what risks remain, and what the next safest step is.
Then give me exactly one next Codex prompt.
Do not run that prompt yet.
```

## Example: Generate Only The Next Prompt

```text
Run Boilabin Advisor mode.

Use the latest audit report as the source of truth.
Generate exactly one next safest Codex prompt.
Do not execute it.
```

## Example: Bigger Safe Task

```text
Run Boilabin Advisor mode.

Find a safe bigger next task with 3-5 related deliverables.
Keep it non-runtime unless the latest reports clearly approve otherwise.
Do not include DB migration, deployment, payment, tracking, seller, mobile, CSP enforcement, distributed rate limiting, or paused visual/media work.
```

## Troubleshooting

If Advisor mode does not seem active:

- Use the exact phrase `Run Boilabin Advisor mode.`
- Include the latest Codex output or report path if the chat context is long.
- Ask it to inspect `audit-reports/` and `git log -1 --oneline`.
- Remember that skills and agents are invoked by prompts; they are not permanent background workers.
- If subagents are unavailable, the Advisor should use clearly labeled simulated lanes and say so.

## Recommended Default Prompt

```text
Run Boilabin Advisor mode.

Review the latest Codex output and latest audit report.
Verify the latest step, commit, files changed, validation, risks, and prohibited actions.
Then generate exactly one next safest Codex prompt with strict guardrails.
Do not execute the next prompt until I approve it.
```
