# Step 322 Next Prompt Draft

Continue after Step 321 in the Boilabin project.

Step 321 is decision-pending. It did not touch, stage, restore, delete, move, rename, or rewrite the dirty category SVG files or the untracked admin hero upload.

Before changing anything, read:

```text
audit-reports/321_MEDIA_APPROVAL_DECISION_PENDING.md
audit-reports/321-media-approval-decision-pending/baseline-git-status.txt
audit-reports/321-media-approval-decision-pending/category-svg-diff-stat.txt
audit-reports/321-media-approval-decision-pending/upload-hero-inventory-summary.txt
git status --short
```

Required owner decision before edits:

```text
For public/assets/icons/ui/categories/*.svg:
- keep all eight dirty SVG edits, or
- restore all eight SVG edits, or
- name the exact subset to keep/restore.

For public/uploads/admin/banners/hero/:
- keep the one .webp as managed upload media, or
- remove it as orphan media, or
- promote it to source assets.
```

Guardrails:

- Do not stage, restore, delete, move, rename, or rewrite category SVG files without explicit owner approval.
- Do not stage, delete, move, rename, print the raw filename, or promote the upload without explicit owner approval.
- Do not touch Step 314 admin banner upload implementation, Step 315 restored banner source asset, Step 316 Toys & Collectibles JPG/version pair, Step 319 admin cleanup code, product image/media repair logic, payment/tracking/seller code, env files, package files, Prisma schema/migrations, or DB rows.
- Do not run seed, reset, db push, destructive SQL, migrations, provider CLIs, or package updates.
- Use exact-file staging only.

Validation after approval:

```text
git status --short
npx tsx --test tests/local-icon-assets.test.ts tests/navbar-categories-dropdown-redesign.test.ts tests/category-page-uiux.test.ts
npm run typecheck
npm run lint
npm test
npm run build
```

If category SVGs are kept, also collect browser screenshots for:

```text
/
/category
```

Commit:

Use a message that matches the approved action, for example:

```text
fix: accept approved category icon media
```

or:

```text
fix: restore category icon media
```

Final response:

Give only:

1. Summary of the owner-approved media decision
2. Files changed/staged/committed
3. Validation results
4. Browser evidence result, if screenshots were required
5. Commit hash/oneline, or reason no commit happened
6. Confirmation no prohibited files/actions occurred
7. Remaining risks
8. Recommended next step
