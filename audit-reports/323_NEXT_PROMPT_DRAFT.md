# Step 324 Next Prompt Draft

Continue after Step 323 in the Boilabin project.

Step 323 skipped the blocked media decision and cleaned up Advisor state summary formatting so long validation sections end cleanly with `...` instead of being cut mid-token.

Before changing anything, read:

```text
audit-reports/323_ADVISOR_SUMMARY_TRUNCATION_CLEANUP.md
audit-reports/322_CURRENT_GIT_COMMIT_STATE_HELPER.md
audit-reports/321_MEDIA_APPROVAL_DECISION_PENDING.md
git status --short
node scripts/boilabin-advisor-state.mjs
node scripts/boilabin-terminal-loop-state.mjs
```

Still blocked without explicit owner approval:

```text
public/assets/icons/ui/categories/*.svg
public/uploads/admin/banners/hero/
```

If the user says only `next` again, do not touch media. Continue only with an explicitly non-media, bounded prelaunch closure task.

Guardrails:

- Do not stage, restore, delete, move, rename, or rewrite category SVG files without explicit owner approval.
- Do not stage, delete, move, rename, print the raw filename, or promote the upload without explicit owner approval.
- Do not touch media assets, upload folders, env files, package files, Prisma schema/migrations, DB rows, payment/tracking/seller code, or storefront visual assets.
- Do not run seed, reset, db push, destructive SQL, migrations, provider CLIs, or package updates.
- Use exact-file staging only.

If approving media, use Step 321's required decision options.

If skipping media, choose one narrow non-media task, add focused tests if code changes, create a Step 324 report/evidence folder, validate, and stage exact files only.

Suggested validation for another helper/docs/test task:

```text
git diff --check -- <changed files>
npx tsx --test <focused tests>
node scripts/boilabin-advisor-state.mjs
node scripts/boilabin-terminal-loop-state.mjs
npm run typecheck
```

Final response:

Give only:

1. Summary of the Step 324 decision/work
2. Files changed/staged/committed
3. Validation results
4. Commit hash/oneline, or reason no commit happened
5. Confirmation no prohibited files/actions occurred
6. Remaining risks
7. Recommended next step
