# Step 123 - Boilabin Advisor Next-Step Workflow

## Scope

Created a local Boilabin Advisor workflow so future Codex results and audit reports can be reviewed in the same VS Code Codex chat, then turned into one safe next-step prompt without relying on a separate manual ChatGPT review loop.

This step was workflow-only. It did not change application runtime behavior.

## Latest Commit Verified

Before Step 123 edits, the latest commit was:

```text
e86dd71 chore: add codex single-chat multi-agent workflow
```

## Initial Git Status

Initial local status was clean, with no staged files, before creating the Step 123 files.

## Multi-Agent Planning Mode Used

Real subagents were used for read-only planning:

- Explorer Agent
- Guardian Agent
- Validator Agent
- Docs Auditor Agent

The coordinator performed the implementation after all lanes returned findings.

## Explorer Lane Summary

- Verified `HEAD` was `e86dd71`.
- Verified the worktree and staged set were initially clean.
- Confirmed the Step 123 target files did not exist before implementation.
- Identified Step 122 conventions for `.codex/agents`, local skills, docs, dependency-free scripts, node:test tests, and audit reports.

## Guardian Lane Summary

- Confirmed Step 123 should be workflow-only and should not edit runtime files.
- Confirmed the Advisor must not automatically approve risky future work.
- Preserved stop conditions for secrets, DB mutations, deployment, package changes, and paused visual/media domains.

## Validator Lane Summary

- Confirmed Step 122 validation was healthy before implementation.
- Confirmed `scripts/boilabin-advisor-state.mjs` was expected to be missing before Step 123.
- Recommended validation order for the new script, existing workflow audits, standard checks, tests, and build.

## Docs Auditor Lane Summary

- Confirmed reports 120, 121, and 122 were present.
- Confirmed Step 122 created the one-chat workflow foundation.
- Confirmed provider, hosting, database, storage, monitoring, and email decisions remain unresolved.
- Identified the expected ChatGPT-style Advisor answer shape.

## Files Created

- `.codex/agents/boilabin-advisor.toml`
- `.agents/skills/boilabin-advisor/SKILL.md`
- `docs/development/BOILABIN_ADVISOR_WORKFLOW.md`
- `scripts/boilabin-advisor-state.mjs`
- `tests/boilabin-advisor-workflow.test.ts`
- `audit-reports/123_BOILABIN_ADVISOR_NEXT_STEP_WORKFLOW.md`

## Advisor Agent Summary

Added a `boilabin-advisor` Codex agent definition for strict Boilabin workflow review and next-step prompt generation.

The agent is instructed to:

- verify evidence before recommendations,
- identify latest step, commit, validation, risks, and prohibited-action status,
- produce one copy-paste-ready next prompt,
- avoid inventing validation or commit evidence,
- avoid risky DB, deployment, payment, tracking, seller, CSP enforcement, distributed rate-limit, mobile, and visual/media work without approval.

## Advisor Skill Summary

Added a local `boilabin-advisor` skill with:

- required review sequence,
- evidence rules,
- next-prompt generation rules,
- bigger-task rules,
- real/simulated multi-agent coordination rules,
- risk and stop-condition rules,
- exact-file staging rules,
- reusable next-prompt skeleton,
- preserved Boilabin decisions and paused areas.

## Advisor Workflow Doc Summary

Added `docs/development/BOILABIN_ADVISOR_WORKFLOW.md` to explain how to use the Advisor in one VS Code Codex chat.

It documents:

- what the Advisor can and cannot automate,
- how to read Codex output and audit reports,
- how to compare evidence,
- how to decide the next safest step,
- how to use real subagents or simulated lanes,
- when human approval is required,
- examples for common review and planning scenarios.

## Advisor State Script Summary

Added a dependency-free Node ESM script:

```text
node scripts/boilabin-advisor-state.mjs
```

The script reads only safe workflow files and audit reports. It does not read `.env` or `.env.local`, does not print env values, does not call git, does not connect to any database, and does not mutate files.

It reports:

