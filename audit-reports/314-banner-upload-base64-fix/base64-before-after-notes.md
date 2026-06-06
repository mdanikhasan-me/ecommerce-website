# Step 314 Banner Upload Base64 Notes

## Before

- `AdminImageField` used `FileReader.readAsDataURL()` for selected files.
- `BannerEditorForm` stored that returned `data:image/...;base64,...` string directly in `form.imageUrl` or `form.mobileImageUrl`.
- The visible image URL input therefore showed the full base64 payload.
- Banner save posted the same base64 string inside JSON to `/api/admin/banners`.
- `parseAdminBannerPayload()` validated `imageUrl` and `mobileImageUrl` as strings with `.max(500_000)`, so normal uploaded images could fail before the existing managed upload helper had a chance to persist them.

## After

- Banner desktop/mobile file selection calls `/api/admin/banners/upload` with `multipart/form-data`.
- The upload route persists the file through the existing optimized admin upload pipeline.
- The form receives and stores a short managed public path such as:

```txt
/uploads/admin/banners/<banner-owner>/desktop-<timestamp>-<random>.webp
/uploads/admin/banners/<banner-owner>/mobile-<timestamp>-<random>.webp
```

- The visible URL/path input shows that short `/uploads/admin/banners/...` path.
- Banner create/update JSON receives the short path, not `data:image/...`.
- If a `data:image/...` value is pasted or somehow remains in state, the UI blocks submit and the backend parser rejects it with the banner-specific base64 error.

## Browser QA Note

No authenticated admin browser session was supplied in this Codex run, and creating/saving a banner would mutate the local database. Per the Step 314 instructions, browser/manual QA was replaced with route/helper tests and source-level wiring checks.
