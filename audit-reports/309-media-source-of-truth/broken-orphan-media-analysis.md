# Step 309 Broken And Orphan Media Analysis

## Scope
This analysis uses:
- `audit-reports/309-media-source-of-truth/media-file-inventory.json`
- `audit-reports/309-media-source-of-truth/media-reference-inventory.json`

No files were deleted, moved, restored, copied, or rewritten. No DB rows were mutated.

## Summary

File inventory:
- 119 public media entries under `public/assets/**` and `public/uploads/**`.
- 92 entries currently exist.
- 27 tracked source/catalog/banner entries are currently deleted in the worktree.
- 11 existing managed upload media files were found.
- 24 QA/temp-looking upload directories were found; they currently contain 0 media files in the file inventory.

Reference inventory:
- 39 read-only DB media references.
- 14 active DB local references point to missing files.
- 11 DB remote references remain:
  - 9 active brand placeholder logos on `https://placehold.co/...`.
  - 2 historical order item evidence images on `https://images.unsplash.com/...`.
- 23 seed product/banner local image references point to currently deleted source files.
- 4 existing managed upload files appear unreferenced by DB/source scan.

## Missing Files

### Active DB Product Image References

Severity: high. These are active product image rows and will render broken images until repaired.

| Owner | Broken Path | Recommended Fix |
| --- | --- | --- |
| `iphone-15-pro-128gb` | `/assets/banners/home-hero-iphone-15-pro.jpg` | Wrong-owner reference. Restore source assets first, then update this DB row to `/assets/products/catalog/electronics/mobile-phones/iphone-15-pro-128gb/main.jpg` or an approved `/uploads/products/**` copy in a DB-approved step. |
| `apple-airpods-pro-2nd-gen` | `/assets/products/catalog/electronics/audio/apple-airpods-pro-2nd-gen/main.avif` | Restore source asset from git or run an approved source-to-managed-upload reconciliation after restoring the source file. |
| `apple-watch-series-9-41mm` | `/assets/products/catalog/electronics/wearables/apple-watch-series-9-41mm/main.avif` | Restore source asset from git or run an approved source-to-managed-upload reconciliation after restoring the source file. |
| `dell-xps-15-9520-i7-oled` | `/assets/products/catalog/electronics/laptops/dell-xps-15-9520-i7-oled/main.avif` | Restore source asset from git or run an approved source-to-managed-upload reconciliation after restoring the source file. |
| `nike-air-max-270-running-shoes` | `/assets/products/catalog/sports-fitness/general/nike-air-max-270-running-shoes/main.avif` | Restore source asset from git or run an approved source-to-managed-upload reconciliation after restoring the source file. |
| `samsung-55-neo-qled-qn90c` | `/assets/products/catalog/home-appliances/general/samsung-55-neo-qled-qn90c/main.avif` | Restore source asset from git or run an approved source-to-managed-upload reconciliation after restoring the source file. |
| `samsung-galaxy-watch-6-classic-44mm` | `/assets/products/catalog/electronics/wearables/samsung-galaxy-watch-6-classic-44mm/main.avif` | Restore source asset from git or run an approved source-to-managed-upload reconciliation after restoring the source file. |
| `sony-alpha-a7-iv-mirrorless-body` | `/assets/products/catalog/electronics/general/sony-alpha-a7-iv-mirrorless-body/main.avif` | Restore source asset from git or run an approved source-to-managed-upload reconciliation after restoring the source file. |
| `sony-playstation-5-slim` | `/assets/products/catalog/gaming/general/sony-playstation-5-slim/main.avif` | Restore source asset from git or run an approved source-to-managed-upload reconciliation after restoring the source file. |
| `sony-wh-1000xm5` | `/assets/products/catalog/electronics/audio/sony-wh-1000xm5/main.avif` | Restore source asset from git or run an approved source-to-managed-upload reconciliation after restoring the source file. |
| `xiaomi-buds-4-pro` | `/assets/products/catalog/electronics/audio/xiaomi-buds-4-pro/main.avif` | Restore source asset from git or run an approved source-to-managed-upload reconciliation after restoring the source file. |
| `xiaomi-mi-smart-band-8` | `/assets/products/catalog/electronics/wearables/xiaomi-mi-smart-band-8/main.avif` | Restore source asset from git or run an approved source-to-managed-upload reconciliation after restoring the source file. |
| `xiaomi-pad-6-128gb-wifi` | `/assets/products/catalog/electronics/general/xiaomi-pad-6-128gb-wifi/main.avif` | Restore source asset from git or run an approved source-to-managed-upload reconciliation after restoring the source file. |

