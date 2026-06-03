# Step 92 - Frontend Original Experience Forensic Restore Audit

## Scope

This step investigated the reported loss of the original storefront/homepage experience, missing category/product route behavior, missing seeded storefront content, and admin-login mismatch after the local Prisma migration/seed workflow.

This was a forensic audit first. No storefront source restore was performed because the evidence did not prove a single safe local known-good frontend file version that could be restored without undoing intentional security, SEO, product-visibility, and catalog work.

## Files changed

- `audit-reports/92_FRONTEND_ORIGINAL_EXPERIENCE_FORENSIC_RESTORE.md`

No runtime/source/UI/database/schema files were edited.

## GitHub/remote use

GitHub and remote history were not used for recovery. The investigation used local git history, local working tree state, audit reports, current source, and local runtime checks.

No `git fetch`, `git pull`, remote checkout, remote restore, or deployment command was run.

## Starting repository state

- Working tree was clean before the report was created.
- No files were staged before the report was created.
- Current HEAD before the report was created: `bc73538 chore: add initial local prisma migration`
- Branch: `main`

## Audit reports reviewed

- `audit-reports/13_CATEGORY_PRODUCT_COUNT_UI_LOG.md`
- `audit-reports/15_BROWSER_MOBILE_PERFORMANCE_VERIFICATION.md`
- `audit-reports/16_STEP_3_NO_VISUAL_PERFORMANCE_FIX_LOG.md`
- `audit-reports/19_STEP_6_PRODUCT_LIFECYCLE_VISIBILITY_LOG.md`
- `audit-reports/57_GROUP4_GROUP8_SEO_CATALOG_PRECOMMIT_REVIEW.md`
- `audit-reports/64_GROUP7_GROUP8_COMMIT_LOG.md`
- `audit-reports/85_TOYS_COLLECTIBLES_CATEGORY_TAXONOMY.md`
- `audit-reports/91C_INITIAL_LOCAL_SCHEMA_MIGRATION_SEED_AND_DEV_SMOKE.md`

## Relevant local history

- `3f648cf perf: reduce storefront auth flow client work`
- `0479c72 feat: show buyer-visible category product counts`
- `bc73538 chore: add initial local prisma migration`

Targeted local diffs showed:

- Group 7 did not materially change the investigated storefront/catalog files.
- Group 8 changed storefront/catalog behavior in `src/app/(store)/page.tsx`, category/product/search/deals/new-arrivals routes, and added shared product-visibility/count helpers.
- Group 8 added stricter buyer-visible product filtering through `src/backend/catalog/product-visibility.ts`.
- Group 8 removed the homepage `NewsletterSection` render from `src/app/(store)/page.tsx`.
- Group 8 added dynamic category count behavior to `FeaturedCategories`.

## Current source findings

Current homepage source still renders these major storefront components:

- `HeroBanner`
- `FeaturedCategories`
- `ProductGrid`
- `FlashSaleSection`
- `PromoSection`

Current homepage source no longer renders `NewsletterSection` from `PromoSection`.

Current buyer-visible product logic requires:

- `Product.isActive === true`
- `Category.isActive === true`
- `Seller.status === APPROVED`

This stricter rule is intentional recovery-roadmap work from the product visibility contract and category count steps. Reverting it broadly would be risky and could undo buyer-visibility/security/SEO assumptions.

## Critical env/database finding

The local browser/runtime uses `.env.local` through Next.js.

Sanitized env inspection showed:

- `.env` has a remote-looking `DATABASE_URL`.
- `.env.local` has a local `DATABASE_URL`.
- `.env.local` local app database currently has zero categories and zero products.

This directly explains the local browser symptoms:

- homepage DB-backed storefront sections have no local seeded data to show
- `/category/electronics` returns 404
- `/category/gaming` returns 404
- known product slugs return 404
- local admin login cannot match old/non-local data because the local app DB has no local seeded users

Important correction: an earlier direct Node/Prisma probe in this forensic pass was run before the env mismatch was isolated. That direct probe should be treated as non-local `.env` evidence and excluded from local recovery decisions. It was read-only; no write, migration, seed, reset, or destructive command was run during Step 92.

## Seed workflow finding

`package.json` currently has safe local wrappers for Prisma validate/generate/migrate commands, but `db:seed` is still a raw seed command:

