# Boilabin Advisor Workflow

## Purpose

The Boilabin Advisor is a local Codex workflow role for reviewing Boilabin recovery-step outputs, comparing them against audit reports, and drafting the next safest copy-paste-ready Codex prompt.

It is meant to bring most of the previous ChatGPT review loop into the same VS Code Codex chat. It can automate review structure and prompt drafting, but it is not guaranteed to be better than careful human review and must not blindly run future risky work.

## Quickstart

Type this when you want the Advisor workflow:

```text
Run Boilabin Advisor mode.
```

The phrase is a prompt trigger. It asks Codex to load the Advisor skill, review the latest Codex output and audit report, verify the latest step, and draft exactly one next safest Codex prompt.

It is not a forever-running background loop. It does not create a forever-running background process. It does not execute the generated prompt. You still approve the next step before Codex runs it.

Recommended approval boundary:

```text
Do not execute the next prompt until I approve it.
```

## What The Advisor Can Automate

- Identify the latest completed step from audit reports and repo evidence.
- Summarize what changed and what was committed.
- Compare a pasted Codex result with the expected audit report.
- Classify validation failures.
- Confirm whether prohibited files or actions appear untouched.
- Recommend the next safest step.
- Draft one bounded Codex prompt with guardrails, validation, report requirements, and exact-file staging rules.

In practice, "automate" means "perform this review when prompted." It does not mean continuous unattended execution.

## What The Advisor Must Not Automate

- Secret handling, credential printing, or private env disclosure.
- Production deployment, DNS, provider CLI actions, hosting setup, or remote service configuration.
- Database migrations, `prisma db push`, seed/reset, destructive SQL, or schema changes without explicit approval.
- Payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, or mobile app implementation without a dedicated approved step.
- Paused footer, newsletter, payment-logo, PromoSection, or media asset work without a dedicated visual step.
- Broad staging, broad commits, or cleanup that reverts user work.
- Automatic execution of a generated next prompt without explicit user approval.

## How It Should Read Codex Output

The Advisor should extract:

- step number and report name,
- files changed,
- validation commands and results,
- commit hash and message,
- known blockers,
- explicitly untouched prohibited areas,
- any mismatch between user instructions and Codex actions.

If the output claims success but omits validation or commit evidence, the Advisor should mark that part unverified.

## How It Should Read Audit Reports

The Advisor should treat audit reports as the strongest local workflow evidence. It should read the latest relevant report and, when needed, nearby prior reports that explain context.

It should not assume old reports are current if newer reports contradict them.

## How It Should Compare Output Against Reports

Compare:

- changed files vs allowed files,
- validation claims vs validation section,
- commit claims vs commit section or `git log`,
- remaining risks vs known roadmap blockers,
- prohibited-file claims vs status/diff evidence.

If the pasted output and report disagree, the Advisor should say which source was used and why.

## How It Should Decide The Next Safest Step

Prefer the next step that:

- advances the roadmap without crossing unresolved blockers,
- has exact-file boundaries,
- avoids paused visual/media work unless explicitly approved,
- does not require unavailable local PostgreSQL unless the user says it is installed/running,
- does not require provider, payment, tracking, seller, or production choices,
- can be validated with existing scripts/tests.

Avoid repeating tiny Docker/PostgreSQL retry prompts unless the user confirms Docker, PostgreSQL, or `psql` is now available.

## How It Should Generate The Next Prompt

Each prompt should include:

- `/plan`,
- context and latest verified step,
- goal,
- read-first files,
- allowed work and allowed files,
- strict guardrails,
- validation commands,
- required report name,
- exact-file staging and commit rules when relevant,
- stop conditions,
- final response format.

The prompt should be copy-paste-ready and should not offer multiple unrelated alternatives unless the user asks.

## How To Use It In One VS Code Codex Chat

1. Paste the latest Codex result or audit report summary, or rely on local audit reports if the evidence is already present.
2. Type `Run Boilabin Advisor mode.`
3. Review the Advisor's summary and prompt.
4. Paste the prompt back into Codex only if you approve the next step.
5. Repeat after the next Codex run completes.

This keeps review, planning, implementation, and commit hygiene in one chat while preserving the previous manual review discipline.

## How To Use Real Subagents

When the task is larger than a tiny docs-only commit, run read-only lanes first:

- Explorer maps files and repo state.
- Guardian checks prohibited files, actions, and stop conditions.
- Validator plans validation and failure classification.
- Docs Auditor checks report consistency and latest-step context.

Only after the coordinator summarizes findings should one Implementer edit exact allowed files.

## How To Use Simulated Lanes

If real subagents are unavailable, use clearly labeled same-chat sections:

- `[Explorer findings]`
- `[Guardian findings]`
- `[Validator findings]`
- `[Docs Auditor findings]`
- `[Coordinator decision]`

Do not imply real subagents ran when they did not.

## Human Approval Rules

Human approval is required before:

- database schema or migration work,
- remote services or deployment,
- provider selection,
- payment or tracking implementation,
- seller marketplace implementation,
- CSP enforcement,
- distributed rate limiting implementation,
- mobile app implementation,
- paused visual/media work,
- any action involving secrets or private env changes.

## Bigger Task Strategy

The Advisor should encourage bigger tasks only when related deliverables share a risk class and can be validated together. A good larger task has three to five bounded deliverables and one coherent report.

Do not combine risky domains. For example, do not combine database migration planning with footer visuals, payment setup, or deployment.

## Examples

### Example 1: User Pastes Codex Output And Audit Report

The Advisor should verify the reported step, list changed files, classify validation, confirm prohibited areas, then provide the next safe prompt.

### Example 2: User Asks For A Bigger 3-5 Deliverable Task

The Advisor should bundle related no-DB work, such as a browser QA pass plus no-runtime report updates, while keeping exact allowed files and validation.

### Example 3: User Asks For Risky DB, Payment, Or Deployment Work

The Advisor should pause implementation, document the blocker or required approval, and draft a planning or readiness prompt instead of enabling risky production behavior.

### Example 4: User Resumes After A New Chat

The Advisor should inspect the uploaded audit reports, identify the latest completed step and commit, summarize current blockers, and draft the next prompt from evidence rather than memory.

## Project Decisions To Preserve

- Boilabin is pre-launch and local-development only.
- Future canonical domain is `https://boilabin.com`.
- Hosting, staging, provider, database, storage, monitoring, and email decisions remain unresolved.
- Flash Deals and Flash Sales were removed; `/deals` and `/api/admin/flash-sales` remain removed unless a dedicated approved step changes them.
- `public/assets/categories/baby-kids.jpg` must not be restored.
- Toys & Collectibles must not be undone.
- Footer, newsletter, payment-logo, PromoSection, and broader media localization work remain paused until approved.
