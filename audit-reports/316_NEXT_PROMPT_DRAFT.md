# Step 316 Next Prompt Draft

Continue after Step 316 in the Boilabin project.

Step 316 kept the intentional new Toys & Collectibles category image and updated the active category media version hash to match:

```txt
public/assets/categories/toys-collectibles.jpg
src/shared/category-media.ts
```

The Toys & Collectibles image now hashes to:

```txt
18811d8fecf3
```

and the focused category media tests pass.

## Recommended Step 317

Run a narrow dirty-worktree decision pass for only the remaining user-owned media changes:

```txt
public/assets/icons/ui/categories/*.svg
public/uploads/admin/banners/hero/
```

First inspect and classify each item as intentional, accidental, or orphaned. Do not stage or commit anything until the classification is clear.

## Hard Guardrails

Do not touch:

* Step 314 admin banner upload implementation.
* Step 315 restored source banner asset.
* The Step 316 Toys & Collectibles JPG/version pair.
* navbar/dropdown/header.
* Help page.
* homepage hero UI.
* footer.
* `/category` page UI unless the user explicitly asks for the category SVG validation to include visual checks.
* product image/media repair work.
* payment backend/API.
* tracking API.
* seller marketplace.
* env files.
* packages.
* Prisma schema/migrations.
* DB rows.

Do not run seed, reset, db push, destructive SQL, or migrations.

## Validation

Use `/plan` first.

Run focused validation only for whatever files Step 317 intentionally handles. If the category SVGs are kept, run the relevant icon/category UI tests. If upload/orphan files are handled, run the relevant admin media/upload tests.

Do not execute this draft until the user approves Step 317.
