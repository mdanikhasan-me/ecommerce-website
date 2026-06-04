# Step 166 - Admin Export Implementation Sequence Decision

## Option Comparison

| Option | Benefit | Risk | Blocker | Required approval | Validation burden | Safe next? |
| --- | --- | --- | --- | --- | --- | --- |
| A. No-DB durable audit adapter/interface and tests | Advances storage readiness without route/DB execution | Could over-design if too broad | None if bounded | Source/test approval | Targeted no-DB tests plus full validation | Yes |
| B. DB/auth-backed QA execution | Proves Step 148 route behavior under auth | Route execution, fixture, DB, PII risk | Auth/local fixture approval | Explicit route/DB/auth approval | DB/auth focused tests plus full validation | Not yet |
| C. Durable storage implementation | Creates persistent audit trail | Schema/storage/access/retention risk | Owner policy and DB readiness | Owner/security/DB approval | High | No |
| D. Role-separated permission implementation | Reduces broad admin export access | Auth/UI regressions | Permission policy and tests | Owner/product approval | High | No |
| E. Masking/redaction implementation | Reduces CSV sensitivity | CSV compatibility breakage | Policy and fixture tests | Owner/product approval | High | No |
| F. Continue policy-only work | Avoids implementation risk | May delay useful engineering | Owner decisions still open | None | Low | Yes but less useful |

## Recommended Next Step

Recommended next implementation sequence:

1. no-DB durable export audit adapter/interface design and tests;
2. no route integration;
3. no DB writes;
4. no Prisma schema change;
5. no durable storage claim;
6. no permission/masking changes.

This is the safest implementation step because it creates a tested boundary for future storage without executing routes or committing to provider/DB schema.

## Alternative Path

DB/auth QA can become next only if the owner explicitly approves route execution, synthetic fixtures, local service checks, and sanitized log capture.

## Recommended Next Loop

Proceed to Loop 167: batch summary.
