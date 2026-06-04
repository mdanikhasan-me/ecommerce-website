# Step 152 - Admin Export Role-Separated Permission Review

## Current Admin Export Permission Assumption

Current admin report export access is guarded by `requireAdminSession()`, which accepts existing `ADMIN` and `SUPER_ADMIN` roles.

Step 148 did not change this behavior.

## Why All-Admin Export Access May Be Too Broad Later

The current broad admin model may be too broad because:

- customers export can contain direct customer PII;
- orders export can contain customer and order/payment-sensitive fields;
- products export can contain business-sensitive inventory and sales data;
- audit-log viewing is a separate sensitivity class;
- future seller marketplace roles may require more granular boundaries.

## Possible Permission Levels

Future permissions could separate:

- view dashboard reports;
- export products;
- export orders;
- export customers;
- view export audit logs;
- export audit logs;
- manage audit retention.

## Highest-Risk Exports

Highest risk:

1. customers export: direct PII and account-related fields;
2. orders export: customer/order/payment-sensitive operational data;
3. products export: business-sensitive inventory/sales and SKU policy uncertainty.

## Recommended First Role Split Later

Recommended future first split:

- keep dashboard report viewing separate from export permission;
- require `SUPER_ADMIN` or a dedicated permission for customers export;
- require a dedicated permission for orders export;
- allow products export only after SKU/business sensitivity policy is approved;
- keep audit-log viewing separate from report export permissions.

## No-Runtime-Change Compatibility Plan

No permission change should be made until:

- current admin workflows are documented;
- frontend/admin caller expectations are mapped;
- DB/auth-backed tests can prove unchanged response behavior where needed;
- user-facing docs explain new permission failures;
- audit logging continues to record bounded blocked events.

## Tests Needed Before Role Separation

Future tests should cover:

- admin can view dashboard but cannot export restricted report type;
- super admin can export restricted report type;
- unauthorized/non-admin response contract remains stable;
- forbidden export does not return CSV;
- blocked export logs safe bounded metadata;
- no actor identifiers or raw query values are logged.

## Stop Conditions

Stop a future role-separation implementation if:

- it changes response shapes without approval;
- it requires a schema migration not approved;
- it breaks existing admin navigation unexpectedly;
- it needs real credentials or production data;
- it mixes role changes with masking or durable storage work.

## Remaining Risks

- All current admin roles still share export access.
- Dedicated permissions do not exist yet.
- Future seller roles may require a broader permission redesign.

## Recommended Next Loop

Proceed to Loop 153: masking/redaction compatibility review.
