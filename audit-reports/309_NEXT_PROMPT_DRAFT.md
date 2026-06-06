# Step 310 Prompt Draft

Continue after Step 309 in the Boilabin project.

This is Step 310: tracked source media restore-only pass.

Use `/plan` first.

Goal:
Restore only the tracked source/catalog/banner files that Step 309 proved are still referenced by DB and/or seed, without changing DB rows or deleting upload files.

Read first:
- `audit-reports/309_MEDIA_SOURCE_OF_TRUTH_AND_UPLOAD_PIPELINE_AUDIT.md`
- `audit-reports/309-media-source-of-truth/media-file-inventory.json`
- `audit-reports/309-media-source-of-truth/media-reference-inventory.json`
- `audit-reports/309-media-source-of-truth/broken-orphan-media-analysis.md`
- `audit-reports/309-media-source-of-truth/admin-upload-destination-map.md`

Allowed actions:
- Restore tracked deleted files under:
  - `public/assets/products/catalog/**`
  - `public/assets/banners/**`
- Restore only files currently reported as tracked deleted source assets.
- Use exact-path git restore/checkout only after confirming the path list from Step 309.
- Re-run the Step 309 audit script after restore.
- Add/update Step 310 audit report and next prompt draft.
- Add focused tests only if needed for restore evidence.

Strict guardrails:
- Do not stage or edit category SVG files.
- Do not delete any files.
- Do not move files.
- Do not mutate DB rows.
- Do not run seed/reset/db push/destructive SQL.
- Do not edit Prisma schema/migrations.
- Do not change upload destinations.
- Do not touch product image lifecycle/admin cleanup source files.
- Do not redesign navbar, Help page, footer, homepage, category page, product cards, or product listing UI.
- Do not touch payment, tracking, seller, env, packages, `/deals`, flash sales, or collections.
- Do not restore remote Unsplash product images.

Validation:
- `git status --short`
- `node scripts/audit-public-media-source-of-truth.mjs --out-dir audit-reports/310-media-restore-evidence`
- `npm run db:url:safety`
- `npm run db:prisma:local:validate`
- `npm run db:prisma:local:generate`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

Staging:
Stage only:
- Restored tracked files under `public/assets/products/catalog/**` and `public/assets/banners/**`.
- Step 310 audit/evidence files.
- Any Step 310 focused tests if added.

Do not stage:
- Category SVG edits.
- Upload/orphan cleanup files.
- DB files.
- Source lifecycle files.
- UI redesign files.
- Env/package files.

Commit message:
`fix: restore referenced source media assets`

Final response:
1. Restored source asset summary.
2. Broken DB/seed reference status after restore.
3. Upload/orphan files untouched confirmation.
4. Category SVG untouched confirmation.
5. Exact files changed.
6. Validation results.
7. Commit hash if committed.
8. Recommended next step.
