# Step 218 - Next Prompt Draft

## Recommended Next Step

Run a provider-neutral staging/search verification planning batch before any deployment or provider choice.

## Recommended Next Prompt

```text
/plan

We are continuing the Boilabin pre-launch e-commerce technical recovery workflow.

Goal:
Create a provider-neutral staging/search verification plan after the Search Everywhere schema baseline. This is planning/docs only. Do not deploy, choose a provider, connect DNS, or enable production integrations.

Building-system analogy:
Treat launch verification like inspecting the building before opening it to the public. Do not paint one sign and call it ready. Map the entrances, fire exits, utilities, inspection paperwork, and what must be checked before people arrive.

Read first:
- audit-reports/216_SEARCH_EVERYWHERE_BATCH_SUMMARY.md
- audit-reports/217_NEXT_IMPLEMENTATION_SEQUENCE.md
- docs/SEO_SEARCH_EVERYWHERE_STRATEGY.md
- docs/deployment/STAGING_DEPLOYMENT_RUNBOOK.md if present
- docs/deployment/ENVIRONMENT_VARIABLE_INVENTORY.md if present
- README.md
- package.json

Allowed files:
- docs/deployment/STAGING_SEARCH_VERIFICATION_PLAN.md
- docs/deployment/SEARCH_CONSOLE_BING_WEBMASTER_CHECKLIST.md
- audit-reports/219_STAGING_SEARCH_VERIFICATION_PLAN.md
- audit-reports/220_NEXT_IMPLEMENTATION_SEQUENCE.md
- audit-reports/221_NEXT_PROMPT_DRAFT.md

Strict guardrails:
- Do not edit source/runtime files.
- Do not edit env files.
- Do not read private env files.
- Do not print secrets, DB URLs, tokens, cookies, credentials, auth headers, payment secrets, or private connection strings.
- Do not choose a hosting provider.
- Do not deploy.
- Do not connect DNS.
- Do not run provider CLI commands.
- Do not enable Search Console, Bing Webmaster Tools, analytics, tracking, payments, seller marketplace, CSP enforcement, distributed rate limiting, or product lifecycle migration.
- Do not change Prisma schema, migrations, seed data, database data, or run migrations/db push/seed/reset/SQL/Docker commands.
- Do not touch footer/newsletter/payment-logo/PromoSection/category media assets, `/deals`, or `/api/admin/flash-sales`.

Anti-hallucination rules:
- Mark anything requiring hosting/DNS/provider access as manual future work.
- Do not claim verification is complete.
- Do not claim Search Console/Bing accounts exist.
- Do not claim rich-result eligibility guarantees.
- Do not add SEO claims that are not backed by current code/docs.

Tasks:
1. Inventory what staging/search verification needs before public launch.
2. Create a provider-neutral checklist for DNS, canonical URL, robots, sitemap, structured data, OpenGraph previews, Search Console, Bing Webmaster Tools, rich results, Schema.org validation, image discovery, and AI answer manual checks.
3. Document local vs hosted verification boundaries.
4. Document which checks are blocked until hosting is connected.
5. Document which checks are blocked until local DB/staging data is available.
6. Recommend the next implementation batch.

Validation:
- git diff --check -- docs/deployment/STAGING_SEARCH_VERIFICATION_PLAN.md docs/deployment/SEARCH_CONSOLE_BING_WEBMASTER_CHECKLIST.md audit-reports/219_STAGING_SEARCH_VERIFICATION_PLAN.md audit-reports/220_NEXT_IMPLEMENTATION_SEQUENCE.md audit-reports/221_NEXT_PROMPT_DRAFT.md
- npm run db:url:safety
- npm run typecheck
- npm run lint
- npm test
- npm run build

Commit:
If validation passes and only allowed files changed, stage exact changed files and commit:
docs: add staging search verification plan

Stop conditions:
- Stop if deployment/provider/DNS access becomes necessary.
- Stop if private env/secrets would need to be read.
- Stop if source/runtime changes are needed.
- Stop if DB/migration/Docker/SQL work becomes necessary.

Final response format:
1. Summary of staging/search verification planning
2. Files changed/staged/committed
3. Local vs hosted verification boundary
4. Search Console/Bing checklist result
5. Rich-result/social-preview validation plan
6. Blockers
7. Validation results
8. Commit hash/oneline, or reason no commit happened
9. Confirmation no prohibited files/actions occurred
10. Recommended next step
```
