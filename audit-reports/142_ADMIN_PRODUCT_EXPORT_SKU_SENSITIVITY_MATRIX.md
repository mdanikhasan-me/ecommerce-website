# Step 142 - Admin Product Export SKU Sensitivity Matrix

## Scope

Loop 4 of the approved self-driving admin export safety batch created a report-only SKU sensitivity decision matrix for admin product exports.

This step did not decide final SKU policy. It did not change source, tests, routes, runtime behavior, export URLs, CSV payloads, CSV field order, response headers, status codes, admin access behavior, SKU metadata, masking/redaction state, role separation state, audit logging behavior, storage, database behavior, provider config, deployment config, env files, Prisma files, package files, Docker files, assets, or visual files.

## Latest Commit Verified

Latest commit verified before this loop:

```text
b7a90a1 docs: review admin export redaction compatibility
```

## Initial Git Status

Initial `git status --short` was clean.

Initial staged files were none.

## Planning Lanes Used

Real read-only lanes were used:

- Explorer: verified SKU remains `unknown-needs-policy` in report metadata and recommended a report-only SKU matrix.
- Guardian: confirmed the exact two-file edit scope and warned against changing SKU metadata, CSV behavior, or runtime files.
- Validator: confirmed validation and failure classification for a report-only SKU matrix.
- Docs Auditor: confirmed Step 137 -> Step 141 consistency and supplied required report sections.
- Advisor: confirmed no human approval is needed for this report-only Step 142 inside the approved batch, but approval is required before any SKU policy decision or implementation.

All lanes were read-only. No lane edited files, staged files, ran export routes, queried a database, read private env files, ran migrations, ran Docker, deployed, updated packages, or connected to remote services.

## Chosen Task

Chosen task:

```text
Report-only admin product export SKU sensitivity matrix
```

Allowed files for this loop:

- `audit-reports/142_ADMIN_PRODUCT_EXPORT_SKU_SENSITIVITY_MATRIX.md`
- `audit-reports/142_NEXT_PROMPT_DRAFT.md`

## Files Reviewed

- `audit-reports/141_ADMIN_EXPORT_MASKING_REDACTION_COMPATIBILITY_REVIEW.md`
- `audit-reports/141_NEXT_PROMPT_DRAFT.md`
- `audit-reports/140_ADMIN_EXPORT_ROLE_PERMISSION_MATRIX.md`
- `audit-reports/137_ADMIN_EXPORT_CONTROL_GAP_REVIEW.md`
- `src/backend/admin/reports.ts`

## Current Product Export Baseline

Current product export behavior:

- Product CSV includes `sku`.
- Product CSV metadata currently marks `sku` as `unknown-needs-policy`.
- Product CSV is broadly admin-accessible under the current route guard.
- No product export-specific permission exists.
- No SKU masking or redaction exists.
- No export audit logging exists.
- No durable export storage or retention policy exists.

This report does not change that baseline.

## Current Product CSV Field Map

Current product CSV field order:

1. `name`
2. `sku`
3. `category`
4. `stockQuantity`
5. `soldCount`
6. `isActive`

Current sensitivity categories:

- `name`: non-sensitive operational catalog field.
- `sku`: unknown-needs-policy.
- `category`: non-sensitive operational catalog field.
- `stockQuantity`: business-sensitive.
- `soldCount`: business-sensitive.
- `isActive`: business-sensitive.

## SKU Policy Options

### Option A - Public Catalog Identifier

Treat SKU as a public or semi-public product identifier.

Potential fit:

- SKUs are printed or shown to customers.
- SKUs are used in public product pages, invoices, or support conversations.
- SKU format does not encode supplier, margin, warehouse, or internal sourcing data.

Tradeoff:

- Easier export compatibility.
- Less privacy/security friction.
- Still requires care if SKU values later encode internal business information.

### Option B - Internal Inventory Identifier

Treat SKU as internal business-sensitive inventory data.

Potential fit:

- SKU format encodes supplier, warehouse, purchase channel, margin class, procurement, or internal operations.
- SKUs are not intended for customers or external partners.
- Product exports are used for internal inventory and commercial analysis.

Tradeoff:

- Stronger data minimization.
- May require permission-gated or redacted exports.
- Can break admin workflows that depend on SKU for reconciliation.

### Option C - Mixed Or Contextual Identifier

Treat SKU sensitivity as dependent on product type, channel, seller, or future marketplace context.

Potential fit:

- Some SKUs are public while others are internal.
- Future seller marketplace introduces seller-owned identifiers.
- External integrations may map SKU differently from internal inventory records.

Tradeoff:

- Most flexible.
- Most complex to test and document.
- Risks inconsistent CSV output unless policy is explicit.

## SKU Sensitivity Decision Matrix

| Decision question | Public catalog option | Internal inventory option | Mixed/contextual option |
| --- | --- | --- | --- |
| Is SKU visible to buyers? | Yes or acceptable | No | Depends on product/channel |
| Does SKU encode supplier or procurement data? | No | Yes or possible | Depends on SKU family |
| Can catalog staff export SKU? | Usually yes | Only with explicit permission | Depends on role and product |
| Can support staff export SKU? | Possibly yes | Usually no | Depends on workflow |
| Can seller roles export SKU later? | Only for allowed seller-owned context | No by default | Needs seller policy |
| Should SKU be masked? | Usually no | Possibly yes | Depends on policy |
| Should SKU stay in current CSV? | Likely yes | Maybe permission-gated | Likely yes until versioned alternative |
| Compatibility risk of changing now | Medium | High | High |

