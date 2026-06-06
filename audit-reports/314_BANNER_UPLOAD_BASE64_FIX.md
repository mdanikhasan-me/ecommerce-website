# Step 314: Banner Upload Base64 Fix

## Summary

Step 314 fixes the admin banner image upload flow so selected desktop and mobile banner files are persisted as managed uploads before banner save. The banner form and API now work with short public paths under `/uploads/admin/banners/...` instead of carrying large `data:image/...` strings through visible form fields, JSON payloads, validation, and database writes.

## Root Cause

The bug was caused by the admin form using `FileReader.readAsDataURL()` through `AdminImageField`, then storing the returned base64 string directly in `BannerEditorForm` state. The preview and final image URL used the same field, so the visible URL input showed the huge base64 value and `handleSubmit()` sent it as JSON to `/api/admin/banners`.

The banner API already had `persistAdminUpload()` calls for `imageUrl` and `mobileImageUrl`, but `parseAdminBannerPayload()` validated those fields with a `500_000` character string cap before persistence. Normal uploaded files could therefore fail with `String must contain at most 500000 character(s)` before the existing managed-upload helper could write the image to disk.

## Admin UI Changes

- `AdminImageField` now supports optional `uploadImage`, `rejectDataUrls`, and `dataUrlErrorMessage` props.
- Existing category image behavior is preserved because the new upload/reject behavior is opt-in.
- `BannerEditorForm` opts into managed upload for both desktop and mobile images.
- Selecting a banner file calls `/api/admin/banners/upload` with `multipart/form-data`.
- The returned short URL is stored in `form.imageUrl` or `form.mobileImageUrl`.
- The visible URL/path input shows `/uploads/admin/banners/...`, not base64.
- Remove still clears the image field.
- Submit is blocked if either banner image field still contains `data:image/...`.

## API And Backend Changes

- Added `src/app/api/admin/banners/upload/route.ts`.
- The route uses the existing admin session guard and mutation-origin guard.
- The route reads `multipart/form-data`, validates the `desktop` or `mobile` slot, and requires a file-like upload entry.
- Added `persistAdminBannerImageFile()` to convert the uploaded file into the existing safe image-processing pipeline.
- The helper uses existing upload safeguards for MIME/type validation, size limits, decoded image validation, optimization, webp output, path planning, and sanitized path segments.
- Added `banner-image-policy.ts` for shared banner image slot and data-url policy helpers.
- `parseAdminBannerPayload()` now explicitly rejects `data:image/...` values before save with a banner-specific base64 error.

## Desktop And Mobile Path Behavior

Desktop banner uploads now persist to:

```txt
/uploads/admin/banners/<banner-owner>/desktop-<timestamp>-<random>.webp
```

Mobile banner uploads now persist to:

```txt
/uploads/admin/banners/<banner-owner>/mobile-<timestamp>-<random>.webp
```

The physical files are written under:

```txt
public/uploads/admin/banners/<banner-owner>/
```

If a mobile image is empty, the existing storefront behavior remains unchanged: `HeroBanner` uses `mobileImageUrl || desktopImageUrl`.

Traversal-like owner/media values are sanitized by the existing managed banner path planner to safe fallback path segments inside `/uploads/admin/banners/`.

## Base64 Rejection

Base64/data URLs are prevented in three places:

- Banner upload selection stores the server-returned short managed path instead of the file reader data URL.
- The banner image URL input rejects pasted `data:image/...` values when the banner form opts into `rejectDataUrls`.
- `parseAdminBannerPayload()` rejects `data:image/...` for both `imageUrl` and `mobileImageUrl`, so direct API payloads cannot save base64 strings.

## Cleanup Behavior

The existing banner create/update/delete cleanup paths remain in place:

- Create/update APIs receive short managed paths and write those paths to the DB.
- Create failure cleanup still calls `cleanupManagedAdminUploads([imageUrl, mobileImageUrl])`.
- Update failure cleanup still removes newly submitted managed upload paths when they differ from the existing banner image paths.
- Successful replacement still calls `deleteReplacedAdminUploads()` for previous banner image paths.
- Delete still calls `cleanupManagedAdminUploads()` for the banner image fields.
- Cleanup remains reference-guarded and classifier-driven.
- `/assets/banners/**`, remote URLs, data URLs, unknown paths, traversal paths, query strings, fragments, and broad directories are protected from admin cleanup.

One remaining orphan risk is intentional and documented: if an admin uploads a banner file and then abandons the form without saving, the immediate upload has no DB row yet and can remain as an unreferenced managed upload for a later orphan-review cleanup step.

## Browser And Manual QA

No authenticated admin browser session was supplied in this Codex run, and creating or editing a banner would mutate the local database. Per the Step 314 instructions, browser/manual QA was replaced with route/helper tests and source-level wiring checks.

