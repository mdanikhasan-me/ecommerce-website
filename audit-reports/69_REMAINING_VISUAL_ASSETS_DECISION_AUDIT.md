# Step 69: Remaining Visual/Assets Decision Audit

## 1. Scope of Step 69

This was an audit/planning-only checkpoint for the remaining dirty visual/assets work after the reviewed technical groups, track-order noindex change, and audit reports were committed.

No footer fix, footer redesign, payment-logo normalization, category-image restore/delete, `PromoSection.tsx` edit, runtime/source edit, staging, commit, revert, delete, rename, database, Docker, SQL, Prisma migration, seed, reset, db push, deployment, payment, tracking, seller marketplace, CSP enforcement, or product lifecycle work was performed.

Goal:

- classify the remaining dirty files
- identify whether any remaining file is technical/security/SEO/DB-related
- recommend safe next options without executing them
- keep broad staging risk explicit

## 2. Files Changed by Step 69

- `audit-reports/69_REMAINING_VISUAL_ASSETS_DECISION_AUDIT.md`

No existing project file was modified.

## 3. Current Git Status Summary

Before creating this report, `git status --short` showed only the paused visual/assets files:

```text
 D public/assets/categories/baby-kids.jpg
 M public/assets/categories/beauty-health.jpg
 M public/assets/categories/books-stationery.jpg
 M public/assets/categories/electronics.jpg
 M public/assets/categories/fashion.jpg
 M public/assets/categories/sports-fitness.jpg
 M public/assets/payments/bkash.svg
 M public/assets/payments/mastercard.svg
 M public/assets/payments/nagad.svg
 M public/assets/payments/visa.svg
 M src/frontend/components/home/PromoSection.tsx
 M src/frontend/components/layout/Footer.tsx
 M src/frontend/components/layout/NewsletterForm.tsx
```

Staged files:

- `git diff --cached --name-only` returned no staged files.

Diff stat before this report:

```text
13 files changed, 185 insertions(+), 122 deletions(-)
```

## 4. Remaining Dirty File Inventory

Remaining dirty tracked files:

- `public/assets/categories/baby-kids.jpg`
- `public/assets/categories/beauty-health.jpg`
- `public/assets/categories/books-stationery.jpg`
- `public/assets/categories/electronics.jpg`
- `public/assets/categories/fashion.jpg`
- `public/assets/categories/sports-fitness.jpg`
- `public/assets/payments/bkash.svg`
- `public/assets/payments/mastercard.svg`
- `public/assets/payments/nagad.svg`
- `public/assets/payments/visa.svg`
- `src/frontend/components/home/PromoSection.tsx`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`

## 5. Footer/Newsletter Classification

Files:

- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`

Classification:

- Group 9 paused footer/newsletter visual work.
- Visual/layout/component changes, not security/API/SEO/DB work.
- Must not be included in technical commits.

Observed from targeted diffs:

- `Footer.tsx` removes the client directive and payment gateway dependency.
- `Footer.tsx` introduces footer-local contact, social, legal, newsletter, and payment-logo rendering structure.
- `Footer.tsx` uses direct payment logo paths for bKash, Nagad, Visa, and Mastercard.
- `Footer.tsx` changes footer spacing, brand treatment, social links, legal links, and payment-logo layout.
- `NewsletterForm.tsx` changes the exported form from `HomepageNewsletterForm` to `NewsletterForm`.
- `NewsletterForm.tsx` adds a `source` prop defaulting to `footer`.
- `NewsletterForm.tsx` changes input/button copy, sizing, spacing, and focus classes.

Decision:

- Do not stage now.
- Keep paused unless a dedicated footer/newsletter visual review is approved.
- A later explicit revert prompt may restore the pre-footer-experiment state if the user wants to abandon this visual work.

## 6. Payment-Logo Classification

Files:

- `public/assets/payments/bkash.svg`
- `public/assets/payments/mastercard.svg`
- `public/assets/payments/nagad.svg`
- `public/assets/payments/visa.svg`

Classification:

- Group 9 paused payment-logo asset work.
- Visual asset changes, not payment backend/payment enablement work.
- Must not be included in technical commits.

Observed from stats:

- `bkash.svg`: 1 insertion, 1 deletion.
- `mastercard.svg`: 1 insertion, 5 deletions.
- `nagad.svg`: 1 insertion, 1 deletion.
- `visa.svg`: 1 insertion, 1 deletion.

