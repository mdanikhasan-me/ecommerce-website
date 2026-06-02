# Step 57: Group 4 + Group 8 SEO/Catalog Pre-Commit Review

## 1. Scope of Step 57

This was a review-only pre-commit audit for:

- Commit Group 4: technical SEO policy, robots, sitemap, canonical URL, metadata, and structured data changes.
- Commit Group 8: catalog/search/product visibility, category product counts, product detail visibility, deals/new-arrivals visibility, and homepage category count UI support.

No staging, commit, revert, delete, rename, migration, database command, Docker command, runtime behavior change, or source-code edit was performed in this step.

## 2. Files changed by Step 57

Created only:

- `audit-reports/57_GROUP4_GROUP8_SEO_CATALOG_PRECOMMIT_REVIEW.md`

## 3. Files reviewed

### Group 4: SEO

- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/backend/seo/constants.ts`
- `src/backend/seo/index.ts`
- `src/backend/seo/metadata.ts`
- `src/backend/seo/robots.ts`
- `src/backend/seo/structured-data.ts`
- `src/backend/seo/urls.ts`
- `tests/seo-policy.test.ts`

### Group 8: Catalog/search/product visibility

- `src/app/(store)/category/[slug]/page.tsx`
- `src/app/(store)/deals/page.tsx`
- `src/app/(store)/new-arrivals/page.tsx`
- `src/app/(store)/page.tsx`
- `src/app/(store)/products/[slug]/page.tsx`
- `src/app/(store)/search/page.tsx`
- `src/backend/catalog/category-product-counts.ts`
- `src/backend/catalog/product-price-filter.ts`
- `src/backend/catalog/product-visibility.ts`
- `src/frontend/components/home/FeaturedCategories.tsx`
- `tests/category-product-counts.test.ts`

Related tests also reviewed and run:

- `tests/product-price-filter.test.ts`
- `tests/product-visibility.test.ts`

## 4. Current Git inventory for reviewed files

Tracked modified files in the reviewed set:

- `src/app/(store)/category/[slug]/page.tsx`
- `src/app/(store)/deals/page.tsx`
- `src/app/(store)/new-arrivals/page.tsx`
- `src/app/(store)/page.tsx`
- `src/app/(store)/products/[slug]/page.tsx`
- `src/app/(store)/search/page.tsx`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/backend/catalog/product-price-filter.ts`
- `src/backend/seo/constants.ts`
- `src/backend/seo/index.ts`
- `src/backend/seo/metadata.ts`
- `src/backend/seo/structured-data.ts`
- `src/frontend/components/home/FeaturedCategories.tsx`

Untracked files in the reviewed set:

- `src/backend/catalog/category-product-counts.ts`
- `src/backend/catalog/product-visibility.ts`
- `src/backend/seo/robots.ts`
- `src/backend/seo/urls.ts`
- `tests/category-product-counts.test.ts`
- `tests/seo-policy.test.ts`

Staged files:

- None.

Note: `git diff --stat` printed Windows line-ending warnings for tracked reviewed files. No line-ending fix was made in this step.

## 5. Group 4 SEO review result

Verdict: safe to manually stage later after normal review.

Findings:

- Canonical URL helpers reject localhost, `127.0.0.1`, and invalid URL values for production canonical output.
- Canonical fallback remains `https://boilabin.com`, which matches the pre-launch future-domain policy.
- Search pages are noindex/follow with a stable `/search` canonical.
- Faceted category URLs are noindex/follow while base category pages remain indexable.
- Robots disallow private/utility route families such as admin, account, auth, checkout, cart, order, and API routes.
- Robots intentionally do not block search/faceted URLs so crawlers can observe page-level noindex.
- Static sitemap entries exclude private/utility routes.
- Dynamic product sitemap entries use shared buyer-visible product filters.
- Dynamic category sitemap entries include active categories only.
- Structured data uses absolute URLs and product availability mapping.
- Product JSON-LD maps out-of-stock active products to out-of-stock availability without hiding them.

