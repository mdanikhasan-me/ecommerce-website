# Step 321 Next Prompt Draft

Continue after Step 320 in the Boilabin project.

Step 320 was report-only. It documented the remaining dirty media approval gate and did not touch or stage the active category SVG edits or the untracked admin hero upload directory.

Before changing anything, read:

```text
audit-reports/320_REMAINING_DIRTY_MEDIA_APPROVAL_GATE.md
audit-reports/320-remaining-dirty-media-approval-gate/baseline-git-status.txt
audit-reports/320-remaining-dirty-media-approval-gate/category-svg-diff-stat.txt
audit-reports/320-remaining-dirty-media-approval-gate/upload-hero-inventory-summary.txt
git status --short
```

Recommended next task:

Run a dedicated media approval decision step for the remaining dirty media:

1. Ask/confirm whether to keep or restore the eight dirty `public/assets/icons/ui/categories/*.svg` category icon edits.
2. Ask/confirm whether the single untracked `public/uploads/admin/banners/hero/` `.webp` file should remain managed upload media, be removed as orphaned upload media, or be promoted to source assets.
3. After owner decision, validate only the approved path with focused local-icon/media tests and browser screenshots for header/category surfaces.

Guardrails:

- Do not stage, restore, delete, move, rename, or rewrite the category SVG files unless the user explicitly approves that choice.
- Do not stage, delete, move, rename, or print the raw filename for `public/uploads/admin/banners/hero/` unless the user explicitly approves that upload handling.
- Do not touch Step 314 admin banner upload implementation, Step 315 restored banner source asset, Step 316 Toys & Collectibles JPG/version pair, Step 319 admin cleanup code, product image/media repair logic, payment/tracking/seller code, env files, package files, Prisma schema/migrations, or DB rows.
- Do not run seed, reset, db push, destructive SQL, migrations, provider CLIs, or package updates.
- Use exact-file staging only.

Suggested validation after a concrete media decision:

```text
git status --short
npx tsx --test tests/local-icon-assets.test.ts tests/navbar-categories-dropdown-redesign.test.ts tests/category-page-uiux.test.ts
npm run typecheck
npm run lint
npm test
npm run build
```

Commit:

Use a commit message that matches the approved path, for example:

```text
fix: accept approved category icon media
```

or, if no media is approved:

```text
docs: document remaining media decision
```

Stop conditions:

- Stop if the user has not approved whether to keep/restore category SVG edits.
- Stop if the upload directory ownership cannot be determined.
- Stop if browser evidence shows broken category icons, missing header/category visuals, console errors, server errors, horizontal overflow, or failed requests.

Final response:

Give only:

1. Summary of the media decision
2. Files changed/staged/committed
3. Validation results
4. Browser evidence result, if screenshots were required
5. Commit hash/oneline, or reason no commit happened
6. Confirmation no prohibited files/actions occurred
7. Remaining risks
8. Recommended next step
