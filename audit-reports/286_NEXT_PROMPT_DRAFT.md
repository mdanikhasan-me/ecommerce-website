# Step 286 Next Prompt Draft

## Recommended Next Step

Recommended next step: Step 286 UI/UX redesign transition inventory and design-system readiness planning.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce recovery workflow.

Latest completed step:

* Step 285: `audit-reports/285_ULTIMATE_ADMIN_MEDIA_UPLOAD_DELETE_PROOF.md`
* Step 285 added a guarded local admin media upload/delete QA harness.
* Product, banner, and category helper/API-level upload/replace/delete proof passed with temporary local records only.
* Temp files were created under `/uploads/products/`, `/uploads/admin/banners/`, and `/uploads/admin/categories/`, then cleaned.
* Static UI remote asset count is `0`.
* Missing local source asset warnings are `0`.
* The unused missing Stripe payment asset declaration was removed without enabling Stripe or payment behavior.
* Full browser admin media QA remains deferred until a private local admin session is available.
* Remote product/catalog media remains a backlog item, but it does not block UI/UX redesign preparation.

Goal for Step 286:
Create a UI/UX redesign transition inventory and design-system readiness plan before making broad visual changes.

This is planning/inventory first.
Do not redesign the site yet.
Do not rewrite page layouts broadly.
Do not change runtime behavior.

Read first:

* `audit-reports/285_ULTIMATE_ADMIN_MEDIA_UPLOAD_DELETE_PROOF.md`
* `audit-reports/285-ultimate-admin-media-upload-delete-proof/admin-media-upload-delete-evidence.json`
* `audit-reports/285-ultimate-admin-media-upload-delete-proof/local-asset-dependency-postcheck.json`
* `docs/MEDIA_UPLOAD_POLICY.md`
* `src/app/(store)/page.tsx`
* `src/frontend/components/home/*`
* `src/frontend/components/layout/Header.tsx`
* `src/frontend/components/layout/Footer.tsx`
* `src/frontend/components/layout/NewsletterForm.tsx`
* `src/frontend/components/ui/*`
* `tailwind.config.*`
* `src/app/globals.css`

Tasks:

1. Map current storefront UI surfaces:

* homepage sections
* header/navigation/search
* footer/newsletter
* category listing
* product cards/grid
* product detail page
* cart/checkout shell
* auth pages
* account pages
* admin shell only if relevant to design-system consistency

2. Identify existing design tokens and reusable primitives:

* colors
* spacing
* typography
* breakpoints
* buttons/inputs/cards
* icons
* image aspect ratios
* loading/error/empty states

3. Identify visual debt and redesign constraints:

* overcrowded sections
* inconsistent component spacing
* mobile breakpoints
* accessibility risks
* image sizing/cropping risks
* payment/footer/newsletter areas that need dedicated approval
* catalog media backlog that should not be confused with UI redesign

4. Recommend a staged UI/UX redesign plan:

* design-system baseline first
* storefront home polish
* category/search/product listing polish
* product detail polish
* cart/checkout polish
* footer/newsletter/payment-logo work only in a dedicated approved visual step

5. Define guardrails for implementation steps:

* no DB/schema/migrations
* no payment/tracking/seller implementation
* no new remote static UI assets
* no broad API response changes
* no product lifecycle behavior changes
* preserve mobile-app compatibility and API stability
* preserve Step 285 upload storage/deletion decisions

6. Validation:

Run:

* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Create:

* `audit-reports/286_UI_UX_REDESIGN_TRANSITION_INVENTORY.md`
* `audit-reports/287_NEXT_PROMPT_DRAFT.md`

The Step 286 report must include:

1. Scope and latest completed step
2. Files inspected
3. Storefront surface inventory
4. Design-system/token inventory
5. Component reuse inventory
6. Visual debt findings
7. Accessibility/mobile risks
8. Media/local-asset constraints from Step 285
9. Footer/newsletter/payment-logo constraints
10. Catalog media backlog boundaries
11. Proposed staged redesign sequence
12. Files safe to edit in the first implementation step
13. Files/actions still prohibited
14. Validation results
15. Remaining risks
16. Recommended next step

Commit only if report-only validation passes.

Final response format:

1. Summary of Step 286 work
2. Files changed
3. UI surface inventory result
4. Design-system readiness result
5. Main visual debt/risk findings
6. Proposed staged redesign sequence
7. Validation results
8. Confirmation no prohibited files/actions were touched
9. Remaining risks
10. Recommended next step
```