- highest numbered audit report,
- latest report title,
- latest commit reference if detectable,
- validation and recommended-next-step snippets if detectable,
- required Advisor file presence,
- whether core project decisions are documented,
- obvious secret-looking strings in Advisor docs/config,
- broad staging recommendations in Advisor docs/config.

## Test Guardrail Summary

Added `tests/boilabin-advisor-workflow.test.ts` to verify:

- all Step 123 files exist,
- the Advisor skill frontmatter is valid,
- required Advisor skill sections exist,
- major Boilabin decisions are preserved,
- workflow doc explains human approval and realistic automation limits,
- the Advisor state script avoids removed promo-route literals rejected by existing script scans,
- the Advisor state script returns ready state,
- secret and broad-staging scanners behave as expected,
- new Advisor files do not contain obvious secret-looking values.

## How This Can Replace Most Manual ChatGPT Review

The Advisor workflow can handle most repeated review tasks that were previously done manually:

- read the Codex output,
- compare it with audit reports,
- summarize success, changes, validation, and risks,
- identify the next safe task,
- generate a ready-to-paste prompt.

It keeps the work inside one VS Code Codex chat and can use real subagents when available.

## What Still Requires Human Approval

Human approval is still required for:

- database migrations or schema changes,
- remote service/provider/deployment choices,
- secrets or private env changes,
- payment or tracking integration,
- seller marketplace work,
- CSP enforcement or default report collection,
- distributed rate limiting,
- mobile app implementation,
- paused visual/media/footer/newsletter/payment-logo/PromoSection work.

## Important Decisions Preserved

- Boilabin remains pre-launch and local-development focused.
- Future canonical domain remains `https://boilabin.com`.
- Hosting, staging, production provider, database provider, storage provider, monitoring provider, and email provider remain unresolved.
- Flash Deals and Flash Sales remain removed; `/deals` and `/api/admin/flash-sales` should remain removed unless a dedicated approved step changes them.
- `public/assets/categories/baby-kids.jpg` must not be restored.
- Toys & Collectibles must not be undone.
- Footer, newsletter, payment-logo, PromoSection, and media-localization work remain paused unless separately approved.
- Payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, product lifecycle migration, and mobile app implementation remain separate future work.

## What This Step Did Not Do

- Did not edit app source/runtime behavior.
- Did not edit env files or print secrets.
- Did not edit Prisma schema or migrations.
- Did not run migrations, `prisma db push`, seed, reset, SQL, Docker, or deployment commands.
- Did not touch footer, newsletter, payment-logo, PromoSection, category images, banner images, or visual assets.
- Did not enable payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, product lifecycle migration, or mobile implementation.

## Validation Results

Final validation passed.

Commands run:

- `node scripts/boilabin-advisor-state.mjs` - passed.
- `node scripts/audit-codex-multi-agent-workflow.mjs` - passed.
- `node scripts/audit-provider-decision-docs.mjs` - passed.
- `node scripts/audit-prelaunch-env-readiness.mjs` - passed.
- `npm run db:url:safety` - passed; DB URL shape classified local, shadow local, separate, local migration ready yes. No database connection attempted by the checker.
- `npm run db:prisma:local:validate` - passed.
- `npm run db:prisma:local:generate` - passed.
- `npm run typecheck` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 306/306 tests.
- `npm run build` - passed.

During validation, an initial `npm test` run caught that the new Advisor secret scanner did not flag prefixed secret variable names. The helper and test fixture were corrected, then `node scripts/boilabin-advisor-state.mjs`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` all passed.

## Prohibited Actions Not Performed

- No secrets or full DB URLs were printed.
- No private env files were read.
- No DB mutation commands were run.
- No deployment or provider commands were run.
- No broad staging commands were used.
- No paused visual/media files were edited, staged, or committed.

## Remaining Risks

- The Advisor can reduce manual review overhead, but it still depends on accurate audit reports and local evidence.
- Human approval is still required for risky roadmap transitions.
- Future prompts generated by the Advisor still need user review before execution.

## Recommended Next Step

Use the Advisor workflow on the next pasted Codex output or audit-report summary. If no new implementation is needed, run a small dry-run prompt-generation review to confirm it produces the expected ChatGPT-style next-step prompt.
