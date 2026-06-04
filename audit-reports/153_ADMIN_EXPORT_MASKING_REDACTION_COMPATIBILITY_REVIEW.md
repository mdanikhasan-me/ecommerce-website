# Step 153 - Admin Export Masking Redaction Compatibility Review

## Current Step 148 Behavior

Step 148 added sanitized audit logging only.

CSV output remains unchanged. No masking, redaction, field removal, field reordering, or new export endpoint was added.

## Exports Likely Containing Sensitive Data

| Export | Likely sensitivity |
| --- | --- |
| `customers` | Highest PII risk: customer names, emails, phones, roles, account activity fields. |
| `orders` | Customer PII plus order/payment-sensitive operational fields. |
| `products` | Business-sensitive inventory, sold count, and SKU policy uncertainty. |

## Masking/Redaction Options

| Option | Benefit | Risk |
| --- | --- | --- |
| No redaction for internal admin exports | Preserves current CSV consumers and operational workflows | Requires strict permissions and handling guidance |
| Partial masking for lower roles | Reduces accidental PII exposure | Adds role complexity and can break CSV expectations |
| Separate redacted export endpoints later | Keeps current exports stable while offering safer output | More routes/tests/documentation |
| Field-level permission-based export later | Fine-grained control | Highest complexity and largest testing burden |

## Compatibility Risks With Existing CSV Consumers

Masking/redaction could break:

- admin workflows expecting exact field names;
- spreadsheet formulas or import templates;
- reconciliation processes;
- inventory workflows;
- order support workflows;
- downstream manual processes.

## Tests Required Before Masking/Redaction

Future tests must prove:

- field names and order for each export variant;
- masked values do not expose raw PII;
- unmasked values are available only to approved roles;
- current CSV export remains stable if preserved;
- audit logging records report type and sensitivity classification without raw values;
- response headers remain correct.

## Why Masking Should Not Be Mixed With Audit Logging Integration

Masking changes export semantics. Audit logging observes export activity.

Mixing them would make it difficult to identify whether a failure came from logging, permissions, masking, or CSV generation. Step 148 correctly kept CSV output unchanged.

## Future Staged Implementation Path

Recommended later sequence:

1. policy decision for which roles can see which fields;
2. no-DB helper tests for redaction helpers;
3. DB/auth-backed fixture tests for exact CSV output;
4. route integration behind explicit permission checks;
5. audit logging verification;
6. documentation update.

## Remaining Risks

- Current CSV exports may include unmasked sensitive data for all currently authorized admins.
- Role separation is not implemented.
- Redacted export contracts are not defined.

## Recommended Next Loop

Proceed to Loop 154: SKU sensitivity decision review.
