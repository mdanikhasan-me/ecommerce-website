# Step 164 - Admin Export Masking SKU Policy Defaults

## Current State

CSV output is unchanged. Step 148 added audit telemetry only.

## Recommended Masking Default

Default:

- do not mask existing exports yet;
- do not create redacted endpoints yet;
- require role/permission policy first;
- require CSV compatibility tests before any field-level change.

## Recommended SKU Default

Default:

- keep SKU unchanged for the current products export;
- classify SKU as `unknown-needs-policy`;
- do not claim SKU is non-sensitive;
- do not expose SKU to future seller marketplace paths without seller-scope design.

## Future Branches

| Branch | Description | Requirement |
| --- | --- | --- |
| Internal full export | Current-style full export for highly trusted roles | Owner-approved permission policy |
| Restricted lower-role export | Reduced fields for lower roles | Role split and tests |
| Redacted export | Masked PII or sensitive fields | Compatibility decision and CSV tests |
| Seller-scoped export | Seller-visible data only | Seller marketplace scope design |

## Tests Needed Later

- CSV field order for full export.
- Masked field behavior for redacted export.
- Restricted role behavior.
- Seller-scoped SKU isolation.
- Audit logs do not store raw SKU values.
- Existing CSV consumers remain compatible where promised.

## Stop Conditions

Stop masking/SKU work if:

- field-level policy is not approved;
- it would alter CSV contract without tests;
- seller marketplace scope is unclear;
- it mixes with durable storage or route logging behavior changes.

## Recommended Next Loop

Proceed to Loop 165: DB/auth QA go/no-go workbook.
