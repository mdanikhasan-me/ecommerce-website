# Step 308 Next Prompt Draft

Recommended next step: run a bounded desktop category dropdown polish and screenshot QA pass.

Copy/paste prompt for the next Codex turn:

```text
You are in P:\Projects\E-commers\boilabin-marketplace.

Run Step 309: Desktop category dropdown polish.

Use /plan first. Before editing, read:
- audit-reports/308_NAVBAR_BANNER_FOOTER_POLISH.md
- audit-reports/308-navbar-banner-footer-polish/browser-polish-evidence.json
- src/frontend/components/layout/Header.tsx
- tests/help-navbar-redesign.test.ts
- tests/navbar-banner-footer-polish.test.ts

Scope:
- Polish only the desktop Categories dropdown in the global storefront header.
- Verify hover, focus, Escape close behavior, click-outside close behavior, and route-safe category/subcategory links.
- Keep the Step 308 mobile navbar layout unchanged unless a direct desktop-dropdown regression requires a tiny shared fix.
- Use existing LocalIcon and existing local category icon assets only.
- Do not add new routes. Do not add /deals, collections, flash sales, or payments routes.
- Do not redesign the Help page.
- Do not touch footer copy/payment logos/newsletter unless a test proves the dropdown change directly broke shared layout.
- Do not edit, stage, revert, or regenerate category SVG files under public/assets/icons/ui/categories.
- Do not touch banner data, banner seed data, product image lifecycle, local catalog image replacement, admin media cleanup, payment provider, tracking, seller, Prisma schema, migrations, seed/reset/db push, destructive SQL, packages, or env files.

Implementation expectations:
- Keep desktop nav visually consistent with the Step 307/308 black-white header.
- Make dropdown width, spacing, hover/focus states, and text wrapping stable at 1366, 1536, and 1920 desktop widths.
- Preserve keyboard accessibility: Escape closes dropdown and focus returns to the Categories trigger.
- Preserve pointer behavior: hover opens, mouse leave closes, click outside closes.
- Preserve route safety: link only to existing category and subcategory URL patterns already used by the app.
- Add or update focused source tests for dropdown accessibility, local icons, route safety, and no fake routes.

Validation required:
- npm run db:url:safety
- npm run db:prisma:local:validate
- npm run db:prisma:local:generate
- npm run typecheck
- npm run lint
- npm test
- npm run build

Browser QA required:
- Use the in-app Browser if available; otherwise document the fallback and use local Edge/CDP.
- Run local production screenshot QA at:
  - homepage desktop 1920x1080 with dropdown closed
  - homepage desktop 1536x864 with dropdown open
  - homepage desktop 1366x768 with dropdown open
  - help desktop 1366x768 with dropdown open
- Verify no horizontal overflow, no console/runtime/hydration errors, no failed local icon/branding/payment assets, and no overlap between dropdown and header controls.

Deliverables:
- audit-reports/309_DESKTOP_CATEGORY_DROPDOWN_POLISH.md
- audit-reports/309_NEXT_PROMPT_DRAFT.md
- screenshot/evidence JSON under audit-reports/309-desktop-category-dropdown-polish/
- exact-file staging only
- commit message: fix: polish desktop category dropdown

Final response must include:
1. Summary of dropdown polish.
2. Exact files changed.
3. Route/local icon verification.
4. Screenshot QA summary.
5. Validation results.
6. Prisma generate status.
7. Commit hash.
8. Remaining risks/blockers.
```
