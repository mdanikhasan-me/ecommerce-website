# Step 285 Next Prompt Draft

## Recommended Next Step

Run guarded local admin media upload/replace/delete browser QA with temporary records only. This is the remaining proof gap from Step 284 before moving into the UI/UX redesign transition plan.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce Codex recovery workflow.

Latest completed step:

* Step 284: `audit-reports/284_LOCAL_ASSET_DEPENDENCY_AND_UPLOAD_DELETE_PROOF.md`
* Step 284 added a read-only local asset dependency scanner, static dependency tests, temp-fixture upload cleanup proof, aggregate evidence, and media policy documentation.
* Static UI media dependencies now classify as local, bundled, inline, or provider config; remote static UI asset count is 0.
* Product uploads currently save under `/uploads/products`.
* Banner/category admin uploads currently save under `/uploads/admin/banners` and `/uploads/admin/categories`.
* Product images not appearing under `public/assets/products` is expected because `public/assets` is source-controlled and runtime/admin uploads belong under `public/uploads`.
* Physical deletion is proven at helper level with temp fixtures only.
* Full admin browser upload/replace/delete QA was not run in Step 284.

Step 285 title:
Guarded local admin media upload-delete browser QA

Goal:
Prove the actual admin browser/API path can upload, replace, and delete temporary product/banner/category media without touching real owner media, and confirm physical cleanup behavior stays reference-safe.

This step may use the local DB only if all local safety and fixture readiness checks pass.

Read first:

* `audit-reports/284_LOCAL_ASSET_DEPENDENCY_AND_UPLOAD_DELETE_PROOF.md`
* `audit-reports/284-local-asset-dependency-and-upload-delete-proof/local-asset-dependency-evidence.json`
* `audit-reports/284-local-asset-dependency-and-upload-delete-proof/upload-cleanup-proof-summary.json`
* `audit-reports/284-local-asset-dependency-and-upload-delete-proof/db-aware-orphan-audit-summary.json`
* `src/backend/admin/admin-utils.ts`
* `src/backend/admin/product-editor.ts`
* `src/backend/admin/media-lifecycle.ts`
* `src/backend/admin/media-reference-guard.ts`
* `src/frontend/components/admin/AdminImageField.tsx`
* `src/frontend/components/admin/ProductEditorForm.tsx`
* `src/frontend/components/admin/BannerEditorForm.tsx`
* `src/frontend/components/admin/CategoryEditorForm.tsx`
* admin product/banner/category API routes
* existing local auth fixture readiness scripts/tests
* `scripts/audit-admin-media-orphans.mjs`
* `scripts/local-browser-runtime-check.mjs`

Preflight stop gates:

1. Confirm worktree status and no staged files.
2. Confirm `npm run db:url:safety` passes with local and separate app/shadow DB URLs.
3. Confirm `npm run db:prisma:local:validate` and `npm run db:prisma:local:generate` pass.
4. Confirm local DB service is reachable.
5. Confirm approved local admin fixture readiness without printing credentials or secrets.
6. Confirm a temp-record cleanup plan exists before creating records.
7. If any gate fails, stop and create only the Step 285 audit report with exact missing readiness items.

Allowed work:

* Create temporary product/banner/category records only if local DB and local admin fixture readiness are proven.
* Upload tiny generated test image data URLs through admin browser/API paths.
* Replace those temporary images once.
* Delete/archive the temporary records through the app-approved path.
* Verify new files land under the expected managed roots.
* Verify old replaced temp files are removed only when reference-safe.
* Verify current referenced temp files are preserved until the owning temp record is deleted/archived.
* Verify orphan audit remains aggregate-only.
* Add or update a script/test only if needed to make this repeatable and guarded.
* Create the Step 285 audit report and next prompt draft.

Strict guardrails:

* Do not use real owner/customer/product media.
* Do not delete existing non-temp upload files.
* Do not print credentials, secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, private connection strings, private upload filenames, matched candidate URLs, or private uploaded contents.
* Do not run Prisma migrations, `prisma db push`, seed, reset, destructive SQL, or provider CLI.
* Do not edit Prisma schema or migrations.
* Do not change API response shapes, auth behavior, checkout behavior, payment, tracking, seller, CSP enforcement, rate-limit, mobile, product lifecycle, SEO architecture, or visual design.
* Do not restore Flash Deals.
* Do not change footer payment-logo set or social URLs.
* Do not download third-party assets.
* Do not modify source-controlled category/product/banner images.
* Do not use broad staging.

Validation:

* `git status --short`
* `git log -3 --oneline`
* `git diff --cached --name-only`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `npm run db:prisma:local:validate`
* `npm run db:prisma:local:generate`
* guarded local admin/auth fixture readiness command
* guarded admin media browser/API QA command if added
* `node scripts/audit-admin-media-orphans.mjs`
* `node scripts/audit-admin-media-orphans.mjs --db-aware-readonly-local`
* `node scripts/audit-local-asset-dependencies.mjs --evidence`
* targeted admin media tests
* targeted local asset dependency tests
* `node scripts/audit-ai-marketing-copy.mjs`
* `node scripts/audit-search-verification-readiness.mjs`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Required report:

Create:

* `audit-reports/285_GUARDED_ADMIN_MEDIA_UPLOAD_DELETE_BROWSER_QA.md`

The report must include:

1. Scope and starting state.
2. Preflight readiness results.
3. Whether admin fixture readiness was available.
4. Temporary record plan.
5. Product upload/replace/delete browser/API result.
6. Banner upload/replace/delete browser/API result.
7. Category upload/replace/delete browser/API result.
8. Physical cleanup evidence.
9. Preserved referenced/historical/shared media evidence.
10. Orphan audit result.
11. Confirmation no real owner media was touched.
12. Files changed.
13. Validation results.
14. Remaining risks.
15. Recommended next step.

Create:

* `audit-reports/286_NEXT_PROMPT_DRAFT.md`

If Step 285 passes, Step 286 should prepare the UI/UX redesign transition checklist and route/component inventory.

Commit message if implementation/tests/report are added:

* `test: verify guarded admin media upload cleanup flow`

Final response format:

1. Summary of Step 285 work.
2. Whether admin browser/API QA ran or stopped at readiness.
3. Files changed/staged/committed.
4. Product/banner/category upload-delete result.
5. Physical cleanup result.
6. Orphan audit result.
7. Validation results.
8. Commit hash/oneline, or reason no commit happened.
9. Confirmation no prohibited files/actions occurred.
10. Remaining risks.
11. Recommended next step.
```
