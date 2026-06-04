# Step 163 - Admin Export Permission Defaults And Escalation

## Current State

`requireAdminSession()` accepts the current admin roles for the admin report export route. Step 148 did not change this.

## Recommended Future Permissions

Potential future permissions:

- `reports:view`
- `reports:export:products`
- `reports:export:orders`
- `reports:export:customers`
- `audit:exportLogs:view`
- `audit:exportLogs:export`
- `audit:retention:manage`

## Recommended Sensitivity Order

1. Customers: highest sensitivity.
2. Orders: high sensitivity.
3. Products: business-sensitive.

## Default Pre-Launch Action

Do not change current permissions yet.

Reason:

- DB/auth-backed tests are not ready in this batch.
- Admin UI and caller compatibility need mapping.
- Owner has not approved a permission split.
- Masking/redaction and SKU policy remain open.

## Escalation Path

Recommended future escalation:

1. keep current admin access for now;
2. add no-DB permission helper tests;
3. create DB/auth fixtures;
4. split dashboard viewing from export permissions;
5. restrict customers export first;
6. restrict orders export next;
7. decide product/SKU export policy before products split;
8. keep audit-log viewer/export permissions separate.

## Route/Test Implications

Future tests must prove:

- current response contracts remain stable;
- restricted users do not receive CSV;
- blocked attempts log bounded metadata;
- no actor identifiers or raw query values are logged;
- admin UI reflects permission boundaries without exposing hidden actions.

## Admin UI Implications

Future UI work may need:

- disabled or hidden export actions based on permission;
- clear sensitivity labels;
- no exposure of audit logs to broad admin roles;
- separate audit-log viewer area if approved.

## Stop Conditions

Stop future permission work if:

- it changes route response shapes without approval;
- DB/auth fixtures are unsafe;
- source changes mix with masking or durable storage;
- it requires real credentials or production data.

## Recommended Next Loop

Proceed to Loop 164: masking and SKU policy defaults.