Context from prior footer reports:

- These assets were involved in footer payment-logo visibility and containment work.
- The footer work intentionally excluded COD and did not enable payment gateways.
- Earlier reports warned that payment-logo visual balance needs human review.

Decision:

- Do not stage now.
- Keep paused unless a dedicated payment-logo normalization/review step is approved.
- If retained later, review brand correctness, contrast, intrinsic canvas sizing, footer rendering, and whether showing these logos could imply unavailable payment methods.

## 7. Category-Image Classification

Files:

- `public/assets/categories/baby-kids.jpg`
- `public/assets/categories/beauty-health.jpg`
- `public/assets/categories/books-stationery.jpg`
- `public/assets/categories/electronics.jpg`
- `public/assets/categories/fashion.jpg`
- `public/assets/categories/sports-fitness.jpg`

Classification:

- Group 10 paused category image/visual asset work.
- Binary image asset changes, not catalog/query/category-count logic.
- Must not be included in technical commits.

Observed from stats:

- `baby-kids.jpg`: deleted from tracked state.
- `beauty-health.jpg`: binary replacement, 243138 bytes to 296842 bytes.
- `books-stationery.jpg`: binary replacement, 38796 bytes to 324069 bytes.
- `electronics.jpg`: binary replacement, 84710 bytes to 277495 bytes.
- `fashion.jpg`: binary replacement, 88204 bytes to 384111 bytes.
- `sports-fitness.jpg`: binary replacement, 82169 bytes to 265190 bytes.

Decision:

- Do not stage now.
- Keep paused unless a dedicated category-image visual/licensing/weight review is approved.
- A future review should check ownership/licensing, compression/weight, responsive fit, visual quality, mobile loading impact, and whether `baby-kids.jpg` should really be deleted or restored.

## 8. PromoSection Classification

File:

- `src/frontend/components/home/PromoSection.tsx`

Classification:

- Homepage promo/newsletter visual work.
- Related to the paused footer/newsletter flow, not catalog/product-count logic.
- Must not be included in technical commits.

Observed from targeted diff:

- Removes `Mail` import.
- Removes `HomepageNewsletterForm` import.
- Removes exported `NewsletterSection`.
- The removed `NewsletterSection` was a standalone homepage newsletter block with gradient panel, newsletter copy, form, and no-spam helper text.

Decision:

- Do not stage now.
- Keep paused with footer/newsletter visual work unless a dedicated homepage newsletter/footer cleanup prompt approves it.
- A future visual review should decide whether the standalone homepage newsletter should remain removed, move to the footer, or be restored.

## 9. Whether Anything Remaining Is Technical/Security/SEO/DB-Related

No.

The remaining tracked dirty files are visual/component/asset changes only:

- footer/newsletter layout
- payment logo assets and footer display support
- category image assets
- homepage promo/newsletter section removal

They are not:

- database changes
- Prisma schema or migration changes
- security/API/auth changes
- SEO/robots/sitemap changes
- payment backend enablement
- tracking integration
- seller marketplace implementation
- product lifecycle logic

## 10. Recommended Options, Without Executing Them

### Option A: Keep Paused and Move to Local DB Setup

Use this when the user wants to avoid visual work for now and return to technical blockers.

Suggested next prompt:

```text
Proceed to local DB readiness work. Keep all paused visual/assets files untouched and unstaged. Do not modify footer, newsletter, payment logos, category images, or PromoSection. Focus only on setting up/verifying local PostgreSQL and shadow DB readiness without migrations.
```

### Option B: Dedicated Footer Cleanup Prompt

Use this only if the user wants to revive the footer work.

Suggested next prompt:

```text
Create a dedicated footer/newsletter visual review for src/frontend/components/layout/Footer.tsx, src/frontend/components/layout/NewsletterForm.tsx, and src/frontend/components/home/PromoSection.tsx. Do not touch payment-logo SVGs or category images unless explicitly required. Verify mobile/tablet/desktop in browser before any commit.
```

### Option C: Dedicated Category Image Review Prompt

Use this if the user wants to decide the category images separately.

Suggested next prompt:

```text
Create a dedicated category image asset review for public/assets/categories/*.jpg. Do not edit or regenerate images yet. Check file sizes, missing/deleted assets, visual fit, licensing assumptions, responsive impact, and whether baby-kids.jpg should be restored or intentionally removed.
```

### Option D: Dedicated Payment-Logo Normalization Prompt