### Active DB Banner Reference

Severity: high. The homepage reads this active hero row from DB.

| Owner | Broken Path | Recommended Fix |
| --- | --- | --- |
| `Galaxy S24 Ultra` active hero banner | `/assets/banners/home-hero-galaxy-s24-ultra.jpg` | Restore source banner from git or update the DB row to an existing approved `/uploads/admin/banners/**` image in a DB-approved step. |

### Seed Source References

Severity: high for future local seed/reset readiness, but no seed/reset was run.

Current `prisma/seed.ts` references 21 product catalog images and 2 banner source images that are currently deleted in the worktree:
- `/assets/products/catalog/electronics/mobile-phones/iphone-15-pro-128gb/main.jpg`
- `/assets/products/catalog/electronics/mobile-phones/samsung-galaxy-s24-ultra-256gb/main.jpg`
- `/assets/products/catalog/electronics/audio/xiaomi-buds-4-pro/main.avif`
- `/assets/products/catalog/electronics/audio/sony-wh-1000xm5/main.avif`
- `/assets/products/catalog/electronics/laptops/dell-xps-15-9520-i7-oled/main.avif`
- `/assets/products/catalog/electronics/laptops/hp-spectre-x360-14/main.avif`
- `/assets/products/catalog/electronics/wearables/apple-watch-series-9-41mm/main.avif`
- `/assets/products/catalog/electronics/wearables/samsung-galaxy-watch-6-classic-44mm/main.avif`
- `/assets/products/catalog/electronics/general/anker-737-power-bank-24000mah/main.webp`
- `/assets/products/catalog/gaming/general/sony-playstation-5-slim/main.avif`
- `/assets/products/catalog/electronics/general/xiaomi-pad-6-128gb-wifi/main.avif`
- `/assets/products/catalog/sports-fitness/general/nike-air-max-270-running-shoes/main.avif`
- `/assets/products/catalog/electronics/audio/bose-quietcomfort-45-headphones/main.avif`
- `/assets/products/catalog/home-appliances/general/samsung-55-neo-qled-qn90c/main.avif`
- `/assets/products/catalog/electronics/general/sony-alpha-a7-iv-mirrorless-body/main.avif`
- `/assets/products/catalog/electronics/wearables/xiaomi-mi-smart-band-8/main.avif`
- `/assets/products/catalog/electronics/general/anker-511-nano-pro-65w-charger/main.jpg`
- `/assets/products/catalog/electronics/audio/apple-airpods-pro-2nd-gen/main.avif`
- `/assets/products/catalog/electronics/laptops/dell-ultrasharp-27-4k-usb-c-u2723de/main.jpg`
- `/assets/products/catalog/electronics/general/samsung-galaxy-tab-s9-128gb/main.jpg`
- `/assets/products/catalog/electronics/mobile-phones/xiaomi-redmi-note-13-pro-256gb/main.webp`
- `/assets/banners/home-hero-iphone-15-pro.jpg`
- `/assets/banners/home-hero-galaxy-s24-ultra.jpg`

Recommended fix: restore these tracked source assets before any seed/reset or source-to-upload reconciliation step. Do not rewrite seed or run seed/reset in Step 309.

## Orphan Files

These existing managed upload files were not referenced by the DB/source scan:

| Path | Git Status | Recommendation |
| --- | --- | --- |
| `/uploads/products/samsung-galaxy-tab-s9-128gb-mnyvmwup-3e5876b0.jpg` | tracked | Candidate only. Do not delete until an approved cleanup step confirms no DB/source/historical references and handles tracked-file removal intentionally. |
| `/uploads/products/samsung-galaxy-tab-s9-128gb-mnyvmwur-d1ec829a.jpg` | tracked | Candidate only. Do not delete until an approved cleanup step confirms no DB/source/historical references and handles tracked-file removal intentionally. |
| `/uploads/products/samsung-galaxy-tab-s9-128gb-mnyvmwus-7bd162dd.jpg` | tracked | Candidate only. Do not delete until an approved cleanup step confirms no DB/source/historical references and handles tracked-file removal intentionally. |
| `/uploads/products/sony-playstation-5-dualsense-wireless-controller-monster-hunter-wilds-limited-edition-mnzwh3r1-3aeefbd8.webp` | tracked | Candidate only. Do not delete until an approved cleanup step confirms no DB/source/historical references and handles tracked-file removal intentionally. |

