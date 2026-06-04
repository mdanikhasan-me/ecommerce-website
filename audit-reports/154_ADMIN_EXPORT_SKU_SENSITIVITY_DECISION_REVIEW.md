# Step 154 - Admin Export SKU Sensitivity Decision Review

## Why SKU May Be Business-Sensitive

SKU values can reveal:

- supplier or catalog structure;
- inventory organization;
- product sourcing patterns;
- internal reconciliation conventions;
- seller/vendor identifiers in a future marketplace.

## When SKU Is Safe To Export

SKU is safer to export when:

- the recipient is trusted and authorized;
- SKU values are already public or not business-sensitive;
- exports are used for inventory reconciliation;
- retention and sharing rules are documented;
- the export is not shared outside approved operations.

## When SKU Should Be Restricted

SKU should be restricted when:

- lower-privilege admins do not need inventory details;
- sellers should see only their own SKU namespace later;
- SKU encodes supplier, cost, warehouse, or private operational meaning;
- exports may be shared externally;
- SKU is used in fraud or abuse workflows.

## Relationship To Future Seller Marketplace

Future seller marketplace work may require:

- seller-scoped SKU visibility;
- platform SKU vs seller SKU separation;
- seller-specific export permissions;
- avoiding leakage across sellers;
- audit logs for seller exports.

Do not finalize SKU policy until seller marketplace boundaries are approved.

## Relationship To Inventory/Order Reconciliation

SKU may be important for:

- stock adjustments;
- warehouse picking;
- product matching;
- returns investigation;
- order reconciliation;
- supplier operations.

Any restriction must preserve legitimate operational workflows.

## Recommended Current Policy Branch

Current recommended branch:

- keep the existing products CSV unchanged for current admins;
- classify SKU as `unknown-needs-policy`;
- do not expand SKU access;
- do not claim SKU is non-sensitive;
- revisit before role-separated exports or seller marketplace work.

## Tests Needed Later

Future tests should prove:

- SKU field order remains stable for the existing export;
- restricted roles cannot export SKU if policy requires restriction;
- seller users cannot see other sellers' SKU values;
- audit logs do not store SKU values;
- product export sensitivity labels remain accurate.

## What Not To Change Now

Do not:

- remove SKU from CSV;
- mask SKU;
- add seller-aware SKU logic;
- alter product export headers;
- change product export response behavior;
- claim SKU is safe for all contexts.

## Remaining Risks

- SKU remains policy-ambiguous.
- Product export may expose business-sensitive operational data.
- Seller marketplace design may require later changes.

## Recommended Next Loop

Proceed to Loop 155: compliance claims boundary.