SEO caveats:

- Dynamic sitemap product/category queries were not DB-backed verified because local DB readiness is still no.
- Product lifecycle schema/status fields are not implemented yet, so SEO cannot express deleted/discontinued lifecycle states beyond current helper policy.
- Product JSON-LD does not currently include approved review snippets unless supplied by the caller.
- Public organization structured-data contact fields should be launch-reviewed as business-public information before going live.
- `src/backend/seo/constants.ts` contains an SEO keyword mentioning bKash payment, but no online payment integration is enabled by these files.
- `src/backend/seo/structured-data.ts` declares `paymentAccepted: 'Cash on Delivery'`, which is consistent with online payment remaining disabled.

## 6. Group 8 catalog/search/product visibility review result

Verdict: safe to manually stage later after catalog/backend review and one visual/browser checkpoint for the homepage category cards.

Findings:

- Buyer-visible product policy is centralized in `src/backend/catalog/product-visibility.ts`.
- Current buyer-visible criteria are:
  - product `isActive: true`
  - active category
  - approved seller
- Stock does not control visibility, which preserves the Step 6 contract that active out-of-stock products remain public.
- Product detail pages use `getPublicProductDetailWhere(slug)`, so inactive products, inactive categories, and unapproved sellers are excluded.
- Homepage product sections use shared buyer-visible filters.
- Deals and new-arrivals use shared buyer-visible filters.
- Category and search pages use shared buyer-visible filters.
- Category product counts use one grouped server-side count query and do not fetch full product lists for counts.
- Category counts are real dynamic counts, not fake hardcoded values.
- Category counts include visible products from direct and child categories.
- Effective-price helper tests confirm sale-price/base-price sorting behavior and page selection behavior.
- Search/category effective-price sort now fetches only ID and price fields for matching products before fetching the selected page by IDs.

Catalog caveats:

- Local DB-backed route verification was not possible because DB readiness remains no.
- Effective-price sorting still needs a database/index or computed-column strategy for very large catalogs; the current helper reduces payload but does not make database-side effective-price sorting fully solved.
- Category metadata product counts appear to count the direct category for metadata, while the rendered category listing can include active child categories. This is a consistency risk, not a blocker for staging.
- The homepage category product-count UI changes `src/frontend/components/home/FeaturedCategories.tsx`; current design appears intentionally preserved by code review, but a browser/mobile visual checkpoint is still recommended before commit.
- The search page contains existing text/content that should be visually reviewed separately; no visual/content edits were made here.

## 7. Security and privacy review

No secret values, database URLs, auth secrets, tokens, cookies, authorization headers, or customer PII were found in the reviewed Group 4/8 source scan.

The scan found only expected public/SEO-adjacent references:

- public SEO keyword text mentioning bKash payment
- structured-data payment accepted value of Cash on Delivery
- CSS/text terms containing the word tracking as part of normal styling text such as letter spacing

No payment backend, tracking API, seller marketplace implementation, Prisma schema, migration, seed/reset, Docker, or database code was changed by Step 57.

## 8. Safe-to-stage verdict

Recommended approach: split into two manual commits rather than one combined commit.

Reason:

- Group 4 is a coherent SEO policy/backend commit and has focused tests.
- Group 8 is a coherent catalog/search/product visibility commit, but it also includes the homepage category count UI, which should receive a separate browser/mobile visual checkpoint.
- Keeping them separate makes rollback/review easier if SEO crawler policy or catalog display behavior needs adjustment.

Combined commit acceptability:

- A combined commit is technically possible because both groups share buyer-visible product policy concerns.
- It is less ideal for review hygiene because it mixes SEO policy, catalog query behavior, and homepage UI count display.

Default recommendation: stage Group 4 first, then Group 8 after one browser/mobile visual check.

## 9. Suggested manual git add commands

No `git add` command was run in Step 57.

Recommended Group 4 manual staging command:

