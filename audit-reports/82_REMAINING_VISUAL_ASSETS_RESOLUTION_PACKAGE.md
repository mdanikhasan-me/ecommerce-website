# Step 82: Remaining Visual/Assets Resolution Package

## 1. Scope of Step 82

Step 82 created one larger audit/planning-only package for the remaining dirty visual/assets work.

This step did not edit, stage, commit, revert, delete, rename, optimize, regenerate, normalize, or replace any paused visual/assets files. It also did not touch DB, Prisma, API, auth, security, SEO, catalog, mobile, payment backend, tracking, seller, or product lifecycle code.

Goal:

- classify the remaining dirty visual/assets files
- summarize the current diffs safely
- identify visual and technical risks by group
- provide clear next-action options without repeated small retry prompts

## 2. Files changed by Step 82

Created:

- `audit-reports/82_REMAINING_VISUAL_ASSETS_RESOLUTION_PACKAGE.md`

No existing files were edited.

## 3. Current git status summary

Initial `git status --short` showed only paused visual/assets tracked changes:

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

Initial `git diff --cached --name-only` was empty.

After this report is created, this Step 82 report is the only Step 82-created file and remains untracked unless a later explicit docs commit step stages it.

## 4. Remaining dirty file inventory

Dirty visual/assets files:

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

Diff stat:

```text
13 files changed, 185 insertions(+), 122 deletions(-)
```

## 5. Footer/newsletter diff summary

Files:

- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`

Observed summary:

- `Footer.tsx` removes the `use client` directive.
- `Footer.tsx` removes footer dependency on `PAYMENT_GATEWAYS`.
- `Footer.tsx` adds a footer-local contact list, social link renderer, legal link list, newsletter section, and payment-logo renderer.
- `Footer.tsx` renders bKash, Nagad, Visa, and Mastercard directly from `/assets/payments/...`.
- `Footer.tsx` excludes COD from the footer.
- `Footer.tsx` changes footer layout, spacing, logo treatment, social layout, payment logo containment, and bottom legal links.
- `NewsletterForm.tsx` renames the export from `HomepageNewsletterForm` to `NewsletterForm`.
- `NewsletterForm.tsx` adds an optional `source` prop defaulting to `footer`.
- `NewsletterForm.tsx` changes the posted source from hardcoded `homepage` to the prop value.
- `NewsletterForm.tsx` changes copy and styling for a compact footer form.

Classification:

- Visual/component work.
- Not security, DB, API, SEO, payment backend, seller, tracking, lifecycle, or mobile implementation work.
- Requires dedicated browser/manual visual QA before commit.

## 6. PromoSection diff summary

File:

- `src/frontend/components/home/PromoSection.tsx`

Observed summary:

- Removes the `Mail` import.
- Removes the `HomepageNewsletterForm` import.
- Removes the exported `NewsletterSection`.
- The removed `NewsletterSection` was a standalone homepage newsletter panel with gradient background, newsletter copy, form, and helper text.

Classification:

- Homepage newsletter/visual layout change.
- Closely tied to footer/newsletter decisions.
- Should be reviewed with footer/newsletter rather than staged with technical work.

## 7. Payment-logo diff summary

Files:

- `public/assets/payments/bkash.svg`
- `public/assets/payments/mastercard.svg`
- `public/assets/payments/nagad.svg`
- `public/assets/payments/visa.svg`

Observed summary:

- All four SVGs were replaced or substantially normalized into large `width="1200" height="800"` canvas assets.
- `bkash.svg` changes from a compact symbol-only mark to a larger logo including wordmark/text paths.
- `nagad.svg` changes from a compact tall SVG to a large-canvas normalized SVG.
- `visa.svg` changes from a compact wide wordmark to a large-canvas SVG with gradient/clip-path content.
- `mastercard.svg` changes from a compact multi-line mark to a large-canvas one-line SVG.

Context from Steps 27-31:

- These files were involved in footer payment-logo visibility/containment experiments.
- COD remains intentionally excluded from the footer.
- No payment backend or checkout payment logic was enabled.

Classification:

- Visual asset work only.
- Needs brand correctness, visual balance, contrast, canvas-size, and customer-message review before commit.

## 8. Category-image status/size summary

JPG handling in this step used status/stat only.

Observed binary stat:

- `public/assets/categories/baby-kids.jpg`: deleted from tracked state, `74211 -> 0 bytes`.
- `public/assets/categories/beauty-health.jpg`: binary replacement, `243138 -> 296842 bytes`.
- `public/assets/categories/books-stationery.jpg`: binary replacement, `38796 -> 324069 bytes`.
- `public/assets/categories/electronics.jpg`: binary replacement, `84710 -> 277495 bytes`.
- `public/assets/categories/fashion.jpg`: binary replacement, `88204 -> 384111 bytes`.
- `public/assets/categories/sports-fitness.jpg`: binary replacement, `82169 -> 265190 bytes`.

Classification:

- Visual image asset work only.
- Needs licensing/source provenance, compression/weight, visual crop/fit, mobile loading impact, and deleted `baby-kids.jpg` decision review before commit.

## 9. Visual risk classification by group

### Footer/newsletter/PromoSection

Visual risk: high.

Reason:

- Footer layout and spacing are substantially changed.
- Homepage newsletter section is removed.
- Newsletter form presentation changes.
- Prior reports show several footer rebuild iterations and recommend human browser/device review.

### Payment-logo SVGs

Visual risk: medium-high.

Reason:

- Brand marks were replaced with large-canvas versions.
- Footer relies on containment/cropping behavior.
- bKash/Nagad/Visa/Mastercard have different intrinsic shapes.
- Logos may imply payment availability if not presented carefully.

### Category JPGs

Visual risk: high.

Reason:

- Multiple binary image replacements are much larger than the tracked versions.
- One tracked image is deleted.
- Visual quality, category fit, licensing, and low-end mobile impact are not verified.

## 10. Technical risk classification by group

### Footer/newsletter/PromoSection

Technical risk: medium.

Reason:

- Component exports change from `HomepageNewsletterForm` to `NewsletterForm`.
- Homepage newsletter export is removed from `PromoSection.tsx`.
- Typecheck/lint/tests pass, but runtime visual/UX behavior still needs browser verification.

### Payment-logo SVGs

Technical risk: low-medium.

Reason:

- SVG files are assets, not runtime logic.
- However, large intrinsic dimensions may affect rendering behavior, layout containment, and payload size.

### Category JPGs

Technical risk: medium.

Reason:

- Image weight increases can affect homepage/category performance.
- Deleted `baby-kids.jpg` can break any future/reference path if still expected by data or UI.
- No DB/mobile/security/SEO logic depends on committing these binary changes.

## 11. Whether any remaining dirty file is needed for DB/mobile/security/SEO work

No.

The remaining dirty files are not required for:

- local DB readiness
- product lifecycle migration
- DB-backed tests
- mobile app planning
- security/API/auth work
- technical SEO/canonical/robots/sitemap policy
- catalog visibility/category counts/search logic
- payment backend enablement
- tracking or seller marketplace work

They should remain excluded from technical commits.

## 12. Recommended option A: keep paused

Recommended when the user wants to keep moving on technical blockers without making a visual decision.

Action:

- Leave all visual/assets files dirty and unstaged.
- Avoid broad staging.
- Continue only with non-visual or external local DB setup work.

Pros:

- No risk of committing unapproved visual changes.
- Preserves the current worktree for later manual review.

Cons:

- Worktree remains dirty.
- Broad staging remains dangerous.

## 13. Recommended option B: future explicit revert

Recommended if the user wants a clean worktree and does not want to keep the visual experiments.

Action:

- Run a later dedicated revert step with exact file list only.
- Revert only the paused visual/assets files.
- Do not revert committed technical/security/SEO/docs work.

Pros:

- Cleans the worktree.
- Removes broad-staging risk.

Cons:

- Discards the visual experiments unless saved elsewhere.
- Must be explicit and exact to avoid reverting unrelated committed work.

## 14. Recommended option C: footer/newsletter visual QA

Recommended if the user wants to evaluate the footer/newsletter work before deciding.

Scope:

- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `src/frontend/components/home/PromoSection.tsx`

Required checks:

- browser screenshots on mobile/tablet/desktop
- footer height and overflow
- newsletter form usability
- Contact/Privacy/Terms presence
- no misleading payment readiness text
- no COD footer logo
- homepage newsletter removal decision

## 15. Recommended option D: payment-logo visual QA

Recommended if the user wants to evaluate payment logos separately.

Scope:

- `public/assets/payments/bkash.svg`
- `public/assets/payments/mastercard.svg`
- `public/assets/payments/nagad.svg`
- `public/assets/payments/visa.svg`

Required checks:

- brand correctness
- official/logo usage confidence
- contrast on dark footer
- intrinsic canvas and rendered containment
- payload size
- customer-facing implication while online payment remains disabled

## 16. Recommended option E: category-image visual/licensing/weight QA

Recommended if the user wants to evaluate category images separately.

Scope:

- `public/assets/categories/baby-kids.jpg`
- `public/assets/categories/beauty-health.jpg`
- `public/assets/categories/books-stationery.jpg`
- `public/assets/categories/electronics.jpg`
- `public/assets/categories/fashion.jpg`
- `public/assets/categories/sports-fitness.jpg`

Required checks:

- ownership/licensing/source provenance
- image quality and category fit
- mobile crop behavior
- file weight and compression
- whether deleted `baby-kids.jpg` should be restored or intentionally removed

## 17. Recommended option F: future split visual commits after screenshots

Recommended only after manual screenshot approval.

Commit grouping should be separate:

- footer/newsletter component commit
- payment-logo asset commit
- category-image asset commit

Do not combine these with:

- DB work
- security work
- API work
- SEO work
- mobile planning
- payment backend/tracking/seller work

## 18. Exact files that must remain excluded from broad staging

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

## 19. Confirmation no files were staged/committed/reverted/deleted

Confirmed.

Step 82 did not run:

- `git add`
- `git commit`
- `git restore`
- `git checkout`
- `git reset`
- `git clean`
- file delete commands
- file rename commands

No files were staged or committed. No existing file was reverted or deleted.

## 20. Confirmation no runtime behavior was changed

Confirmed.

This step created an audit report only. It did not change runtime code, frontend behavior, API behavior, auth behavior, DB behavior, SEO behavior, payment behavior, tracking behavior, seller behavior, lifecycle behavior, or mobile app behavior.

## 21. Confirmation no prohibited technical files were touched

Confirmed.

Step 82 did not edit:

- `.env`
- `.env.local`
- Prisma schema or migrations
- package scripts
- Docker files
- source/API/security/auth/SEO/catalog/mobile code
- payment backend
- tracking API
- seller marketplace
- product lifecycle code
- paused visual/assets files themselves

Step 82 did not run Docker, SQL, DB connection commands, Prisma migrations, seed, reset, db push, deployment, image optimization, SVG normalization, or image generation.

## 22. Validation/build results

Commands run:

```powershell
npm run db:url:safety
npm run db:prisma:local:validate
npm run db:prisma:local:generate
npm run typecheck
npm run lint
npm test
npm run build
```

Results:

- `npm run db:url:safety`: passed; no database connection attempted; app and shadow URLs classify local and separate.
- `npm run db:prisma:local:validate`: passed through the local Prisma env guardrail.
- `npm run db:prisma:local:generate`: passed through the local Prisma env guardrail.
- `npm run typecheck`: passed.
- `npm run lint`: passed with the existing Next.js `next lint` deprecation notice.
- `npm test`: passed, 173 tests across 30 suites.
- `npm run build`: failed only because local PostgreSQL is unreachable at `localhost:5432` during DB-backed static generation.

Build classification:

- Next.js compiled successfully.
- Build-time lint/type checks completed.
- Static generation attempted DB-backed Prisma reads.
- Prisma could not reach local PostgreSQL at `localhost:5432`.
- This matches the known external local DB service blocker from Step 81.
- No new non-DB build failure was identified.

## 23. Remaining risks

- Worktree remains dirty with visual/assets changes.
- Broad staging remains dangerous.
- Footer/newsletter changes are substantial and still need real browser/manual QA before commit.
- Payment-logo changes may affect brand correctness, contrast, payload size, and customer expectations.
- Category image changes include larger binary files and one deletion; licensing, weight, and visual fit are not verified.
- Local DB service readiness remains blocked outside Codex until Docker Desktop or local PostgreSQL is available.
- Production build remains blocked by the missing local PostgreSQL service.

## 24. Recommended next step

Choose one path:

- Keep all visual/assets changes paused and do no Codex work until Docker/PostgreSQL is installed.
- Or run a dedicated visual decision step from one of the prompt names below.

Ready-to-use future prompt names only:

- Step 83A: explicit revert paused visual/assets work
- Step 83B: footer/newsletter visual QA
- Step 83C: payment-logo QA
- Step 83D: category-image QA
- Step 83E: return to DB work after Docker/PostgreSQL installation

Safest default: keep paused visual/assets work untouched until the user explicitly chooses one of the Step 83 options.
