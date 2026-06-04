# Step 159 - Admin Export Audit Owner Decision Workbook

## Latest Commit Verification

Latest commit verified before this batch:

```text
98f6181 docs: plan admin export audit logging readiness batch
```

Initial working tree status was clean and staged files were none.

## Step 149-158 Verification Result

Steps 149 through 158 were verified from committed reports. They established that Step 148 added bounded fail-open sanitized admin export audit logging, but did not add durable storage, retention policy, role-separated permissions, masking/redaction, SKU policy finalization, or DB/auth-backed route execution.

## Decision Areas Blocking Implementation

Implementation is blocked by unresolved decisions in these areas:

- durable storage path;
- fail-open vs fail-closed future policy;
- retention;
- audit-log access;
- audit-log export;
- role-separated report export permissions;
- masking/redaction;
- SKU sensitivity;
- DB/auth-backed QA fixture approval;
- compliance language.

## Decision Table

| Decision area | Recommended pre-launch default | Alternatives | Tradeoffs | Owner approval needed | Implementation-ready | Safest next action |
| --- | --- | --- | --- | --- | --- | --- |
| Durable storage path | Keep Step 148 console/security logging; design no-DB adapter first | Existing admin audit log, dedicated DB table, provider logs, external SIEM | Adapter avoids premature storage choice but does not create durable audit trail | Yes for storage | No | No-DB adapter/interface design |
| Future fail policy | Keep fail-open | Fail-closed after durable storage | Fail-open preserves export behavior; fail-closed is stricter but risky | Yes for fail-closed | No | Keep fail-open |
| Retention | Local/staging short/disposable; production `OWNER_APPROVAL_REQUIRED` | Medium or long production retention | Longer retention aids investigation but increases governance burden | Yes | No | Owner decision workbook |
| Audit-log access | No audit-log UI/export yet | Super admin only, audit role, support workflow | Restriction reduces exposure but needs permissions | Yes | No | Define policy before UI |
| Audit-log export | Do not add | Restricted export later | Avoids new sensitive export surface | Yes | No | Keep disabled |
| Report export permissions | Keep current admin guard until tests/policy exist | Split per report type | Preserves behavior but broad access remains | Yes for split | No | Plan tests first |
| Masking/redaction | Keep CSV unchanged | Redacted endpoints, role-based masking | Preserves existing CSV contract; sensitive fields remain | Yes | No | Defer until compatibility decision |
| SKU sensitivity | Keep SKU unchanged; classify `unknown-needs-policy` | Mark public, restrict, seller-scope later | Avoids false safety claim | Yes | No | Revisit before seller/role split |
| DB/auth QA fixtures | Do not execute yet | Synthetic local route tests | Avoids credentials/PII risk until approved | Yes | No | Prepare go/no-go checklist |
| Compliance language | Use bounded telemetry language only | Strong compliance claims | Honest and low-risk; weaker marketing language | No for safe language; yes for stronger claims | Yes for docs | Keep safe language |

## Decisions Codex Can Safely Default

- Keep Step 148 fail-open.
- Do not claim durable audit compliance.
- Keep CSV exports unchanged.
- Keep current admin access unchanged.
- Treat customers export as highest sensitivity.
- Treat orders export as high sensitivity.
- Treat products export as business-sensitive.
- Keep SKU as `unknown-needs-policy`.
- Do not add audit-log export.
- Do not implement masking/redaction yet.
- Use only bounded sanitized telemetry language.

## Decisions Requiring Owner Approval

- Durable audit storage provider/path.
- Production retention period.
- Audit-log viewer/export permissions.
- Whether future logging should ever become fail-closed.
- Role-separated report export permissions.
- Masking/redaction behavior.
- SKU policy for seller marketplace and lower roles.
- DB/auth-backed route execution fixtures.
- Compliance claims beyond bounded telemetry.

## Recommended Next Loop

Proceed to Loop 160: pre-launch default policy.