- `db:seed` runs the seed directly instead of through the local DB guardrail.

Because `.env` is remote-looking and `.env.local` is the intended local override, the seed path needs a guarded local seed command before running seed again. Otherwise, future seeding can target the wrong database.

No seed command was run in Step 92.

## Route smoke result

A temporary local dev server started on `http://localhost:3001` because port `3000` was already occupied.

Smoke-check results:

| Route | Result |
| --- | --- |
| `/` | 200 |
| `/contact` | 200 |
| `/category` | 200 |
| `/category/electronics` | 404 |
| `/category/gaming` | 404 |
| `/products/hp-spectre-x360-14` | 404 |
| `/products/iphone-15-pro-128gb` | 404 |
| `/deals` | 200 |
| `/new-arrivals` | 200 |
| `/cart` | 200 |
| `/checkout` | 307 to login |
| `/auth/login` | 200 |
| `/api/auth/session` | 200 |

The 404s are consistent with the `.env.local` local DB being empty.

Repo-local Next dev processes were stopped after the smoke check.

## Admin finding

The local `.env.local` app database has no local seeded user data, so the previous super-admin password cannot be validated against local runtime state.

This is not evidence that auth code was broken. It is evidence that local DB seeding did not populate the database used by Next.js.

No admin credential values were printed in this report.

## Root cause classification

Classification: mixed data/env and source-behavior issue.

Primary proven cause:

- `.env.local` local app DB is empty while the browser/runtime uses `.env.local`.

Secondary source-behavior contributors:

- Group 8 intentionally tightened storefront product visibility.
- Group 8 removed the homepage newsletter section render from `page.tsx`.
- Group 8 changed category/product route eligibility to the shared buyer-visible policy.

Not proven:

- A single accidental frontend source deletion that can be safely restored.
- A safe local known-good commit whose storefront source can be blindly restored without undoing intentional recovery-roadmap work.

## Source restore decision

No frontend source restore was performed.

Reason:

- The most important current breakage is explained by the local runtime database being empty.
- Restoring older storefront source would risk undoing intentional product visibility, SEO, category count, and security-adjacent work.
- The original old storefront data is not present in the local app database used by Next.js.

## Validation commands run

- `npm run db:url:safety`
- `npm run db:prisma:local:validate`
- `npm run db:prisma:local:generate`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

## Validation results

- `npm run db:url:safety`: passed; URL-shape readiness reports local app DB and local shadow DB.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 175 tests.
- `npm run build`: passed.

## Safety confirmations

- No GitHub/remote recovery was used.
- No source/API/security/auth/payment/tracking/seller/product-lifecycle files were edited.
- No footer/newsletter visual/payment-logo/category image/PromoSection files were edited, staged, restored, regenerated, deleted, or optimized.
- `public/assets/categories/baby-kids.jpg` was not restored.
- No Prisma schema or migration file was changed in Step 92.
- No migration, `db push`, reset, destructive SQL, seed, Docker setup, deployment, or package installation command was run in Step 92.
- No secrets, full DB URLs, credential values, cookies, auth headers, payment secrets, or customer/order PII were printed in this report.

## Remaining risks

- The raw `db:seed` command is unsafe for this repo's current `.env`/`.env.local` setup.
- The local app DB used by Next.js is empty, so category/product/admin route verification is not meaningful yet.
- The previous/original storefront content may exist only in a non-local database or old export that is not safe to use as an implicit restore source.
- If visual/footer/newsletter/category assets are later restored, they must remain a separate dedicated visual step.
- The old super-admin credential mismatch cannot be resolved safely until local DB seeding is performed through a guarded local-only path.

## Recommended next step

Step 93 should fix the local seed guardrail and repopulate the local app DB safely:

1. Add a guarded local seed command that loads `.env` first and `.env.local` second, requires local app and shadow DB classification, and refuses remote-looking DB URLs.
2. Run the seed only through that guarded local command.
3. Verify local-only counts for categories/products/users without printing credentials or PII.
4. Smoke-check `/`, `/category/electronics`, known product detail routes, `/auth/login`, and protected admin redirect behavior.
5. Do not restore frontend source or visual assets unless the local seeded browser state still proves a source regression after local data is corrected.
