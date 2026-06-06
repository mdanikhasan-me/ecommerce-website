# Step 311 Prompt Draft

Continue after Step 310 in the Boilabin project.

This is Step 311: single wrong-owner product image DB repair.

Use `/plan` first.

Goal:
Repair only the local DB `ProductImage.url` for `iphone-15-pro-128gb` that still points to the banner source asset `/assets/banners/home-hero-iphone-15-pro.jpg`.

Target replacement:
- From: `/assets/banners/home-hero-iphone-15-pro.jpg`
- To: `/assets/products/catalog/electronics/mobile-phones/iphone-15-pro-128gb/main.jpg`

Read first:
- `audit-reports/310_TRACKED_SOURCE_MEDIA_RESTORE.md`
- `audit-reports/310-media-restore-evidence/media-file-inventory.json`
- `audit-reports/310-media-restore-evidence/media-reference-inventory.json`
- `audit-reports/309-media-source-of-truth/broken-orphan-media-analysis.md`
- `scripts/audit-public-media-source-of-truth.mjs`

Strict guardrails:
- Do not change media files.
- Do not delete upload/orphan files.
- Do not move files.
- Do not edit category SVG files.
- Do not run seed/reset/db push/destructive SQL.
- Do not edit Prisma schema/migrations.
- Do not change upload destinations.
- Do not touch product image lifecycle/admin cleanup source files unless a read-only test needs inspection.
- Do not redesign navbar, Help page, footer, homepage, category page, product cards, or product listing UI.
- Do not touch payment, tracking, seller, env, packages, `/deals`, flash sales, or collections.
- Do not add remote images or hotlink product images.

Allowed actions:
- Run `npm run db:url:safety` before DB read/write.
- Create a small local-only plan/evidence script if needed.
- Query the local DB to verify exactly one active product/image row matches the wrong-owner path.
- Update only that one `ProductImage.url` row after writing pre-mutation evidence.
- Re-run the media audit script after repair.
- Add a focused test proving the wrong-owner path is not present in DB repair evidence/source plan.
- Create Step 311 audit report and next prompt draft.

Validation:
- `git status --short`
- `npm run db:url:safety`
- `npm run db:prisma:local:validate`
- `npm run db:prisma:local:generate`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

Staging:
Stage only Step 311 script/test/audit/evidence files. Do not stage category SVG edits, media files, upload files, DB files, env/package files, or unrelated dirty files.

Commit message:
`fix: repair wrong-owner product image reference`

Final response:
1. DB repair summary.
2. Exact row/path changed.
3. Media files untouched confirmation.
4. Category SVG untouched confirmation.
5. Validation results.
6. Commit hash if committed.
7. Recommended next step.
