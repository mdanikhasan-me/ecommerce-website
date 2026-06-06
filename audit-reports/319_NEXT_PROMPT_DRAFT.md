# Step 320 Next Prompt Draft

Continue after Step 319 in the Boilabin project.

Step 319 fixed the admin subcategory cleanup prefix issue:

- `deleteManagedAdminUpload()` now resolves physical paths using the classifier-managed prefix, so `/assets/categories/subcategories/**` can be cleaned only after the existing reference guard approves it.
- Focused tests cover subcategory path resolution and reference-safe temp fixture deletion.
- Category SVG edits and `public/uploads/admin/banners/hero/` were kept untouched.

Before changing anything, read:

```txt
audit-reports/319_ADMIN_SUBCATEGORY_CLEANUP_PREFIX.md
audit-reports/319-admin-subcategory-cleanup-prefix/focused-tests.txt
git status --short
```

Guardrails:

- Do not touch category SVG edits under `public/assets/icons/ui/categories/*.svg` unless explicitly approved.
- Do not touch `public/uploads/admin/banners/hero/` unless explicitly approved.
- Do not run seed, reset, db push, destructive SQL, migrations, provider CLIs, or package updates.
- Do not change env files, Prisma schema/migrations, payment/tracking/seller code, storefront visuals, or DB rows.

Recommended next task:

Run the next narrow prelaunch closure pass from the audit queue. Start read-only, classify before editing, keep one writer, add focused tests only for real fixes, run validation, and stage exact files only.