Use this if the user wants to solve only the payment-logo asset row.

Suggested next prompt:

```text
Create a dedicated payment-logo normalization review for public/assets/payments/bkash.svg, nagad.svg, visa.svg, and mastercard.svg. Do not enable payment backends. Check brand correctness, contrast, intrinsic canvas size, footer rendering, and customer-facing implication before deciding whether to commit or revert.
```

### Option E: Revert Paused Visual Work After Explicit Approval

Use this only if the user clearly wants to abandon the visual experiments.

Suggested next prompt:

```text
After explicit approval, revert only the paused visual/assets work: footer/newsletter files, PromoSection newsletter removal, payment-logo SVG changes, and category image changes. Do not revert committed technical/security/SEO/docs work. Verify the exact revert file list before running any restore command.
```

## 11. Exact Files That Must Stay Excluded From Broad Commits

Keep these excluded unless a dedicated visual/assets step explicitly approves them:

```text
public/assets/categories/baby-kids.jpg
public/assets/categories/beauty-health.jpg
public/assets/categories/books-stationery.jpg
public/assets/categories/electronics.jpg
public/assets/categories/fashion.jpg
public/assets/categories/sports-fitness.jpg
public/assets/payments/bkash.svg
public/assets/payments/mastercard.svg
public/assets/payments/nagad.svg
public/assets/payments/visa.svg
src/frontend/components/home/PromoSection.tsx
src/frontend/components/layout/Footer.tsx
src/frontend/components/layout/NewsletterForm.tsx
```

Broad staging remains dangerous because these files are still dirty and visually sensitive.

## 12. Confirmation No Files Were Staged/Committed/Reverted/Deleted

Confirmed.

Step 69 did not run:

- `git add`
- `git commit`
- `git reset`
- `git checkout`
- `git restore`
- `git clean`
- file delete, rename, or move commands

No files were staged. No commit was created. No existing file was reverted or deleted.

## 13. Confirmation No Runtime Behavior Was Changed

Confirmed.

Step 69 only created this audit report. It did not change runtime code, assets, configuration, dependencies, API behavior, auth behavior, SEO behavior, payment behavior, tracking behavior, seller behavior, database behavior, or product lifecycle behavior.

## 14. Confirmation No Prohibited Files Were Touched

Confirmed.

Step 69 did not edit:

- footer files
- newsletter files
- payment-logo assets
- category image assets
- `PromoSection.tsx`
- `.env`
- `.env.local`
- Prisma schema
- migrations
- DB scripts
- source/API/security/SEO/catalog files
- payment backend
- tracking API
- seller marketplace
- product lifecycle code

Step 69 did not run Docker, SQL, database connection commands, Prisma migrations, seed, reset, db push, deployment, image conversion tools, or image generation tools.

## 15. Validation Results

Commands run:

```text
npm run db:url:safety
npm run typecheck
npm run lint
npm test
npm run build
```

Results:

- `npm run db:url:safety`: passed as a non-mutating safety check. No database connection was attempted. `DATABASE_URL` remains remote-looking, `SHADOW_DATABASE_URL` is missing, and local migration readiness remains `no`.
- `npm run typecheck`: passed.
- `npm run lint`: passed with no ESLint warnings or errors. Next.js emitted the known `next lint` deprecation notice.
- `npm test`: passed with 168 tests across 30 suites.
- `npm run build`: passed. Next.js production build completed successfully and generated 76 static pages.

## 16. Remaining Risks

- The remaining dirty files are visual/assets-only, but broad staging could still accidentally include them.
- Footer/newsletter changes are substantial and need a dedicated human visual review before any commit.
- Payment-logo assets may affect brand correctness, contrast, perceived payment availability, and footer rendering.
- Category images have larger binary sizes, and `baby-kids.jpg` is deleted; both need explicit review before commit or revert.
- Local DB readiness remains `no`, blocking DB-backed authenticated testing and product lifecycle migration.
- Git line-ending warnings appeared for TSX files during diff commands; this can create noisy diffs when Git touches those files.

## 17. Recommended Next Step

Safest next step:

- Keep the paused visual/assets work untouched and move back to local DB setup readiness.

If the user wants to resolve the dirty worktree first:

- choose one dedicated visual/assets path: footer/newsletter review, category image review, payment-logo review, or explicit revert of paused visual work.

Do not use broad staging commands while these files remain dirty.