## CSV Consumer Compatibility Risks

Changing SKU behavior can affect:

- inventory reconciliation;
- product matching across admin workflows;
- spreadsheet formulas;
- catalog imports/exports;
- supplier communication;
- order item analysis;
- product performance reports;
- future seller marketplace mappings;
- mobile/admin clients if they rely on SKU as a stable identifier.

Risk examples:

- Removing `sku` changes product CSV column count.
- Renaming `sku` changes header expectations.
- Masking `sku` can break matching and deduplication.
- Replacing SKU with a display identifier can break reconciliation.
- Making SKU permission-dependent can produce multiple CSV variants that need versioning or explicit naming.

## Policy Decisions Needed

Before changing SKU metadata or CSV behavior, Boilabin needs decisions for:

- whether current SKU values are public, internal, or mixed;
- whether SKU format encodes business-sensitive information;
- whether external partners or future sellers will see SKU;
- whether SKU should be permission-gated separately from product export access;
- whether full and redacted product exports should both exist;
- whether SKU masking should preserve uniqueness;
- whether SKU should be treated differently from future seller SKU fields;
- whether CSV consumers can tolerate a versioned change;
- whether SKU policy affects product APIs outside admin CSV exports.

## Behavior Preservation Checklist

Until an explicit implementation step is approved, preserve:

- `sku` field name;
- `sku` field position in product CSV;
- current `unknown-needs-policy` metadata;
- product CSV route behavior;
- CSV response headers;
- CSV field order;
- current admin access behavior;
- current masking/redaction state;
- current role separation state;
- current audit logging state;
- current storage state.

## No-DB Test Plan For Future Implementation

No-DB tests can be added before implementation for:

- snapshotting current product CSV field metadata;
- asserting `sku` remains `unknown-needs-policy` until policy approval;
- checking candidate permission mappings for product export;
- checking future masking helpers with fake SKU values only;
- verifying SKU policy docs do not contain real supplier or inventory identifiers;
- asserting no product CSV field order changes in static source tests.

These tests should not execute the export route, require admin credentials, query a database, generate real CSV rows, or read private env files.

## DB/Auth-Backed Tests Needed Later

After a dedicated approved DB/auth test step, add tests for:

- product export preserves SKU when current behavior is intentionally retained;
- SKU masking/redaction applies only under the approved policy;
- product export permission behavior matches the approved role matrix;
- SKU field order and headers remain stable or change only through a versioned contract;
- audit logging records only sanitized metadata and does not record SKU values unless policy permits.

These tests must use fake local/staging data only and must not print real product rows or raw CSV rows.

## Mobile And API Compatibility Considerations

Future mobile/admin clients should not assume SKU policy changes are web-only:

- if SKU is public, mobile admin tools may display it consistently;
- if SKU is internal, mobile admin tools need explicit permission checks;
- if SKU is mixed/contextual, mobile clients need a stable policy flag or versioned API;
- seller marketplace work may introduce seller SKU fields that must not be conflated with internal SKU;
- public product APIs should not inherit admin export SKU decisions without separate review.

## Prohibited Actions Not Performed

- Did not decide final SKU policy.
- Did not edit source, tests, scripts, runtime config, env files, Prisma files, package files, Docker files, assets, visual files, or frontend/admin behavior.
- Did not read private env files.
- Did not print secrets, full database URLs, tokens, cookies, credentials, auth headers, payment secrets, OAuth secrets, SMTP secrets, private connection strings, customer/order PII, CSV rows, or raw user data.
- Did not query a database or run export routes.
- Did not run DB-backed report route success-flow tests.
- Did not require authenticated admin credentials.
- Did not change export URLs, CSV payloads, field order, headers, response shapes, status codes, admin access behavior, SKU metadata, masking state, redaction state, role separation state, audit logging behavior, or storage behavior.
- Did not edit Prisma schema, migrations, package files, Docker files, env files, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle, provider/deployment files, footer, newsletter, payment-logo, PromoSection, category image, or visual/media files.
- Did not restore Flash Deals, `/deals`, or `/api/admin/flash-sales`.
- Did not run migrations, `prisma db push`, seed/reset, SQL, Docker, deployment, provider CLI, package updates, or remote-service commands.

## Validation Results

Validation was run after this report and the Step 142 prompt draft were created.

Results are recorded in the final response for this loop.

## Remaining Risks

- SKU sensitivity remains unresolved.
- Product CSV still includes SKU under broad admin access.
- Product export permissions are still not implemented.
- Product export masking/redaction is still not implemented.
- Export audit logging is still not implemented.
- Durable storage and retention decisions remain future work.
- DB/auth-backed export route tests remain future work.

## Recommended Next Step

Continue to Step 143 only inside the approved self-driving batch if the worktree remains clean and validation passes. Step 143 should be the final self-driving batch summary and should not execute a sixth loop.
