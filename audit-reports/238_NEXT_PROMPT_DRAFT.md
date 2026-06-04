# Step 238 - Next Prompt Draft

## Recommended Next Step

Run a visual-only public storefront UI/UX redesign and QA batch, keeping backend/deployment/search/payment/data behavior untouched.

## Recommended Next Prompt

```text
/plan

We are continuing the Boilabin pre-launch e-commerce technical recovery workflow.

Goal:
Run a visual-only public storefront UI/UX improvement batch now that content, schema, metadata, and search verification foundations are documented. This must improve buyer-facing polish without touching backend behavior.

Building-system analogy:
The building's plumbing, electrical, permits, and inspection checklist are now mapped. This step is interior presentation only: improve the storefront rooms buyers see, but do not move load-bearing walls, utilities, security systems, or the building permit paperwork.

Read first:
- audit-reports/236_BATCH_SUMMARY.md
- audit-reports/235_UI_UX_START_READINESS_DECISION.md
- docs/SEO_SEARCH_EVERYWHERE_STRATEGY.md
- docs/deployment/STAGING_SEARCH_VERIFICATION_RUNBOOK.md
- current homepage/storefront components selected for this visual batch

Allowed files:
- exact storefront component/page files to be listed before editing
- matching visual-only tests if needed
- one focused audit report

Strict guardrails:
- visual/layout/content polish only in the approved storefront files
- no auth, checkout, payment, tracking, seller marketplace, product lifecycle, API, Prisma, migration, seed, deployment, provider, DB, CSP, rate-limit, media upload, object storage, or CDN changes
- no footer/newsletter/payment-logo/PromoSection/category media/Baby & Kids/Toys/Flash Deals restoration unless explicitly listed
- do not restore `/deals` or `/api/admin/flash-sales`
- do not read private env files
- do not print secrets or DB URLs
- do not run migrations/db push/seed/reset/SQL/Docker/provider CLI/deploy
- preserve factual copy and schema/metadata claims

Anti-hallucination rules:
- do not add trust/premium/best/authentic/fast/guaranteed/payment-provider claims
- do not claim seller marketplace or online payments are live
- do not change canonical/noindex/search verification behavior
- do not imply hosted verification is complete

Tasks:
1. Inventory current public storefront visual surfaces.
2. Choose a bounded visual scope.
3. Implement visual-only improvements.
4. Run browser/screenshot checks on desktop and mobile if safe.
5. Run validation.
6. Create audit report.
7. Stage exact allowed files only and commit if validation passes.

Validation:
- git diff --check -- <exact changed files>
- npm run db:url:safety
- node scripts/audit-ai-marketing-copy.mjs
- node scripts/audit-search-verification-readiness.mjs
- npm run typecheck
- npm run lint
- npm test
- npm run build
- browser screenshot/runtime checks for changed pages if safe

Stop conditions:
- stop if backend, DB, provider, payment, tracking, seller, product lifecycle, schema, auth, checkout, or deployment changes become necessary
- stop if visual work would require unsupported business claims
- stop if browser checks cannot run and the visual change is high risk

Final response format:
1. Summary of visual-only UI/UX batch
2. Files changed/staged/committed
3. Visual surfaces changed
4. Browser/screenshot verification
5. Validation results
6. Commit hash/oneline, or reason no commit happened
7. Confirmation no prohibited files/actions occurred
8. Remaining risks
9. Recommended next step
```
