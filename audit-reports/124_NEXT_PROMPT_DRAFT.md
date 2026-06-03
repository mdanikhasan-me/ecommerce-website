# Step 124 Next Prompt Draft

```text
/plan

Run Boilabin Advisor mode.

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:
- Step 124 added a dry-run review of the Boilabin Advisor workflow and clarified that Advisor mode is prompt-invoked, not a forever-running background service.
- Step 124 commit should be verified from git before any Step 125 edits.

Goal:
Perform a provider-decision readiness review and next-roadmap selection using Advisor mode. This is a planning/audit-only step that helps choose the next safe roadmap task without deploying or changing runtime behavior.

Read first:
- audit-reports/120_PROVIDER_NEUTRAL_STAGING_READINESS_PACKAGE.md
- audit-reports/121_PROVIDER_DECISION_WORKBOOK_PACKAGE.md
- audit-reports/123_BOILABIN_ADVISOR_NEXT_STEP_WORKFLOW.md
- audit-reports/124_ADVISOR_DRY_RUN_AND_INVOCATION_REVIEW.md
- docs/development/BOILABIN_ADVISOR_QUICKSTART.md
- docs/development/BOILABIN_ADVISOR_WORKFLOW.md
- docs/deployment/DATABASE_AND_BACKUP_DECISION_WORKBOOK.md
- docs/deployment/STORAGE_AND_MEDIA_DECISION_WORKBOOK.md
- docs/deployment/MONITORING_AND_LOGGING_DECISION_WORKBOOK.md

Allowed work:
- Review provider-decision readiness only.
- Create one audit report with the recommended next roadmap step.
- Do not execute the recommended next prompt until I approve it.

Allowed files:
- audit-reports/125_PROVIDER_DECISION_READINESS_AND_ROADMAP_SELECTION.md

Strict guardrails:
- Do not print secrets, full DB URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, or raw user data.
- Do not read `.env`, `.env.local`, or private env files.
- Do not deploy or configure hosting.
- Do not choose a provider on my behalf.
- Do not run migrations, create migrations, edit Prisma schema, run `prisma db push`, seed/reset, SQL, or destructive DB commands.
- Do not update packages.
- Do not change Docker config.
- Do not touch app source, API behavior, runtime config, env examples, assets, footer/newsletter/payment-logo/PromoSection visual work, image/media localization, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile app implementation, or product lifecycle.
- Do not restore Flash Deals or Flash Sales.
- `/deals` and `/api/admin/flash-sales` must remain removed.
- Do not restore `public/assets/categories/baby-kids.jpg`.
- Do not undo Toys & Collectibles.
- Never use broad staging.

Tasks:
1. Verify latest commit and worktree status.
2. Review the provider-neutral staging package and provider decision workbooks.
3. Identify which decisions are still missing or need user input.
4. Decide whether the next safest step is provider workbook completion, local DB service work, staging planning, or another non-runtime readiness task.
5. Draft exactly one next Codex prompt inside the report, but do not execute it.

Validation:
- node scripts/boilabin-advisor-state.mjs
- node scripts/audit-provider-decision-docs.mjs
- node scripts/audit-prelaunch-env-readiness.mjs
- npm run db:url:safety
- npm run typecheck
- npm run lint
- npm test
- npm run build

Report:
Create `audit-reports/125_PROVIDER_DECISION_READINESS_AND_ROADMAP_SELECTION.md` with:
- scope,
- latest commit verified,
- initial git status,
- files changed,
- provider-decision readiness summary,
- missing decisions,
- next roadmap recommendation,
- next prompt draft,
- validation results,
- prohibited actions not performed,
- remaining risks,
- recommended next step.

Commit:
After validation passes, stage only:
git add -- audit-reports/125_PROVIDER_DECISION_READINESS_AND_ROADMAP_SELECTION.md

Commit message:
docs: review provider decision readiness

Stop conditions:
- Stop if provider choices would need to be made without user input.
- Stop if any prohibited file would need to be touched.
- Stop if secrets, DB mutation, deployment, package updates, Docker setup, or unapproved visual/media/runtime work would be required.
- Stop if validation fails for a task-caused reason.

Final response:
Give me only:
1. Summary of Step 125 work.
2. Whether Advisor mode was used.
3. Whether commit succeeded.
4. Commit hash if committed.
5. Exact files changed/staged/committed.
6. Provider-decision readiness result.
7. Recommended next roadmap step.
8. Validation results.
9. Prohibited files/actions confirmation.
10. Remaining risks.
11. Recommended next step.
```
