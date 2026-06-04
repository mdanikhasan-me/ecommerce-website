# Step 186 - Next Prompt Draft

Chosen next step: content quality cleanup implementation.

Reason: the media batch made upload policy and helper guardrails clearer without overbuilding CDN/variant storage. The next highest-impact low-risk step is cleaning unsupported "trusted/premium/best" copy from safe visible metadata/pages.

## Recommended Next Step

Proceed to Step 187 as a bounded content quality cleanup implementation batch.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce technical recovery workflow.

Latest completed state:

* Steps 169 through 178 completed whole-site understanding, Search Everywhere, content-quality, media, schema, scale, and UI/UX readiness audits.
* Steps 179 through 186 should have completed no-DB media upload optimization guardrails.
* Confirm from `audit-reports/185_MEDIA_BATCH_SUMMARY.md` before doing anything else.

Goal:
Run a bounded no-DB content quality cleanup implementation batch.

Remove or rewrite unsupported "trusted/premium/best/leading" style copy from safe visible metadata/pages without changing UI layout, route behavior, database schema, auth, checkout, payment, tracking, seller marketplace, or product lifecycle behavior.

Allowed files:

* `src/app/layout.tsx`
* `src/backend/config/site.ts`
* `src/backend/seo/constants.ts`
* `src/backend/seo/metadata.ts`
* `src/app/(store)/about/page.tsx`
* `src/app/(store)/page.tsx`
* `src/frontend/components/home/HeroBanner.tsx`
* `src/frontend/components/admin/ProductEditorForm.tsx`
* `docs/CONTENT_QUALITY_GUIDELINES.md`
* `scripts/audit-ai-marketing-copy.mjs`
* `tests/content-quality-policy.test.ts`
* `audit-reports/187_CONTENT_COPY_TARGET_REVIEW.md`
* `audit-reports/188_VISIBLE_COPY_CLEANUP_IMPLEMENTATION.md`
* `audit-reports/189_METADATA_COPY_CLEANUP.md`
* `audit-reports/190_CONTENT_QUALITY_TEST_HARDENING.md`
* `audit-reports/191_CONTENT_CLEANUP_BATCH_SUMMARY.md`
* `audit-reports/192_NEXT_PROMPT_DRAFT.md`

Strict guardrails:

* Do not change visual layout or styling.
* Do not change route behavior.
* Do not edit Prisma schema or migrations.
* Do not run migrations, db push, seed/reset, SQL, Docker, provider CLI, deployment, package updates, or remote-service commands.
* Do not query the database.
* Do not read private env files.
* Do not print secrets, full DB URLs, tokens, cookies, credentials, auth headers, private connection strings, customer/order PII, or raw user data.
* Do not touch footer, newsletter, payment-logo assets, PromoSection, category media assets, Baby & Kids restoration, Toys rollback, Flash Deals restoration, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile app implementation, or product lifecycle migration.
* Do not restore `/deals` or `/api/admin/flash-sales`.
* Stage exact allowed files only.

Tasks:

1. Run the content audit script and identify safe visible copy targets.
2. Rewrite unsupported generic claims into factual, specific copy.
3. Keep product state labels like Best Sellers only if they reflect app state, but remove unsupported "loved by thousands" or unproven quality claims.
4. Update metadata fallback copy to avoid unsupported "best price" claims.
5. Update content-quality tests/scripts if needed.
6. Create audit reports and next prompt draft.

Validation:

* `git diff --check -- src/app/layout.tsx src/backend/config/site.ts src/backend/seo/constants.ts src/backend/seo/metadata.ts src/app/(store)/about/page.tsx src/app/(store)/page.tsx src/frontend/components/home/HeroBanner.tsx src/frontend/components/admin/ProductEditorForm.tsx docs/CONTENT_QUALITY_GUIDELINES.md scripts/audit-ai-marketing-copy.mjs tests/content-quality-policy.test.ts audit-reports/187_CONTENT_COPY_TARGET_REVIEW.md audit-reports/188_VISIBLE_COPY_CLEANUP_IMPLEMENTATION.md audit-reports/189_METADATA_COPY_CLEANUP.md audit-reports/190_CONTENT_QUALITY_TEST_HARDENING.md audit-reports/191_CONTENT_CLEANUP_BATCH_SUMMARY.md audit-reports/192_NEXT_PROMPT_DRAFT.md`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `node scripts/audit-ai-marketing-copy.mjs`
* `.\\node_modules\\.bin\\tsx --test tests\\content-quality-policy.test.ts`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit:
If validation passes and only allowed files changed, stage exactly the allowed changed files.

Commit message:

```text
fix: replace unsupported marketplace copy
```

Stop conditions:

* Stop if visual redesign becomes necessary.
* Stop if DB access, migrations, provider setup, payment/tracking/seller work, private env, secrets, or route behavior changes become necessary.

Final response format:

1. Summary of Step 187-192 content batch
2. Files changed/staged/committed
3. Copy cleanup result
4. Metadata cleanup result
5. Tests/script result
6. Validation results
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no prohibited files/actions occurred
9. Remaining risks
10. Recommended next step
```
