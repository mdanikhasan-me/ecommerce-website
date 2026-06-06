# Step 342 Next Prompt Draft

Continue after Step 341 in the Boilabin project.

Step 341 skipped the blocked media decision and added no-DB string utility coverage.

Before changing anything, read:

```text
audit-reports/341_STRING_UTILITY_COVERAGE.md
audit-reports/340_COMMERCE_UTILITY_COVERAGE.md
audit-reports/321_MEDIA_APPROVAL_DECISION_PENDING.md
git status --short
node scripts/boilabin-advisor-state.mjs
node scripts/boilabin-terminal-loop-state.mjs
```

Standing push instruction:

```text
After each completed commit, run: git push origin main
This repo is pinned to the GitHub account/remote: mdanikhasan-dev
Do not print or store GitHub credentials.
```

Still blocked without explicit owner approval:

```text
public/assets/icons/ui/categories/*.svg
public/uploads/admin/banners/hero/
```

If the user says only `next` again, do not touch media. Continue only with an explicitly non-media, bounded prelaunch closure task.

Guardrails:

- Do not stage, restore, delete, move, rename, or rewrite category SVG files without explicit owner approval.
- Do not stage, delete, move, rename, print the raw upload filename, or promote the upload without explicit owner approval.
- Do not touch media assets, upload folders, env files, package files, Prisma schema/migrations, DB rows, payment/tracking/seller code, storefront visual assets, or paused footer/newsletter/payment-logo/PromoSection visuals.
- Do not run seed, reset, db push, destructive SQL, migrations, provider CLIs, or package updates.
- Use exact-file staging only.
- Push only after validation passes and the step commit is created.

If approving media, use Step 321's required decision options.

If skipping media, choose one bounded non-media task, add focused tests if code changes, create a Step 342 report/evidence folder, validate, stage exact files only, commit, then push `origin main`.

Suggested validation for another no-DB test/docs task:

```text
git diff --check -- <changed files>
npx tsx --test <focused tests>
node scripts/boilabin-advisor-state.mjs
node scripts/boilabin-terminal-loop-state.mjs
npm run typecheck
npm run lint
npm test
```

Final response:

Give only:

1. Summary of the Step 342 decision/work
2. Files changed/staged/committed
3. Validation results
4. Commit hash/oneline and GitHub push result
5. Confirmation no prohibited files/actions occurred
6. Remaining risks
7. Recommended next step