```powershell
git add -- `
  "src/app/robots.ts" `
  "src/app/sitemap.ts" `
  "src/backend/seo/constants.ts" `
  "src/backend/seo/index.ts" `
  "src/backend/seo/metadata.ts" `
  "src/backend/seo/robots.ts" `
  "src/backend/seo/structured-data.ts" `
  "src/backend/seo/urls.ts" `
  "tests/seo-policy.test.ts"
```

Recommended Group 8 manual staging command:

```powershell
git add -- `
  "src/app/(store)/category/[slug]/page.tsx" `
  "src/app/(store)/deals/page.tsx" `
  "src/app/(store)/new-arrivals/page.tsx" `
  "src/app/(store)/page.tsx" `
  "src/app/(store)/products/[slug]/page.tsx" `
  "src/app/(store)/search/page.tsx" `
  "src/backend/catalog/category-product-counts.ts" `
  "src/backend/catalog/product-price-filter.ts" `
  "src/backend/catalog/product-visibility.ts" `
  "src/frontend/components/home/FeaturedCategories.tsx" `
  "tests/category-product-counts.test.ts"
```

Optional related tests to consider with Group 8 only if you want helper tests bundled with the catalog commit:

```powershell
git add -- `
  "tests/product-price-filter.test.ts" `
  "tests/product-visibility.test.ts"
```

Those two tests were reviewed and passed, but they were previously considered part of the broader API/helper test group rather than the strict Group 8 file list.

## 10. Focused test results

Commands run:

```powershell
npx tsx --test tests/seo-policy.test.ts
npx tsx --test tests/category-product-counts.test.ts
npx tsx --test tests/product-price-filter.test.ts
npx tsx --test tests/product-visibility.test.ts
```

Results:

- `tests/seo-policy.test.ts`: 9 passed, 0 failed.
- `tests/category-product-counts.test.ts`: 3 passed, 0 failed.
- `tests/product-price-filter.test.ts`: 3 passed, 0 failed.
- `tests/product-visibility.test.ts`: 5 passed, 0 failed.

## 11. Full validation results

Commands run:

```powershell
npm run db:url:safety
npm run typecheck
npm run lint
npm test
npm run build
```

Results:

- `npm run db:url:safety`: passed as a safety check; no database connection attempted. `DATABASE_URL` is remote-looking, `SHADOW_DATABASE_URL` is missing, local migration ready is no.
- `npm run typecheck`: passed.
- `npm run lint`: passed with no ESLint warnings or errors. Next.js printed the known deprecation notice for `next lint`.
- `npm test`: passed, 168 tests passed, 0 failed.
- `npm run build`: passed. Next.js production build completed successfully.

## 12. Confirmation of prohibited-file safety

Step 57 did not touch:

- database
- Prisma schema
- `prisma/migrations/**`
- seed/reset/db-push scripts
- Docker runtime commands
- footer files
- newsletter visual layout
- payment-logo assets
- visual styling files outside the already reviewed homepage category count component
- payment backend
- tracking API
- seller marketplace
- product lifecycle schema/status behavior
- dependencies

No files were staged, committed, reverted, deleted, renamed, or cleaned.

## 13. Remaining risks

- Local DB readiness remains no, so DB-backed catalog/sitemap/product-detail behavior could not be verified against a local safe database.
- Homepage category count UI still needs a real browser/mobile visual checkpoint before committing Group 8.
- Effective-price sorting remains a scaling risk for large catalogs until a DB-level sort/index/computed strategy is planned.
- Product lifecycle schema is still paused, so discontinued/deleted/archived status behavior remains future work.
- Public business structured-data contact details should be launch-reviewed before indexing.
- If online payment remains disabled, SEO keywords mentioning online payment should be business-reviewed before launch for accuracy.

## 14. Recommended next step

Run a browser/mobile visual smoke check focused on:

- homepage category cards with product counts
- category page listing and faceted noindex metadata
- search page noindex metadata and listing behavior
- product detail page visibility and structured-data output
- `/robots.txt`
- `/sitemap.xml`

After that, manually stage Group 4 and Group 8 as two separate commits using the commands above.
