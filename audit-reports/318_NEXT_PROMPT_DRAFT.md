# Step 319 Next Prompt Draft

Continue after Step 318 in the Boilabin project.

Step 318 cleaned up the browser-runtime smoke warning pass:

- Added Next image `localPatterns` for local source assets and managed uploads.
- Fixed the local browser smoke helper to pin smoke-only auth origin env vars to the active local port.
- Fixed the mobile search smoke helper to open the labeled mobile search control before checking input focus.
- Kept category SVG edits and `public/uploads/admin/banners/hero/` untouched.

Before changing anything, read:

```txt
audit-reports/318_BROWSER_RUNTIME_SMOKE_CLEANUP.md
audit-reports/318-browser-runtime-smoke-cleanup/after-runtime-check.json
audit-reports/318-browser-runtime-smoke-cleanup/after-runtime-output.txt
git status --short
```

Guardrails:

- Do not touch category SVG edits under `public/assets/icons/ui/categories/*.svg` unless explicitly approved.
- Do not touch `public/uploads/admin/banners/hero/` unless explicitly approved.
- Do not run seed, reset, db push, destructive SQL, migrations, provider CLIs, or package updates.
- Do not change env files, Prisma schema/migrations, payment/tracking/seller code, or DB rows.

Recommended next task:

Run the next narrow prelaunch closure pass from the current audit queue, preserving the Step 318 smoke cleanup. Start with read-only evidence, classify before editing, add focused tests only for real fixes, and stage exact files only.