Evidence files:

- `audit-reports/314-banner-upload-base64-fix/base64-before-after-notes.md`
- `audit-reports/314-banner-upload-base64-fix/helper-qa-evidence.json`

## Tests Added Or Updated

- `tests/admin-banner-upload-base64-fix.test.ts`
  - Verifies desktop and mobile helper uploads produce short managed `/uploads/admin/banners/...` paths.
  - Verifies temporary helper-upload files exist before cleanup and the test folder is removed after cleanup.
  - Verifies parser rejection of `data:image/...` payloads.
  - Verifies source banner assets are cleanup-protected while managed banner uploads are cleanup-eligible.
  - Verifies traversal-like path inputs stay inside the approved managed root.
  - Verifies source banner paths remain accepted and `HeroBanner` still renders managed upload paths.
  - Verifies the banner form is wired to the managed upload route and data-url rejection.
- `tests/banner-validation.test.ts`
  - Adds explicit desktop/mobile base64 rejection coverage.
- `tests/media-path-taxonomy.test.ts`
  - Adds mobile banner upload path coverage alongside existing desktop coverage.

## Validation Results

| Command | Result |
| --- | --- |
| `git status --short` | Reviewed. Step 314 files plus pre-existing unrelated deleted source banner and category SVG edits are present. |
| `npm run db:url:safety` | Passed. |
| `npm run db:prisma:local:validate` | Passed. |
| `npm run db:prisma:local:generate` | Failed with Windows `EPERM` while renaming `node_modules/.prisma/client/query_engine-windows.dll.node.tmp30268` to `query_engine-windows.dll.node`. |
| `npm run typecheck` | Passed after fixing the upload route type guard. |
| `npm run lint` | Passed. Next lint deprecation warning only. |
| `npx tsx --test tests/admin-banner-upload-base64-fix.test.ts tests/banner-validation.test.ts tests/media-path-taxonomy.test.ts` | Passed: 16 tests. |
| `npm test` | Failed 4 unrelated existing media/readiness tests because `public/assets/banners/home-hero-iphone-15-pro.jpg` is deleted in the working tree. Step 314 focused tests passed within the full run. |
| `npm run build` | Passed. Build route list includes `/api/admin/banners/upload`. |

## Prisma Generate Status

`npm run db:prisma:local:generate` is blocked by a Windows file-lock `EPERM`.

Likely locking processes observed:

- PID `29140`: `next start -p 3108`, listening on port `3108`.
- PID `27048`: Next `start-server.js`, listening on port `3000`.
- Additional related Node processes: PID `28032` (`npm run start -- -p 3108`), PID `5808` (`npm run dev`), PID `11464` (`next dev`).

No processes were killed.

## Guardrail Confirmation

This step did not intentionally edit navbar/dropdown/header files, Help page, homepage hero UI, footer, `/category`, category SVG icons, product media repair code, payment, tracking, seller marketplace, Prisma schema/migrations, packages, or env files. It did not run seed/reset/db push/destructive SQL. It did not write admin uploads under `public/assets/banners/**` and did not delete `public/assets/banners/**`.

Pre-existing unrelated dirty files remain unstaged:

- `public/assets/banners/home-hero-iphone-15-pro.jpg` deleted.
- Category SVG icon edits under `public/assets/icons/ui/categories/*.svg`.

## Exact Files Changed

- `src/frontend/components/admin/AdminImageField.tsx`
- `src/frontend/components/admin/BannerEditorForm.tsx`
- `src/backend/admin/banner-editor.ts`
- `src/backend/admin/banner-image-policy.ts`
- `src/backend/admin/banner-image-upload.ts`
- `src/app/api/admin/banners/upload/route.ts`
- `tests/admin-banner-upload-base64-fix.test.ts`
- `tests/banner-validation.test.ts`
- `tests/media-path-taxonomy.test.ts`
- `audit-reports/314-banner-upload-base64-fix/base64-before-after-notes.md`
- `audit-reports/314-banner-upload-base64-fix/helper-qa-evidence.json`
- `audit-reports/314_BANNER_UPLOAD_BASE64_FIX.md`
- `audit-reports/314_NEXT_PROMPT_DRAFT.md`

## Commit

The final commit hash is reported in the assistant final response after `git commit`, because this report is part of the same commit.

## Remaining Risks

- Real browser/admin DB mutation QA was not run because no authenticated admin session was supplied.
- Upload-and-abandon can leave an unreferenced managed banner file until a later orphan cleanup review.
- `npm test` remains blocked by the pre-existing deleted source banner asset.
- `npm run db:prisma:local:generate` remains blocked by a Windows Prisma engine file lock from running local Next/Node processes.
