# Step 201 - Next Prompt Draft

## Recommended Next Step

Run a bounded Search Everywhere schema and metadata factual-alignment batch.

## Recommended Next Prompt

```text
/plan

We are continuing the Boilabin pre-launch e-commerce technical recovery workflow.

Latest completed batch:

* Steps 187-201 cleaned unsupported marketplace copy across allowed visible copy, metadata fallbacks, admin SEO helper text, docs, scanner, and tests.
* The content scanner now classifies hard-blocked and review-only findings by area.
* Remaining content findings are mostly out-of-scope docs examples, seed/demo content, protected footer copy, opengraph-image text, and review-only checkout/product labels.

Goal:
Run a bounded Search Everywhere schema and metadata factual-alignment implementation batch.

Focus:
Make structured data, social metadata, Open Graph image copy, product/category metadata completeness, and visible support facts align without inventing business claims.

Allowed files:

* `src/backend/seo/structured-data.ts`
* `src/backend/seo/constants.ts`
* `src/backend/seo/metadata.ts`
* `src/app/opengraph-image.tsx`
* `src/app/(store)/faq/page.tsx`
* `src/app/(store)/shipping/page.tsx`
* `src/app/(store)/returns/page.tsx`
* `tests/seo-policy.test.ts`
* `tests/content-quality-policy.test.ts`
* `scripts/audit-ai-marketing-copy.mjs`
* `docs/SEO_SEARCH_EVERYWHERE_STRATEGY.md`
* `audit-reports/202_SCHEMA_METADATA_FACTUAL_ALIGNMENT.md`
* `audit-reports/203_JSONLD_SHIPPING_RETURN_PAYMENT_REVIEW.md`
* `audit-reports/204_OPENGRAPH_SOCIAL_PREVIEW_COPY_CLEANUP.md`
* `audit-reports/205_SEO_SCHEMA_TEST_HARDENING.md`
* `audit-reports/206_NEXT_PROMPT_DRAFT.md`

Strict guardrails:

* Do not change visual layout or styling.
* Do not change route behavior.
* Do not change auth, checkout, payment, tracking, seller marketplace, product lifecycle, media/upload behavior, object storage, CDN, CSP enforcement, distributed rate limiting, or API contracts.
* Do not change Prisma schema, migrations, seed behavior, or database data.
* Do not run migrations, db push, seed/reset, SQL, Docker, provider CLI, deployment, package updates, or remote-service commands.
* Do not read private env files.
* Do not print secrets, DB URLs, tokens, cookies, credentials, auth headers, private connection strings, customer/order PII, or raw user data.
* Do not touch footer, newsletter, payment-logo assets, PromoSection, category media assets, Baby & Kids restoration, Toys rollback, Flash Deals restoration, `/deals`, or `/api/admin/flash-sales`.
* Do not invent shipping speed, return guarantees, payment availability, official brand relationships, authenticity, review, GTIN, MPN, seller, or merchant-feed claims.
* Structured data must match visible page facts or remove/soften the claim.
* Stage exact allowed changed files only.

Tasks:

1. Inspect current SEO/schema helpers and public support facts.
2. Identify schema claims that are stronger than visible page facts.
3. Clean Open Graph image/social fallback copy if it contains unsupported authenticity or trust claims.
4. Adjust JSON-LD only where factual alignment is clearly needed.
5. Add or update tests for schema/metadata wording and content scanner coverage.
6. Create the requested audit reports.

Validation:

* `git diff --check -- <allowed changed files>`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `node scripts/audit-ai-marketing-copy.mjs`
* `.\node_modules\.bin\tsx --test tests\seo-policy.test.ts tests\content-quality-policy.test.ts`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit:

If validation passes and only allowed files changed, commit with:

`fix: align schema and social metadata claims`

Final response format:

1. Summary of schema/metadata factual-alignment batch
2. Files changed/staged/committed
3. Schema claims reviewed
4. Metadata/social copy result
5. Tests added/updated
6. Validation results
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no prohibited files/actions occurred
9. Remaining risks
10. Recommended next step
```