No untracked managed upload media files were found.

## QA/Temp Directories

The audit found 24 QA/temp-looking directories under `public/uploads/**`, all with `mediaFileCount: 0`:
- `/uploads/admin/banners/qa-media-step285-*`
- `/uploads/admin/categories/qa-media-step285-*`
- `/uploads/products/qa-category/qa-subcategory/qa-media-step285-*`

Recommendation: likely empty QA leftovers, but do not remove in Step 309. A future cleanup step can remove empty directories only after exact-path approval.

## Wrong-Owner References

| Reference | Risk | Recommended Migration/Repair |
| --- | --- | --- |
| Product `iphone-15-pro-128gb` -> `/assets/banners/home-hero-iphone-15-pro.jpg` | Product image points at a banner source asset. Admin product cleanup will correctly refuse to delete it, but storefront product media ownership is wrong and the file is now missing. | Restore source assets first; then update the product image row to the product catalog source path or an approved managed upload path. |
| 12 active product rows -> `/assets/products/catalog/**` | This is valid only for source/catalog-seeded products while source files exist. It is not valid for admin-upload ownership or admin deletion. Current deletions make the rows broken. | Restore source assets first. If policy shifts product DB rows to managed uploads, use the existing dry-run reconciliation script in an approved DB/file mutation step. |
| Active hero row -> `/assets/banners/home-hero-galaxy-s24-ultra.jpg` | Valid source banner reference only while the tracked source file exists. Current deletion makes homepage hero broken. | Restore source banner or update DB to an approved existing managed banner upload. |
| Subcategory managed folder `/assets/categories/subcategories/**` | Approved exception under `/assets`, but `admin-utils.ts` likely resolves delete paths through `/uploads/admin/`, so physical cleanup may silently skip subcategory files. | Fix `deleteManagedAdminUpload` path resolution for the classification managed prefix in a dedicated source-code step. |

## Remote References

### DB Remote References

Active brand placeholders:
- `https://placehold.co/120x60/f5f5f5/333?text=Apple`
- `https://placehold.co/120x60/f5f5f5/333?text=Samsung`
- `https://placehold.co/120x60/f5f5f5/333?text=Sony`
- `https://placehold.co/120x60/f5f5f5/333?text=Xiaomi`
- `https://placehold.co/120x60/f5f5f5/333?text=Dell`
- `https://placehold.co/120x60/f5f5f5/333?text=HP`
- `https://placehold.co/120x60/f5f5f5/333?text=Bose`
- `https://placehold.co/120x60/f5f5f5/333?text=Nike`
- `https://placehold.co/120x60/f5f5f5/333?text=Anker`

Historical order evidence:
- `https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400`
- `https://images.unsplash.com/photo-1609428614116-c91f3c1eac77?w=800&auto=format`

Recommended action:
- Brand placeholders should move to local brand/source assets in a future brand-media step.
- Historical order item image URLs should be treated as historical evidence; do not rewrite or delete without a dedicated order evidence policy.

### Seed Remote References

`prisma/seed.ts` still has:
- Brand placeholder logos on `placehold.co`.
- One seed hero/sample remote Unsplash row.
- One sample order image remote Unsplash row.

Recommended action: future seed-media cleanup can replace brand/seed remote images with local assets. Do not run seed/reset or rewrite seed in Step 309.

## User-Deleted Asset Safety Verdict

The currently deleted source/catalog/banner files are not safe to treat as orphaned runtime media.

Reasons:
- They are tracked source assets, not admin-managed uploads.
- Current DB rows still reference 14 of them.
- `prisma/seed.ts` still references 23 deleted product/banner source paths.
- Admin cleanup helpers correctly protect `/assets/**` from physical deletion.

Recommended immediate posture:
- Do not stage these deletions.
- Do not assume they are safe to remove.
- Restore them from git in an approved Step 310 restore-only pass, or approve a broader DB/file reconciliation plan that first restores source assets and then moves selected product/banner DB rows to managed upload paths.
